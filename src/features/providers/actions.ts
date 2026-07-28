"use server";

import { db } from "@/drizzle";
import { providers, projects } from "@/drizzle/schema";
import { eq, and, inArray } from "drizzle-orm";
import { requireAuth } from "@/lib/auth";
import { requireWorkspaceAccess } from "@/lib/authorization";
import { encryptJson, decryptJson } from "@/lib/encryption";
import { revalidatePath } from "next/cache";
import type { Provider } from "@/types";

function serializeProvider(p: typeof providers.$inferSelect): Provider {
  return {
    id: p.id,
    project_id: p.project_id,
    name: p.name,
    base_url: p.base_url,
    auth_type: p.auth_type as Provider["auth_type"],
    auth_config: p.auth_config && typeof p.auth_config === "string" ? decryptJson(p.auth_config) : null,
    rate_limit_rpm: p.rate_limit_rpm,
    rate_limit_rpd: p.rate_limit_rpd,
    status: p.status as Provider["status"],
    created_at: p.created_at.toISOString(),
    updated_at: p.updated_at.toISOString(),
  };
}

export async function getProviders(workspaceId: string) {
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
    .from(providers)
    .where(and(inArray(providers.project_id, projectIds), eq(providers.status, "active")))
    .orderBy(providers.created_at);

  return result.map(serializeProvider);
}

export async function getAllProviders(workspaceId: string) {
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
    .from(providers)
    .where(inArray(providers.project_id, projectIds))
    .orderBy(providers.created_at);

  return result.map(serializeProvider);
}

export async function getProvider(providerId: string) {
  const user = await requireAuth();

  const [provider] = await db.select().from(providers).where(eq(providers.id, providerId)).limit(1);
  if (!provider) {
    return { error: "Provider not found" };
  }

  const [project] = await db
    .select({ workspace_id: projects.workspace_id })
    .from(projects)
    .where(eq(projects.id, provider.project_id))
    .limit(1);

  if (!project) {
    return { error: "Associated project not found" };
  }

  await requireWorkspaceAccess(project.workspace_id, user.id);
  return { data: { ...serializeProvider(provider), auth_config: null } };
}

export async function createProvider(
  projectId: string,
  data: {
    name: string;
    base_url: string;
    auth_type: Provider["auth_type"];
    auth_config?: Record<string, string> | null;
    rate_limit_rpm?: number | null;
    rate_limit_rpd?: number | null;
  },
) {
  const user = await requireAuth();

  const [project] = await db.select().from(projects).where(eq(projects.id, projectId)).limit(1);
  if (!project) {
    return { error: "Project not found" };
  }

  await requireWorkspaceAccess(project.workspace_id, user.id, "admin");

  const [inserted] = await db
    .insert(providers)
    .values({
      project_id: projectId,
      name: data.name,
      base_url: data.base_url,
      auth_type: data.auth_type,
      auth_config: data.auth_config ? encryptJson(data.auth_config) : null,
      rate_limit_rpm: data.rate_limit_rpm ?? null,
      rate_limit_rpd: data.rate_limit_rpd ?? null,
      status: "active",
    })
    .returning();

  revalidatePath("/dashboard/providers");
  return { data: serializeProvider(inserted) };
}

export async function updateProvider(
  providerId: string,
  data: {
    name?: string;
    base_url?: string;
    auth_type?: Provider["auth_type"];
    auth_config?: Record<string, string> | null;
    rate_limit_rpm?: number | null;
    rate_limit_rpd?: number | null;
  },
) {
  const user = await requireAuth();

  const [existing] = await db.select().from(providers).where(eq(providers.id, providerId)).limit(1);
  if (!existing) {
    return { error: "Provider not found" };
  }

  const [project] = await db
    .select({ workspace_id: projects.workspace_id })
    .from(projects)
    .where(eq(projects.id, existing.project_id))
    .limit(1);

  if (!project) {
    return { error: "Associated project not found" };
  }

  await requireWorkspaceAccess(project.workspace_id, user.id, "admin");

  const updateData: Record<string, unknown> = {};
  if (data.name !== undefined) updateData.name = data.name;
  if (data.base_url !== undefined) updateData.base_url = data.base_url;
  if (data.auth_type !== undefined) updateData.auth_type = data.auth_type;
  if (data.auth_config !== undefined && data.auth_config !== null) {
    updateData.auth_config = encryptJson(data.auth_config);
  } else if (data.auth_config !== undefined) {
    updateData.auth_config = null;
  }
  if (data.rate_limit_rpm !== undefined) updateData.rate_limit_rpm = data.rate_limit_rpm;
  if (data.rate_limit_rpd !== undefined) updateData.rate_limit_rpd = data.rate_limit_rpd;

  if (Object.keys(updateData).length === 0) {
    return { error: "No fields to update" };
  }

  const [updated] = await db
    .update(providers)
    .set(updateData)
    .where(eq(providers.id, providerId))
    .returning();

  revalidatePath("/dashboard/providers");
  return { data: serializeProvider(updated) };
}

export async function deleteProvider(providerId: string) {
  const user = await requireAuth();

  const [existing] = await db.select().from(providers).where(eq(providers.id, providerId)).limit(1);
  if (!existing) {
    return { error: "Provider not found" };
  }

  const [project] = await db
    .select({ workspace_id: projects.workspace_id })
    .from(projects)
    .where(eq(projects.id, existing.project_id))
    .limit(1);

  if (!project) {
    return { error: "Associated project not found" };
  }

  await requireWorkspaceAccess(project.workspace_id, user.id, "admin");

  await db.delete(providers).where(eq(providers.id, providerId));

  revalidatePath("/dashboard/providers");
  return { success: true };
}
