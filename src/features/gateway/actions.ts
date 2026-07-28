"use server";

import { db } from "@/drizzle";
import { gateway_endpoints, projects } from "@/drizzle/schema";
import { eq, and, inArray } from "drizzle-orm";
import { requireAuth } from "@/lib/auth";
import { requireWorkspaceAccess } from "@/lib/authorization";
import { revalidatePath } from "next/cache";
import type { GatewayEndpoint } from "@/types";

function serializeEndpoint(e: typeof gateway_endpoints.$inferSelect): GatewayEndpoint {
  return {
    id: e.id,
    project_id: e.project_id,
    name: e.name,
    path: e.path,
    method: e.method as GatewayEndpoint["method"],
    provider_id: e.provider_id,
    target_url: e.target_url,
    rate_limit_id: e.rate_limit_id,
    cache_ttl: e.cache_ttl,
    status: e.status as GatewayEndpoint["status"],
    created_at: e.created_at.toISOString(),
    updated_at: e.updated_at.toISOString(),
  };
}

export async function getEndpoints(workspaceId: string) {
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
    .from(gateway_endpoints)
    .where(and(inArray(gateway_endpoints.project_id, projectIds), eq(gateway_endpoints.status, "active")))
    .orderBy(gateway_endpoints.created_at);

  return result.map(serializeEndpoint);
}

export async function getAllEndpoints(workspaceId: string) {
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
    .from(gateway_endpoints)
    .where(inArray(gateway_endpoints.project_id, projectIds))
    .orderBy(gateway_endpoints.created_at);

  return result.map(serializeEndpoint);
}

export async function createEndpoint(
  projectId: string,
  data: {
    name: string;
    path: string;
    method: GatewayEndpoint["method"];
    target_url: string;
    provider_id?: string | null;
    rate_limit_id?: string | null;
    cache_ttl?: number | null;
  },
) {
  const user = await requireAuth();

  const [project] = await db.select().from(projects).where(eq(projects.id, projectId)).limit(1);
  if (!project) return { error: "Project not found" };

  await requireWorkspaceAccess(project.workspace_id, user.id, "admin");

  const [inserted] = await db
    .insert(gateway_endpoints)
    .values({
      project_id: projectId,
      name: data.name,
      path: data.path,
      method: data.method,
      target_url: data.target_url,
      provider_id: data.provider_id ?? null,
      rate_limit_id: data.rate_limit_id ?? null,
      cache_ttl: data.cache_ttl ?? null,
      status: "active",
    })
    .returning();

  revalidatePath("/dashboard/gateway");
  return { data: serializeEndpoint(inserted) };
}

export async function updateEndpoint(
  endpointId: string,
  data: {
    name?: string;
    path?: string;
    method?: GatewayEndpoint["method"];
    target_url?: string;
    provider_id?: string | null;
    rate_limit_id?: string | null;
    cache_ttl?: number | null;
    status?: GatewayEndpoint["status"];
  },
) {
  const user = await requireAuth();

  const [existing] = await db
    .select()
    .from(gateway_endpoints)
    .where(eq(gateway_endpoints.id, endpointId))
    .limit(1);
  if (!existing) return { error: "Endpoint not found" };

  const [project] = await db
    .select({ workspace_id: projects.workspace_id })
    .from(projects)
    .where(eq(projects.id, existing.project_id))
    .limit(1);
  if (!project) return { error: "Associated project not found" };

  await requireWorkspaceAccess(project.workspace_id, user.id, "admin");

  const updateData: Record<string, unknown> = {};
  if (data.name !== undefined) updateData.name = data.name;
  if (data.path !== undefined) updateData.path = data.path;
  if (data.method !== undefined) updateData.method = data.method;
  if (data.target_url !== undefined) updateData.target_url = data.target_url;
  if (data.provider_id !== undefined) updateData.provider_id = data.provider_id;
  if (data.rate_limit_id !== undefined) updateData.rate_limit_id = data.rate_limit_id;
  if (data.cache_ttl !== undefined) updateData.cache_ttl = data.cache_ttl;
  if (data.status !== undefined) updateData.status = data.status;

  if (Object.keys(updateData).length === 0) return { error: "No fields to update" };

  const [updated] = await db
    .update(gateway_endpoints)
    .set(updateData)
    .where(eq(gateway_endpoints.id, endpointId))
    .returning();

  revalidatePath("/dashboard/gateway");
  return { data: serializeEndpoint(updated) };
}

export async function deleteEndpoint(endpointId: string) {
  const user = await requireAuth();

  const [existing] = await db
    .select()
    .from(gateway_endpoints)
    .where(eq(gateway_endpoints.id, endpointId))
    .limit(1);
  if (!existing) return { error: "Endpoint not found" };

  const [project] = await db
    .select({ workspace_id: projects.workspace_id })
    .from(projects)
    .where(eq(projects.id, existing.project_id))
    .limit(1);
  if (!project) return { error: "Associated project not found" };

  await requireWorkspaceAccess(project.workspace_id, user.id, "admin");

  await db.delete(gateway_endpoints).where(eq(gateway_endpoints.id, endpointId));

  revalidatePath("/dashboard/gateway");
  return { success: true };
}
