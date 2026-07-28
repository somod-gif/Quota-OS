"use server";

import { db } from "@/drizzle";
import { api_keys, projects } from "@/drizzle/schema";
import { eq, and, inArray } from "drizzle-orm";
import { requireAuth } from "@/lib/auth";
import { requireWorkspaceAccess } from "@/lib/authorization";
import { generateApiKey } from "@/lib/utils";
import { revalidatePath } from "next/cache";
import type { ApiKey } from "@/types";

function serializeApiKey(k: typeof api_keys.$inferSelect): ApiKey {
  return {
    id: k.id,
    project_id: k.project_id,
    name: k.name,
    key_prefix: k.key_prefix,
    key_hash: k.key_hash,
    key_last_four: k.key_last_four,
    status: k.status as ApiKey["status"],
    expires_at: k.expires_at?.toISOString() ?? null,
    last_used_at: k.last_used_at?.toISOString() ?? null,
    created_at: k.created_at.toISOString(),
    updated_at: k.updated_at.toISOString(),
  };
}

export async function getApiKeys(workspaceId: string) {
  const user = await requireAuth();
  await requireWorkspaceAccess(workspaceId, user.id);

  const workspaceProjects = await db
    .select({ id: projects.id })
    .from(projects)
    .where(eq(projects.workspace_id, workspaceId));

  if (workspaceProjects.length === 0) {
    return [];
  }

  const projectIds = workspaceProjects.map((p) => p.id);

  const result = await db
    .select()
    .from(api_keys)
    .where(and(inArray(api_keys.project_id, projectIds), eq(api_keys.status, "active")))
    .orderBy(api_keys.created_at);

  return result.map(serializeApiKey);
}

export async function getApiKey(keyId: string) {
  const user = await requireAuth();

  const [key] = await db.select().from(api_keys).where(eq(api_keys.id, keyId)).limit(1);
  if (!key) {
    return { error: "API key not found" };
  }

  const [project] = await db
    .select({ workspace_id: projects.workspace_id })
    .from(projects)
    .where(eq(projects.id, key.project_id))
    .limit(1);

  if (!project) {
    return { error: "Associated project not found" };
  }

  await requireWorkspaceAccess(project.workspace_id, user.id);
  return { data: serializeApiKey(key) };
}

export async function createApiKey(
  projectId: string,
  data: { name: string; expires_at?: string | null },
) {
  const user = await requireAuth();

  const [project] = await db
    .select()
    .from(projects)
    .where(eq(projects.id, projectId))
    .limit(1);

  if (!project) {
    return { error: "Project not found" };
  }

  await requireWorkspaceAccess(project.workspace_id, user.id, "member");

  const { key, prefix, hash, lastFour } = generateApiKey();

  const [inserted] = await db
    .insert(api_keys)
    .values({
      project_id: projectId,
      name: data.name,
      key_prefix: prefix,
      key_hash: hash,
      key_last_four: lastFour,
      status: "active",
      expires_at: data.expires_at ? new Date(data.expires_at) : null,
    })
    .returning();

  revalidatePath("/dashboard/api-keys");
  return { data: { key, apiKey: serializeApiKey(inserted) } };
}

export async function revokeApiKey(keyId: string) {
  const user = await requireAuth();

  const [key] = await db.select().from(api_keys).where(eq(api_keys.id, keyId)).limit(1);
  if (!key) {
    return { error: "API key not found" };
  }

  const [project] = await db
    .select({ workspace_id: projects.workspace_id })
    .from(projects)
    .where(eq(projects.id, key.project_id))
    .limit(1);

  if (!project) {
    return { error: "Associated project not found" };
  }

  await requireWorkspaceAccess(project.workspace_id, user.id, "admin");

  await db.update(api_keys).set({ status: "revoked" }).where(eq(api_keys.id, keyId));

  revalidatePath("/dashboard/api-keys");
  return { success: true };
}

export async function deleteApiKey(keyId: string) {
  const user = await requireAuth();

  const [key] = await db.select().from(api_keys).where(eq(api_keys.id, keyId)).limit(1);
  if (!key) {
    return { error: "API key not found" };
  }

  const [project] = await db
    .select({ workspace_id: projects.workspace_id })
    .from(projects)
    .where(eq(projects.id, key.project_id))
    .limit(1);

  if (!project) {
    return { error: "Associated project not found" };
  }

  await requireWorkspaceAccess(project.workspace_id, user.id, "admin");

  await db.delete(api_keys).where(eq(api_keys.id, keyId));

  revalidatePath("/dashboard/api-keys");
  return { success: true };
}
