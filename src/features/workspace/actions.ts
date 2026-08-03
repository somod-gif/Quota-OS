"use server";

import { db } from "@/drizzle";
import { workspaces, workspace_members, invitations } from "@/drizzle/schema";
import { eq, and } from "drizzle-orm";
import { requireAuth } from "@/lib/auth";
import { requireWorkspaceAccess } from "@/lib/authorization";
import { slugify } from "@/lib/utils";
import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import crypto from "crypto";
import { env } from "@/config/env";
import { sendEmail, buildInvitationEmail } from "@/lib/email";
import type { WorkspaceRole, InsertWorkspace, UpdateWorkspace, CreateInvitation, Invitation } from "@/types";

export async function createWorkspace(data: InsertWorkspace) {
  const user = await requireAuth();
  const slug = slugify(data.slug || data.name);

  const existing = await db
    .select({ id: workspaces.id })
    .from(workspaces)
    .where(eq(workspaces.slug, slug))
    .limit(1);

  if (existing.length > 0) {
    return { error: "A workspace with this slug already exists" };
  }

  const [workspace] = await db
    .insert(workspaces)
    .values({ name: data.name, slug })
    .returning();

  await db.insert(workspace_members).values({
    workspace_id: workspace.id,
    user_id: user.id,
    role: "owner",
  });

  revalidatePath("/dashboard");
  return { data: serializeWorkspace(workspace, "owner") };
}

function serializeWorkspace(
  workspace: typeof workspaces.$inferSelect,
  role: WorkspaceRole,
) {
  return {
    id: workspace.id,
    name: workspace.name,
    slug: workspace.slug,
    role,
    created_at: workspace.created_at.toISOString(),
    updated_at: workspace.updated_at.toISOString(),
  };
}

export async function getUserWorkspaces() {
  const user = await requireAuth();

  const memberships = await db
    .select({
      workspace: workspaces,
      role: workspace_members.role,
    })
    .from(workspace_members)
    .innerJoin(
      workspaces,
      eq(workspace_members.workspace_id, workspaces.id),
    )
    .where(eq(workspace_members.user_id, user.id))
    .orderBy(workspaces.name);

  return memberships.map((m) =>
    serializeWorkspace(m.workspace, m.role as WorkspaceRole),
  );
}

export async function getWorkspace(workspaceId: string) {
  const user = await requireAuth();
  const role = await requireWorkspaceAccess(workspaceId, user.id);

  const [workspace] = await db
    .select()
    .from(workspaces)
    .where(eq(workspaces.id, workspaceId))
    .limit(1);

  if (!workspace) {
    return { error: "Workspace not found" };
  }

  return { data: { ...serializeWorkspace(workspace, role) } };
}

export async function updateWorkspace(workspaceId: string, data: UpdateWorkspace) {
  const user = await requireAuth();
  await requireWorkspaceAccess(workspaceId, user.id, "admin");

  const updateData: Partial<typeof workspaces.$inferInsert> = {};
  if (data.name) updateData.name = data.name;
  if (data.slug) {
    const slug = slugify(data.slug);
    const existing = await db
      .select({ id: workspaces.id })
      .from(workspaces)
      .where(eq(workspaces.slug, slug))
      .limit(1);

    if (existing.length > 0 && existing[0].id !== workspaceId) {
      return { error: "A workspace with this slug already exists" };
    }
    updateData.slug = slug;
  }

  const [updated] = await db
    .update(workspaces)
    .set(updateData)
    .where(eq(workspaces.id, workspaceId))
    .returning();

  revalidatePath("/dashboard");
  return { data: updated };
}

export async function deleteWorkspace(workspaceId: string) {
  const user = await requireAuth();
  await requireWorkspaceAccess(workspaceId, user.id, "owner");

  const memberCount = await db
    .select({ count: workspace_members.id })
    .from(workspace_members)
    .where(eq(workspace_members.workspace_id, workspaceId));

  if (memberCount.length > 1) {
    return { error: "Transfer ownership or remove all members before deleting" };
  }

  await db.delete(workspaces).where(eq(workspaces.id, workspaceId));

  revalidatePath("/dashboard");
  redirect("/dashboard");
}

export async function getWorkspaceMembers(workspaceId: string) {
  const user = await requireAuth();
  await requireWorkspaceAccess(workspaceId, user.id);

  const members = await db
    .select()
    .from(workspace_members)
    .where(eq(workspace_members.workspace_id, workspaceId))
    .orderBy(workspace_members.created_at);

  return members.map((m) => ({
    id: m.id,
    workspace_id: m.workspace_id,
    user_id: m.user_id,
    role: m.role as WorkspaceRole,
    created_at: m.created_at.toISOString(),
  }));
}

export async function updateMemberRole(
  workspaceId: string,
  memberId: string,
  newRole: WorkspaceRole,
) {
  const user = await requireAuth();
  await requireWorkspaceAccess(workspaceId, user.id, "admin");

  const [member] = await db
    .select()
    .from(workspace_members)
    .where(
      and(
        eq(workspace_members.id, memberId),
        eq(workspace_members.workspace_id, workspaceId),
      ),
    )
    .limit(1);

  if (!member) {
    return { error: "Member not found" };
  }

  if (member.role === "owner" && newRole !== "owner") {
    return { error: "Cannot change the owner's role directly. Transfer ownership instead." };
  }

  await db
    .update(workspace_members)
    .set({ role: newRole })
    .where(eq(workspace_members.id, memberId));

  revalidatePath("/dashboard/settings");
  return { success: true };
}

export async function removeMember(workspaceId: string, memberId: string) {
  const user = await requireAuth();
  await requireWorkspaceAccess(workspaceId, user.id, "admin");

  const [member] = await db
    .select()
    .from(workspace_members)
    .where(
      and(
        eq(workspace_members.id, memberId),
        eq(workspace_members.workspace_id, workspaceId),
      ),
    )
    .limit(1);

  if (!member) {
    return { error: "Member not found" };
  }

  if (member.role === "owner") {
    return { error: "Cannot remove the workspace owner" };
  }

  if (member.user_id === user.id) {
    return { error: "Cannot remove yourself. Transfer ownership or ask an admin." };
  }

  await db
    .delete(workspace_members)
    .where(eq(workspace_members.id, memberId));

  revalidatePath("/dashboard/settings");
  return { success: true };
}

export async function transferOwnership(workspaceId: string, newOwnerId: string) {
  const user = await requireAuth();
  await requireWorkspaceAccess(workspaceId, user.id, "owner");

  const [newOwner] = await db
    .select()
    .from(workspace_members)
    .where(
      and(
        eq(workspace_members.workspace_id, workspaceId),
        eq(workspace_members.user_id, newOwnerId),
      ),
    )
    .limit(1);

  if (!newOwner) {
    return { error: "Target user is not a member of this workspace" };
  }

  await db
    .update(workspace_members)
    .set({ role: "member" })
    .where(
      and(
        eq(workspace_members.workspace_id, workspaceId),
        eq(workspace_members.user_id, user.id),
      ),
    );

  await db
    .update(workspace_members)
    .set({ role: "owner" })
    .where(eq(workspace_members.id, newOwner.id));

  revalidatePath("/dashboard/settings");
  return { success: true };
}

export async function createInvitation(workspaceId: string, data: CreateInvitation) {
  const user = await requireAuth();
  await requireWorkspaceAccess(workspaceId, user.id, "admin");

  const existing = await db
    .select({ id: invitations.id })
    .from(invitations)
    .where(
      and(
        eq(invitations.workspace_id, workspaceId),
        eq(invitations.email, data.email),
        eq(invitations.status, "pending"),
      ),
    )
    .limit(1);

  if (existing.length > 0) {
    return { error: "An active invitation already exists for this email" };
  }

  const [workspace] = await db
    .select({ name: workspaces.name })
    .from(workspaces)
    .where(eq(workspaces.id, workspaceId))
    .limit(1);

  if (!workspace) {
    return { error: "Workspace not found" };
  }

  const token = crypto.randomBytes(32).toString("hex");
  const expiresAt = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000);

  const [invitation] = await db
    .insert(invitations)
    .values({
      workspace_id: workspaceId,
      email: data.email,
      role: data.role,
      token,
      invited_by: user.id,
      expires_at: expiresAt,
    })
    .returning();

  revalidatePath("/dashboard/settings");

  const inviteUrl = `${env.NEXT_PUBLIC_APP_URL}/auth/accept-invitation?token=${invitation.token}`;

  const emailResult = await sendEmail({
    to: invitation.email,
    subject: `You're invited to join ${workspace.name}`,
    html: buildInvitationEmail({
      workspaceName: workspace.name,
      inviterName: user.user_metadata?.full_name ?? "A team member",
      acceptUrl: inviteUrl,
    }),
    text: `You've been invited to join ${workspace.name} on QuotaOS. Accept the invitation here: ${inviteUrl}`,
  });

  return {
    data: {
      id: invitation.id,
      workspace_id: invitation.workspace_id,
      email: invitation.email,
      role: invitation.role as WorkspaceRole,
      token: invitation.token,
      status: invitation.status as Invitation["status"],
      invited_by: invitation.invited_by,
      expires_at: invitation.expires_at.toISOString(),
      created_at: invitation.created_at.toISOString(),
      updated_at: invitation.updated_at.toISOString(),
    },
    email: emailResult,
  };
}

export async function getWorkspaceInvitations(workspaceId: string) {
  const user = await requireAuth();
  await requireWorkspaceAccess(workspaceId, user.id);

  const result = await db
    .select()
    .from(invitations)
    .where(
      and(
        eq(invitations.workspace_id, workspaceId),
        eq(invitations.status, "pending"),
      ),
    )
    .orderBy(invitations.created_at);

  return result.map((inv) => ({
    id: inv.id,
    workspace_id: inv.workspace_id,
    email: inv.email,
    role: inv.role as WorkspaceRole,
    token: inv.token,
    status: inv.status as Invitation["status"],
    invited_by: inv.invited_by,
    expires_at: inv.expires_at.toISOString(),
    created_at: inv.created_at.toISOString(),
    updated_at: inv.updated_at.toISOString(),
  }));
}

export async function cancelInvitation(workspaceId: string, invitationId: string) {
  const user = await requireAuth();
  await requireWorkspaceAccess(workspaceId, user.id, "admin");

  await db
    .update(invitations)
    .set({ status: "cancelled" })
    .where(eq(invitations.id, invitationId));

  revalidatePath("/dashboard/settings");
  return { success: true };
}

export async function acceptInvitation(token: string) {
  let user;
  try {
    user = await requireAuth();
  } catch {
    return { error: "You must be signed in to accept an invitation. Sign in and open the link again." };
  }

  const [invitation] = await db
    .select()
    .from(invitations)
    .where(
      and(
        eq(invitations.token, token),
        eq(invitations.status, "pending"),
      ),
    )
    .limit(1);

  if (!invitation) {
    return { error: "Invalid or expired invitation" };
  }

  if (new Date(invitation.expires_at) < new Date()) {
    await db
      .update(invitations)
      .set({ status: "expired" })
      .where(eq(invitations.id, invitation.id));
    return { error: "Invitation has expired" };
  }

  const existingMember = await db
    .select({ id: workspace_members.id })
    .from(workspace_members)
    .where(
      and(
        eq(workspace_members.workspace_id, invitation.workspace_id),
        eq(workspace_members.user_id, user.id),
      ),
    )
    .limit(1);

  if (existingMember.length > 0) {
    return { error: "You are already a member of this workspace" };
  }

  await db.insert(workspace_members).values({
    workspace_id: invitation.workspace_id,
    user_id: user.id,
    role: invitation.role,
  });

  await db
    .update(invitations)
    .set({ status: "accepted" })
    .where(eq(invitations.id, invitation.id));

  revalidatePath("/dashboard");
  return { success: true, workspaceId: invitation.workspace_id };
}

export async function setActiveWorkspace(workspaceId: string) {
  const user = await requireAuth();
  const member = await db
    .select({ id: workspace_members.id })
    .from(workspace_members)
    .where(
      and(
        eq(workspace_members.workspace_id, workspaceId),
        eq(workspace_members.user_id, user.id),
      ),
    )
    .limit(1);

  if (member.length === 0) {
    return { error: "You are not a member of this workspace" };
  }

  const { setActiveWorkspaceCookie } = await import("@/lib/workspace-cookie");
  await setActiveWorkspaceCookie(workspaceId);
  return { success: true };
}
