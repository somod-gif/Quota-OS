export const WORKSPACE_ROLES = ["owner", "admin", "member"] as const;

export type WorkspaceRole = (typeof WORKSPACE_ROLES)[number];

export const INVITATION_STATUSES = ["pending", "accepted", "expired", "cancelled"] as const;

export type InvitationStatus = (typeof INVITATION_STATUSES)[number];

export type Workspace = {
  id: string;
  name: string;
  slug: string;
  created_at: string;
  updated_at: string;
};

export type WorkspaceMember = {
  id: string;
  workspace_id: string;
  user_id: string;
  role: WorkspaceRole;
  created_at: string;
};

export type WorkspaceMemberWithUser = WorkspaceMember & {
  user_email?: string;
  user_name?: string;
};

export type InsertWorkspace = {
  name: string;
  slug: string;
};

export type UpdateWorkspace = {
  name?: string;
  slug?: string;
};

export type Invitation = {
  id: string;
  workspace_id: string;
  email: string;
  role: WorkspaceRole;
  token: string;
  status: InvitationStatus;
  invited_by: string;
  expires_at: string;
  created_at: string;
  updated_at: string;
};

export type CreateInvitation = {
  email: string;
  role: WorkspaceRole;
};
