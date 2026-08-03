"use server";

import { db } from "@/drizzle";
import { alerts, projects } from "@/drizzle/schema";
import { eq, inArray } from "drizzle-orm";
import { requireAuth } from "@/lib/auth";
import { requireWorkspaceAccess } from "@/lib/authorization";
import { revalidatePath } from "next/cache";
import type { Alert, InsertAlert } from "@/types";

function serializeAlert(a: typeof alerts.$inferSelect): Alert {
  return {
    id: a.id,
    project_id: a.project_id,
    name: a.name,
    metric: a.metric as Alert["metric"],
    condition: a.condition as Alert["condition"],
    threshold: a.threshold,
    window_ms: a.window_ms,
    channels: a.channels as Alert["channels"],
    enabled: a.enabled,
    last_triggered_at: a.last_triggered_at?.toISOString() ?? null,
    created_at: a.created_at.toISOString(),
    updated_at: a.updated_at.toISOString(),
  };
}

export async function getAlerts(
  workspaceId: string,
  options?: { limit?: number; offset?: number },
) {
  const user = await requireAuth();
  await requireWorkspaceAccess(workspaceId, user.id);

  const workspaceProjects = await db
    .select({ id: projects.id })
    .from(projects)
    .where(eq(projects.workspace_id, workspaceId));

  if (workspaceProjects.length === 0) return { data: [] as Alert[], hasMore: false };

  const projectIds = workspaceProjects.map((p) => p.id);

  const limit = Math.min(options?.limit ?? 50, 100);
  const offset = options?.offset ?? 0;

  const result = await db
    .select()
    .from(alerts)
    .where(inArray(alerts.project_id, projectIds))
    .orderBy(alerts.created_at)
    .limit(limit + 1)
    .offset(offset);

  const hasMore = result.length > limit;
  const rows = result.slice(0, limit);

  return { data: rows.map(serializeAlert), hasMore };
}

export async function createAlert(
  projectId: string,
  data: InsertAlert,
) {
  const user = await requireAuth();

  const [project] = await db.select().from(projects).where(eq(projects.id, projectId)).limit(1);
  if (!project) return { error: "Project not found" };

  await requireWorkspaceAccess(project.workspace_id, user.id, "admin");

  const [inserted] = await db.insert(alerts).values(data).returning();

  revalidatePath("/dashboard/alerts");
  return { data: serializeAlert(inserted) };
}

export async function updateAlert(
  alertId: string,
  data: Partial<InsertAlert> & { enabled?: boolean },
) {
  const user = await requireAuth();

  const [existing] = await db.select().from(alerts).where(eq(alerts.id, alertId)).limit(1);
  if (!existing) return { error: "Alert not found" };

  const [project] = await db
    .select({ workspace_id: projects.workspace_id })
    .from(projects)
    .where(eq(projects.id, existing.project_id))
    .limit(1);
  if (!project) return { error: "Associated project not found" };

  await requireWorkspaceAccess(project.workspace_id, user.id, "admin");

  const updateData: Record<string, unknown> = {};
  if (data.name !== undefined) updateData.name = data.name;
  if (data.metric !== undefined) updateData.metric = data.metric;
  if (data.condition !== undefined) updateData.condition = data.condition;
  if (data.threshold !== undefined) updateData.threshold = data.threshold;
  if (data.window_ms !== undefined) updateData.window_ms = data.window_ms;
  if (data.channels !== undefined) updateData.channels = data.channels;
  if (data.enabled !== undefined) updateData.enabled = data.enabled;

  if (Object.keys(updateData).length === 0) return { error: "No fields to update" };

  const [updated] = await db
    .update(alerts)
    .set(updateData)
    .where(eq(alerts.id, alertId))
    .returning();

  revalidatePath("/dashboard/alerts");
  return { data: serializeAlert(updated) };
}

export async function deleteAlert(alertId: string) {
  const user = await requireAuth();

  const [existing] = await db.select().from(alerts).where(eq(alerts.id, alertId)).limit(1);
  if (!existing) return { error: "Alert not found" };

  const [project] = await db
    .select({ workspace_id: projects.workspace_id })
    .from(projects)
    .where(eq(projects.id, existing.project_id))
    .limit(1);
  if (!project) return { error: "Associated project not found" };

  await requireWorkspaceAccess(project.workspace_id, user.id, "admin");

  await db.delete(alerts).where(eq(alerts.id, alertId));

  revalidatePath("/dashboard/alerts");
  return { success: true };
}
