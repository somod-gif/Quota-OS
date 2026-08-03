import { NextResponse } from "next/server";
import { db } from "@/drizzle";
import { request_logs, usage_records, alert_deliveries } from "@/drizzle/schema";
import { lt } from "drizzle-orm";
import { logger } from "@/lib/logger";
import { env } from "@/config/env";

export const dynamic = "force-dynamic";
export const maxDuration = 60;

const LOG_RETENTION_DAYS = 7;
const USAGE_RETENTION_DAYS = 90;

export async function GET(request: Request) {
  if (env.CRON_SECRET && request.headers.get("authorization") !== `Bearer ${env.CRON_SECRET}`) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const logsCutoff = new Date(Date.now() - LOG_RETENTION_DAYS * 24 * 60 * 60 * 1000);
  const usageCutoff = new Date(Date.now() - USAGE_RETENTION_DAYS * 24 * 60 * 60 * 1000);

  const oldLogs = await db.select({ id: request_logs.id }).from(request_logs).where(lt(request_logs.created_at, logsCutoff)).limit(1);
  const oldUsage = await db.select({ id: usage_records.id }).from(usage_records).where(lt(usage_records.timestamp, usageCutoff)).limit(1);

  await db.delete(request_logs).where(lt(request_logs.created_at, logsCutoff));
  await db.delete(usage_records).where(lt(usage_records.timestamp, usageCutoff));

  await db
    .update(alert_deliveries)
    .set({ status: "failed", last_error: "Expired" })
    .where(lt(alert_deliveries.created_at, new Date(Date.now() - 30 * 24 * 60 * 60 * 1000)));

  logger.info({ deletedLogs: oldLogs.length, deletedUsage: oldUsage.length }, "retention job complete");

  return NextResponse.json({
    deletedLogs: oldLogs.length,
    deletedUsage: oldUsage.length,
  });
}
