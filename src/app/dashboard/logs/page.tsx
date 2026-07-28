import { getLogs } from "@/features/usage/actions";
import { getUserWorkspaces } from "@/features/workspace/actions";
import { getActiveWorkspaceId } from "@/lib/workspace-cookie";
import { LogsTable } from "@/features/usage/components/logs-table";
import { redirect } from "next/navigation";

export default async function LogsPage() {
  const workspaces = await getUserWorkspaces();

  if (workspaces.length === 0) {
    redirect("/dashboard");
  }

  const activeId = await getActiveWorkspaceId();
  const workspaceId = activeId && workspaces.some((w) => w.id === activeId) ? activeId : workspaces[0].id;
  const workspaceName = workspaces.find((w) => w.id === workspaceId)?.name ?? "Unknown";

  const logs = await getLogs(workspaceId, { limit: 50 });

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-semibold tracking-tight">Request Logs</h1>
        <p className="text-sm text-muted-foreground">View and search through API request logs for {workspaceName}</p>
      </div>
      <LogsTable logs={logs} workspaceId={workspaceId} />
    </div>
  );
}
