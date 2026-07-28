import { getUserWorkspaces, getWorkspace, getWorkspaceMembers, getWorkspaceInvitations } from "@/features/workspace/actions";
import { getCurrentUser } from "@/lib/auth";
import { WorkspaceSettingsClient } from "./workspace/[workspaceId]/workspace-settings-client";
import { redirect } from "next/navigation";

export default async function SettingsPage() {
  const workspaces = await getUserWorkspaces();

  if (workspaces.length === 0) {
    redirect("/dashboard");
  }

  const workspaceId = workspaces[0].id;
  const user = await getCurrentUser();

  const [workspaceResult, members, invitations] = await Promise.all([
    getWorkspace(workspaceId),
    getWorkspaceMembers(workspaceId),
    getWorkspaceInvitations(workspaceId),
  ]);

  if (workspaceResult.error || !workspaceResult.data) {
    return (
      <div className="space-y-6">
        <div>
          <h1 className="text-2xl font-semibold tracking-tight">Settings</h1>
          <p className="text-sm text-muted-foreground">Could not load workspace settings.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-semibold tracking-tight">Settings</h1>
        <p className="text-sm text-muted-foreground">Manage your workspace settings</p>
      </div>
      <WorkspaceSettingsClient
        workspace={workspaceResult.data}
        members={members}
        invitations={invitations}
        currentUserId={user?.id ?? null}
      />
    </div>
  );
}
