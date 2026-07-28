"use server";

import { db } from "@/drizzle";
import { request_logs, usage_records, projects } from "@/drizzle/schema";
import { eq, and, gte, lte, inArray, desc, sql } from "drizzle-orm";
import { requireAuth } from "@/lib/auth";
import { requireWorkspaceAccess } from "@/lib/authorization";
import type { RequestLog, UsageSummary, UsageSeries } from "@/types";

export async function getLogs(
  workspaceId: string,
  options?: {
    limit?: number;
    offset?: number;
    method?: string;
    statusMin?: number;
    statusMax?: number;
    search?: string;
  },
) {
  const user = await requireAuth();
  await requireWorkspaceAccess(workspaceId, user.id);

  const workspaceProjects = await db
    .select({ id: projects.id })
    .from(projects)
    .where(eq(projects.workspace_id, workspaceId));

  if (workspaceProjects.length === 0) return [];

  const projectIds = workspaceProjects.map((p) => p.id);

  const conditions: ReturnType<typeof and>[] = [inArray(request_logs.project_id, projectIds)];

  if (options?.method) {
    conditions.push(eq(request_logs.method, options.method.toUpperCase()));
  }
  if (options?.statusMin !== undefined) {
    conditions.push(gte(request_logs.status_code, options.statusMin));
  }
  if (options?.statusMax !== undefined) {
    conditions.push(lte(request_logs.status_code, options.statusMax));
  }
  if (options?.search) {
    conditions.push(
      sql`(${request_logs.path} ILIKE ${"%" + options.search + "%"} OR ${request_logs.ip_address} ILIKE ${"%" + options.search + "%"})`,
    );
  }

  const limit = options?.limit ?? 50;
  const offset = options?.offset ?? 0;

  const result = await db
    .select()
    .from(request_logs)
    .where(and(...conditions))
    .orderBy(desc(request_logs.created_at))
    .limit(limit)
    .offset(offset);

  return result.map((l) => ({
    id: l.id,
    project_id: l.project_id,
    endpoint_id: l.endpoint_id,
    api_key_id: l.api_key_id,
    method: l.method,
    path: l.path,
    status_code: l.status_code,
    latency_ms: l.latency_ms,
    ip_address: l.ip_address,
    user_agent: l.user_agent,
    blocked: l.blocked,
    rate_limited: l.rate_limited,
    cached: l.cached,
    error: l.error,
    request_headers: l.request_headers as Record<string, string> | null,
    response_headers: l.response_headers as Record<string, string> | null,
    request_body_size: l.request_body_size,
    response_body_size: l.response_body_size,
    created_at: l.created_at.toISOString(),
  })) satisfies RequestLog[];
}

export async function getUsageOverview(workspaceId: string) {
  const user = await requireAuth();
  await requireWorkspaceAccess(workspaceId, user.id);

  const workspaceProjects = await db
    .select({ id: projects.id })
    .from(projects)
    .where(eq(projects.workspace_id, workspaceId));

  if (workspaceProjects.length === 0) {
    return { summary: null as unknown as UsageSummary, series: [] as UsageSeries[] };
  }

  const projectIds = workspaceProjects.map((p) => p.id);

  const sevenDaysAgo = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000);

  const recentRecords = await db
    .select()
    .from(usage_records)
    .where(
      and(
        inArray(usage_records.project_id, projectIds),
        gte(usage_records.timestamp, sevenDaysAgo),
      ),
    )
    .orderBy(usage_records.timestamp);

  if (recentRecords.length === 0) {
    return {
      summary: {
        totalRequests: 0,
        totalBlocked: 0,
        totalRateLimited: 0,
        totalCached: 0,
        totalErrors: 0,
        avgLatency: 0,
        errorRate: 0,
      },
      series: [],
    };
  }

  const dayBuckets = new Map<string, UsageSeries>();
  for (const r of recentRecords) {
    const day = r.timestamp.toISOString().slice(0, 10);
    const existing = dayBuckets.get(day) ?? {
      timestamp: day,
      requests: 0,
      blocked: 0,
      rate_limited: 0,
      errors: 0,
      latency: 0,
    };
    existing.requests += r.requests;
    existing.blocked += r.blocked;
    existing.rate_limited += r.rate_limited;
    existing.errors += r.errors;
    existing.latency = Math.max(existing.latency, r.avg_latency_ms);
    dayBuckets.set(day, existing);
  }

  const series = Array.from(dayBuckets.values()).sort((a, b) => a.timestamp.localeCompare(b.timestamp));

  const totalRequests = recentRecords.reduce((s, r) => s + r.requests, 0);
  const totalBlocked = recentRecords.reduce((s, r) => s + r.blocked, 0);
  const totalRateLimited = recentRecords.reduce((s, r) => s + r.rate_limited, 0);
  const totalCached = recentRecords.reduce((s, r) => s + r.cached, 0);
  const totalErrors = recentRecords.reduce((s, r) => s + r.errors, 0);
  const avgLatency =
    recentRecords.reduce((s, r) => s + r.avg_latency_ms * r.requests, 0) / Math.max(totalRequests, 1);

  const summary: UsageSummary = {
    totalRequests,
    totalBlocked,
    totalRateLimited,
    totalCached,
    totalErrors,
    avgLatency: Math.round(avgLatency),
    errorRate: totalRequests > 0 ? Math.round((totalErrors / totalRequests) * 100) : 0,
  };

  return { summary, series };
}
