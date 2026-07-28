"use server";

import { db } from "@/drizzle";
import { projects } from "@/drizzle/schema";
import { eq, and } from "drizzle-orm";
import { requireAuth } from "@/lib/auth";
import { requireWorkspaceAccess } from "@/lib/authorization";
import { slugify } from "@/lib/utils";
import { revalidatePath } from "next/cache";
import type { Project, InsertProject } from "@/types";

function serializeProject(p: typeof projects.$inferSelect): Project {
  return {
    id: p.id,
    workspace_id: p.workspace_id,
    name: p.name,
    slug: p.slug,
    description: p.description,
    created_at: p.created_at.toISOString(),
    updated_at: p.updated_at.toISOString(),
  };
}

export async function getProjects(workspaceId: string) {
  const user = await requireAuth();
  await requireWorkspaceAccess(workspaceId, user.id);

  const result = await db
    .select()
    .from(projects)
    .where(eq(projects.workspace_id, workspaceId))
    .orderBy(projects.created_at);

  return result.map(serializeProject);
}

export async function getProject(projectId: string) {
  const user = await requireAuth();

  const [project] = await db
    .select()
    .from(projects)
    .where(eq(projects.id, projectId))
    .limit(1);

  if (!project) {
    return { error: "Project not found" };
  }

  await requireWorkspaceAccess(project.workspace_id, user.id);
  return { data: serializeProject(project) };
}

export async function createProject(workspaceId: string, data: Pick<InsertProject, "name" | "description">) {
  const user = await requireAuth();
  await requireWorkspaceAccess(workspaceId, user.id, "admin");

  const slug = slugify(data.name);

  const existing = await db
    .select({ id: projects.id })
    .from(projects)
    .where(
      and(
        eq(projects.workspace_id, workspaceId),
        eq(projects.slug, slug),
      ),
    )
    .limit(1);

  if (existing.length > 0) {
    return { error: "A project with this name already exists" };
  }

  const [project] = await db
    .insert(projects)
    .values({
      workspace_id: workspaceId,
      name: data.name,
      slug,
      description: data.description ?? null,
    })
    .returning();

  revalidatePath("/dashboard/projects");
  return { data: serializeProject(project) };
}

export async function updateProject(
  projectId: string,
  data: { name?: string; description?: string | null },
) {
  const user = await requireAuth();

  const [existing] = await db
    .select()
    .from(projects)
    .where(eq(projects.id, projectId))
    .limit(1);

  if (!existing) {
    return { error: "Project not found" };
  }

  await requireWorkspaceAccess(existing.workspace_id, user.id, "admin");

  const updateData: Record<string, string | null> = {};
  if (data.name !== undefined) {
    updateData.name = data.name;
    updateData.slug = slugify(data.name);
  }
  if (data.description !== undefined) {
    updateData.description = data.description;
  }

  if (Object.keys(updateData).length === 0) {
    return { error: "No fields to update" };
  }

  const [project] = await db
    .update(projects)
    .set(updateData)
    .where(eq(projects.id, projectId))
    .returning();

  revalidatePath("/dashboard/projects");
  return { data: serializeProject(project) };
}

export async function deleteProject(projectId: string) {
  const user = await requireAuth();

  const [existing] = await db
    .select()
    .from(projects)
    .where(eq(projects.id, projectId))
    .limit(1);

  if (!existing) {
    return { error: "Project not found" };
  }

  await requireWorkspaceAccess(existing.workspace_id, user.id, "admin");

  await db.delete(projects).where(eq(projects.id, projectId));

  revalidatePath("/dashboard/projects");
  return { success: true };
}
