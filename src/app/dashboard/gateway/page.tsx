import { getAllEndpoints } from "@/features/gateway/actions";
import { getProjects } from "@/features/projects/actions";
import { getUserWorkspaces } from "@/features/workspace/actions";
import { getActiveWorkspaceId } from "@/lib/workspace-cookie";
import { EndpointsList } from "@/features/gateway/components/endpoints-list";
import { redirect } from "next/navigation";

export default async function GatewayPage() {
  const workspaces = await getUserWorkspaces();

  if (workspaces.length === 0) {
    redirect("/dashboard");
  }

  const activeId = await getActiveWorkspaceId();
  const workspaceId = activeId && workspaces.some((w) => w.id === activeId) ? activeId : workspaces[0].id;
  const workspaceName = workspaces.find((w) => w.id === workspaceId)?.name ?? "Unknown";

  const [endpoints, projects] = await Promise.all([
    getAllEndpoints(workspaceId),
    getProjects(workspaceId),
  ]);

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-semibold tracking-tight">Gateway</h1>
          <p className="text-sm text-muted-foreground">Manage your API gateway endpoints for {workspaceName}</p>
        </div>
      </div>
      <EndpointsList endpoints={endpoints} projects={projects} />
    </div>
  );
}
