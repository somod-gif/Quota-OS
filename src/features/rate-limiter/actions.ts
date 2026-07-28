"use server";

import { db } from "@/drizzle";
import { rate_limits, projects } from "@/drizzle/schema";
import { eq, and, inArray } from "drizzle-orm";
import { requireAuth } from "@/lib/auth";
import { requireWorkspaceAccess } from "@/lib/authorization";
import { revalidatePath } from "next/cache";
import type { RateLimit } from "@/types";

function serializeRule(r: typeof rate_limits.$inferSelect): RateLimit {
  return {
    id: r.id,
    project_id: r.project_id,
    name: r.name,
    max_requests: r.max_requests,
    window_ms: r.window_ms,
    strategy: r.strategy as RateLimit["strategy"],
    scope: r.scope as RateLimit["scope"],
    status: r.status as RateLimit["status"],
    created_at: r.created_at.toISOString(),
    updated_at: r.updated_at.toISOString(),
  };
}

export async function getRateLimits(workspaceId: string) {
  const user = await requireAuth();
  await requireWorkspaceAccess(workspaceId, user.id);

  const workspaceProjects = await db
    .select({ id: projects.id })
    .from(projects)
    .where(eq(projects.workspace_id, workspaceId));

  if (workspaceProjects.length === 0) return [];

  const projectIds = workspaceProjects.map((p) => p.id);

  const result = await db
    .select()
    .from(rate_limits)
    .where(and(inArray(rate_limits.project_id, projectIds), eq(rate_limits.status, "active")))
    .orderBy(rate_limits.created_at);

  return result.map(serializeRule);
}

export async function getAllRateLimits(workspaceId: string) {
  const user = await requireAuth();
  await requireWorkspaceAccess(workspaceId, user.id);

  const workspaceProjects = await db
    .select({ id: projects.id })
    .from(projects)
    .where(eq(projects.workspace_id, workspaceId));

  if (workspaceProjects.length === 0) return [];

  const projectIds = workspaceProjects.map((p) => p.id);

  const result = await db
    .select()
    .from(rate_limits)
    .where(inArray(rate_limits.project_id, projectIds))
    .orderBy(rate_limits.created_at);

  return result.map(serializeRule);
}

export async function createRateLimit(
  projectId: string,
  data: {
    name: string;
    max_requests: number;
    window_ms: number;
    strategy: RateLimit["strategy"];
    scope: RateLimit["scope"];
  },
) {
  const user = await requireAuth();

  const [project] = await db.select().from(projects).where(eq(projects.id, projectId)).limit(1);
  if (!project) return { error: "Project not found" };

  await requireWorkspaceAccess(project.workspace_id, user.id, "admin");

  const [inserted] = await db
    .insert(rate_limits)
    .values({
      project_id: projectId,
      name: data.name,
      max_requests: data.max_requests,
      window_ms: data.window_ms,
      strategy: data.strategy,
      scope: data.scope,
      status: "active",
    })
    .returning();

  revalidatePath("/dashboard/rate-limits");
  return { data: serializeRule(inserted) };
}

export async function updateRateLimit(
  ruleId: string,
  data: {
    name?: string;
    max_requests?: number;
    window_ms?: number;
    strategy?: RateLimit["strategy"];
    scope?: RateLimit["scope"];
    status?: RateLimit["status"];
  },
) {
  const user = await requireAuth();

  const [existing] = await db.select().from(rate_limits).where(eq(rate_limits.id, ruleId)).limit(1);
  if (!existing) return { error: "Rate limit rule not found" };

  const [project] = await db
    .select({ workspace_id: projects.workspace_id })
    .from(projects)
    .where(eq(projects.id, existing.project_id))
    .limit(1);
  if (!project) return { error: "Associated project not found" };

  await requireWorkspaceAccess(project.workspace_id, user.id, "admin");

  const updateData: Record<string, unknown> = {};
  if (data.name !== undefined) updateData.name = data.name;
  if (data.max_requests !== undefined) updateData.max_requests = data.max_requests;
  if (data.window_ms !== undefined) updateData.window_ms = data.window_ms;
  if (data.strategy !== undefined) updateData.strategy = data.strategy;
  if (data.scope !== undefined) updateData.scope = data.scope;
  if (data.status !== undefined) updateData.status = data.status;

  if (Object.keys(updateData).length === 0) return { error: "No fields to update" };

  const [updated] = await db
    .update(rate_limits)
    .set(updateData)
    .where(eq(rate_limits.id, ruleId))
    .returning();

  revalidatePath("/dashboard/rate-limits");
  return { data: serializeRule(updated) };
}

export async function deleteRateLimit(ruleId: string) {
  const user = await requireAuth();

  const [existing] = await db.select().from(rate_limits).where(eq(rate_limits.id, ruleId)).limit(1);
  if (!existing) return { error: "Rate limit rule not found" };

  const [project] = await db
    .select({ workspace_id: projects.workspace_id })
    .from(projects)
    .where(eq(projects.id, existing.project_id))
    .limit(1);
  if (!project) return { error: "Associated project not found" };

  await requireWorkspaceAccess(project.workspace_id, user.id, "admin");

  await db.delete(rate_limits).where(eq(rate_limits.id, ruleId));

  revalidatePath("/dashboard/rate-limits");
  return { success: true };
}
