import { NextResponse } from "next/server";
import { db } from "@/drizzle";
import { alert_deliveries, alerts, projects, webhook_endpoints } from "@/drizzle/schema";
import { eq, and, lte, sql } from "drizzle-orm";
import { deliverWebhook } from "@/lib/webhook";
import { logger } from "@/lib/logger";
import { env } from "@/config/env";

export const dynamic = "force-dynamic";
export const maxDuration = 60;

const MAX_ATTEMPTS = 5;
const BACKOFF_BASE_MS = 60_000;
const BATCH_SIZE = 25;

export async function GET(request: Request) {
  if (env.CRON_SECRET && request.headers.get("authorization") !== `Bearer ${env.CRON_SECRET}`) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const due = await db
    .select({
      id: alert_deliveries.id,
      alert_id: alert_deliveries.alert_id,
      channel: alert_deliveries.channel,
      payload: alert_deliveries.payload,
      status: alert_deliveries.status,
      attempts: alert_deliveries.attempts,
      next_attempt_at: alert_deliveries.next_attempt_at,
      workspaceId: projects.workspace_id,
    })
    .from(alert_deliveries)
    .innerJoin(alerts, eq(alert_deliveries.alert_id, alerts.id))
    .innerJoin(projects, eq(alerts.project_id, projects.id))
    .where(
      and(
        eq(alert_deliveries.status, "pending"),
        lte(alert_deliveries.next_attempt_at, new Date()),
      ),
    )
    .limit(BATCH_SIZE);

  if (due.length === 0) {
    return NextResponse.json({ processed: 0 });
  }

  const workspaceIds = [...new Set(due.map((d) => d.workspaceId))];

  const endpoints = await db
    .select()
    .from(webhook_endpoints)
    .where(
      and(
        sql`${webhook_endpoints.workspace_id} = any(${workspaceIds}::uuid[])`,
        eq(webhook_endpoints.active, true),
      ),
    );

  const endpointsByWorkspace = new Map<string, typeof endpoints>();
  for (const endpoint of endpoints) {
    const list = endpointsByWorkspace.get(endpoint.workspace_id) ?? [];
    list.push(endpoint);
    endpointsByWorkspace.set(endpoint.workspace_id, list);
  }

  let delivered = 0;
  let failed = 0;

  for (const delivery of due) {
    if (delivery.channel !== "webhook") {
      await db
        .update(alert_deliveries)
        .set({ status: "failed", last_error: "Unsupported channel" })
        .where(eq(alert_deliveries.id, delivery.id));
      failed++;
      continue;
    }

    const targets = endpointsByWorkspace.get(delivery.workspaceId);
    if (!targets || targets.length === 0) {
      await db
        .update(alert_deliveries)
        .set({ status: "failed", last_error: "No active webhook endpoints configured" })
        .where(eq(alert_deliveries.id, delivery.id));
      failed++;
      continue;
    }

    let allOk = true;
    for (const target of targets) {
      const result = await deliverWebhook(target.url, delivery.payload, target.secret ?? undefined);
      if (!result.ok) {
        allOk = false;
        logger.warn(
          { deliveryId: delivery.id, url: target.url, error: result.error },
          "webhook delivery attempt failed",
        );
      }
    }

    if (allOk) {
      await db
        .update(alert_deliveries)
        .set({ status: "delivered" })
        .where(eq(alert_deliveries.id, delivery.id));
      delivered++;
    } else {
      const attempts = delivery.attempts + 1;
      if (attempts >= MAX_ATTEMPTS) {
        await db
          .update(alert_deliveries)
          .set({ status: "failed", attempts, last_error: "Max attempts reached" })
          .where(eq(alert_deliveries.id, delivery.id));
        failed++;
      } else {
        const nextAttemptAt = new Date(Date.now() + BACKOFF_BASE_MS * Math.pow(2, attempts - 1));
        await db
          .update(alert_deliveries)
          .set({ attempts, next_attempt_at: nextAttemptAt })
          .where(eq(alert_deliveries.id, delivery.id));
        failed++;
      }
    }
  }

  logger.info({ delivered, failed, remaining: due.length }, "alert delivery batch complete");

  return NextResponse.json({ processed: due.length, delivered, failed });
}
