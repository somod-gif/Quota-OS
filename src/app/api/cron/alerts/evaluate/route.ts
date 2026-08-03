import { NextResponse } from "next/server";
import { db } from "@/drizzle";
import { alerts, alert_deliveries, projects, usage_records } from "@/drizzle/schema";
import { eq, and, gte, sql } from "drizzle-orm";
import { createWebhookPayload } from "@/lib/webhook";
import { logger } from "@/lib/logger";
import { env } from "@/config/env";

export const dynamic = "force-dynamic";
export const maxDuration = 60;

export async function GET(request: Request) {
  if (env.CRON_SECRET && request.headers.get("authorization") !== `Bearer ${env.CRON_SECRET}`) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const enabledAlerts = await db
    .select({
      alert: alerts,
      projectName: projects.name,
      workspaceId: projects.workspace_id,
    })
    .from(alerts)
    .innerJoin(projects, eq(alerts.project_id, projects.id))
    .where(eq(alerts.enabled, true));

  let evaluated = 0;
  let triggered = 0;

  for (const { alert, projectName } of enabledAlerts) {
    evaluated++;

    const since = new Date(Date.now() - alert.window_ms);

    const [stats] = await db
      .select({
        requests: sql<number>`coalesce(sum(${usage_records.requests}), 0)`,
        errors: sql<number>`coalesce(sum(${usage_records.errors}), 0)`,
        avgLatency: sql<number>`coalesce(avg(${usage_records.avg_latency_ms}), 0)`,
        rateLimited: sql<number>`coalesce(sum(${usage_records.rate_limited}), 0)`,
      })
      .from(usage_records)
      .where(
        and(
          eq(usage_records.project_id, alert.project_id),
          gte(usage_records.timestamp, since),
        ),
      );

    const actualValue = computeMetric(alert.metric, stats);
    const breached = compare(actualValue, alert.condition, alert.threshold);

    if (!breached) continue;

    triggered++;

    const payload = createWebhookPayload({
      alertId: alert.id,
      alertName: alert.name,
      projectName,
      metric: alert.metric,
      condition: alert.condition,
      threshold: alert.threshold,
      actualValue,
      windowMs: alert.window_ms,
      triggeredAt: new Date().toISOString(),
    });

    for (const channel of alert.channels) {
      if (channel === "webhook") {
        await db.insert(alert_deliveries).values({
          alert_id: alert.id,
          channel,
          payload: payload as unknown as Record<string, unknown>,
          status: "pending",
        });
      }
    }

    await db
      .update(alerts)
      .set({ last_triggered_at: new Date() })
      .where(eq(alerts.id, alert.id));
  }

  logger.info({ evaluated, triggered }, "alert evaluation complete");

  return NextResponse.json({ evaluated, triggered });
}

type Stats = { requests: number; errors: number; avgLatency: number; rateLimited: number };

function computeMetric(metric: string, stats: Stats): number {
  switch (metric) {
    case "error_rate":
      return stats.requests > 0 ? (stats.errors / stats.requests) * 100 : 0;
    case "latency":
      return stats.avgLatency;
    case "rate_limit":
      return stats.rateLimited;
    case "usage":
    case "quota":
      return stats.requests;
    default:
      return 0;
  }
}

function compare(actual: number, condition: string, threshold: number): boolean {
  switch (condition) {
    case "gt":
      return actual > threshold;
    case "gte":
      return actual >= threshold;
    case "lt":
      return actual < threshold;
    case "lte":
      return actual <= threshold;
    case "eq":
      return actual === threshold;
    default:
      return false;
  }
}
