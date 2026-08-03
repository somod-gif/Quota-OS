import { getLogs } from "@/features/usage/actions";
import { getUserWorkspaces } from "@/features/workspace/actions";
import { getActiveWorkspaceId } from "@/lib/workspace-cookie";
import { RecentLogs } from "@/features/dashboard/components/recent-logs";
import { TopApis } from "@/features/dashboard/components/top-apis";
import { OverviewClient } from "@/features/dashboard/components/overview-client";
import { redirect } from "next/navigation";

export default async function DashboardPage() {
  const workspaces = await getUserWorkspaces();

  if (workspaces.length === 0) {
    redirect("/dashboard");
  }

  const activeId = await getActiveWorkspaceId();
  const workspaceId = activeId && workspaces.some((w) => w.id === activeId) ? activeId : workspaces[0].id;
  const workspaceName = workspaces.find((w) => w.id === workspaceId)?.name ?? "Unknown";

  const logs = await getLogs(workspaceId, { limit: 8 });

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-semibold tracking-tight">Overview</h1>
        <p className="text-sm text-muted-foreground">Monitor your API traffic and usage for {workspaceName}</p>
      </div>
      <OverviewClient workspaceId={workspaceId} />
      <div className="grid gap-6 lg:grid-cols-3">
        <div className="lg:col-span-2">
          <RecentLogs logs={logs} />
        </div>
        <div className="space-y-6">
          <TopApis logs={logs} />
        </div>
      </div>
    </div>
  );
}
