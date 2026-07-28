import { getAllProviders } from "@/features/providers/actions";
import { getProjects } from "@/features/projects/actions";
import { getUserWorkspaces } from "@/features/workspace/actions";
import { getActiveWorkspaceId } from "@/lib/workspace-cookie";
import { ProvidersList } from "@/features/providers/components/providers-list";
import { redirect } from "next/navigation";

export default async function ProvidersPage() {
  const workspaces = await getUserWorkspaces();

  if (workspaces.length === 0) {
    redirect("/dashboard");
  }

  const activeId = await getActiveWorkspaceId();
  const workspaceId = activeId && workspaces.some((w) => w.id === activeId) ? activeId : workspaces[0].id;
  const workspaceName = workspaces.find((w) => w.id === workspaceId)?.name ?? "Unknown";

  const [providers, projects] = await Promise.all([
    getAllProviders(workspaceId),
    getProjects(workspaceId),
  ]);

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-semibold tracking-tight">Providers</h1>
          <p className="text-sm text-muted-foreground">Manage third-party API connections for {workspaceName}</p>
        </div>
      </div>
      <ProvidersList providers={providers} projects={projects} />
    </div>
  );
}
