import { getWorkspace, getWorkspaceMembers, getWorkspaceInvitations } from "@/features/workspace/actions";
import { getCurrentUser } from "@/lib/auth";
import { WorkspaceSettingsClient } from "./workspace-settings-client";
import { notFound } from "next/navigation";

export default async function WorkspaceSettingsPage({
  params,
}: {
  params: Promise<{ workspaceId: string }>;
}) {
  const { workspaceId } = await params;
  const user = await getCurrentUser();

  const [workspaceResult, members, invitations] = await Promise.all([
    getWorkspace(workspaceId),
    getWorkspaceMembers(workspaceId),
    getWorkspaceInvitations(workspaceId),
  ]);

  if (workspaceResult.error || !workspaceResult.data) {
    notFound();
  }

  return (
    <WorkspaceSettingsClient
      workspace={workspaceResult.data}
      members={members}
      invitations={invitations}
      currentUserId={user?.id ?? null}
    />
  );
}
