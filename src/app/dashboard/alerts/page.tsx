import { getAlerts } from "@/features/alerts/actions";
import { getProjects } from "@/features/projects/actions";
import { getUserWorkspaces } from "@/features/workspace/actions";
import { getActiveWorkspaceId } from "@/lib/workspace-cookie";
import { AlertsList } from "@/features/alerts/components/alerts-list";
import { redirect } from "next/navigation";

export default async function AlertsPage() {
  const workspaces = await getUserWorkspaces();

  if (workspaces.length === 0) {
    redirect("/dashboard");
  }

  const activeId = await getActiveWorkspaceId();
  const workspaceId = activeId && workspaces.some((w) => w.id === activeId) ? activeId : workspaces[0].id;
  const workspaceName = workspaces.find((w) => w.id === workspaceId)?.name ?? "Unknown";

  const [alertsResult, projects] = await Promise.all([
    getAlerts(workspaceId, { limit: 20 }),
    getProjects(workspaceId),
  ]);

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-semibold tracking-tight">Alerts</h1>
          <p className="text-sm text-muted-foreground">Configure alerts and notifications for {workspaceName}</p>
        </div>
      </div>
      <AlertsList workspaceId={workspaceId} alerts={alertsResult.data} hasMore={alertsResult.hasMore} projects={projects} />
    </div>
  );
}
