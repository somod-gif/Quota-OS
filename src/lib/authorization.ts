import { db } from "@/drizzle";
import { workspace_members } from "@/drizzle/schema";
import { eq, and } from "drizzle-orm";
import type { WorkspaceRole } from "@/types";

const ROLE_HIERARCHY: Record<WorkspaceRole, number> = {
  owner: 3,
  admin: 2,
  member: 1,
};

export function roleHasPermission(userRole: WorkspaceRole, requiredRole: WorkspaceRole): boolean {
  return ROLE_HIERARCHY[userRole] >= ROLE_HIERARCHY[requiredRole];
}

export function isOwner(role: WorkspaceRole): boolean {
  return role === "owner";
}

export function isAdminOrAbove(role: WorkspaceRole): boolean {
  return roleHasPermission(role, "admin");
}

export async function getWorkspaceMemberRole(
  workspaceId: string,
  userId: string,
): Promise<WorkspaceRole | null> {
  const member = await db
    .select({ role: workspace_members.role })
    .from(workspace_members)
    .where(
      and(
        eq(workspace_members.workspace_id, workspaceId),
        eq(workspace_members.user_id, userId),
      ),
    )
    .limit(1);

  return member.length > 0 ? (member[0].role as WorkspaceRole) : null;
}

export async function requireWorkspaceAccess(
  workspaceId: string,
  userId: string,
  requiredRole: WorkspaceRole = "member",
): Promise<WorkspaceRole> {
  const role = await getWorkspaceMemberRole(workspaceId, userId);
  if (!role) {
    throw new Error("Forbidden: not a member of this workspace");
  }
  if (!roleHasPermission(role, requiredRole)) {
    throw new Error("Forbidden: insufficient permissions");
  }
  return role;
}
