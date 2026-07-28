import { getApiKeys } from "@/features/api-keys/actions";
import { getProjects } from "@/features/projects/actions";
import { getUserWorkspaces } from "@/features/workspace/actions";
import { getActiveWorkspaceId } from "@/lib/workspace-cookie";
import { ApiKeysList } from "@/features/api-keys/components/api-keys-list";
import { redirect } from "next/navigation";

export default async function ApiKeysPage() {
  const workspaces = await getUserWorkspaces();

  if (workspaces.length === 0) {
    redirect("/dashboard");
  }

  const activeId = await getActiveWorkspaceId();
  const workspaceId = activeId && workspaces.some((w) => w.id === activeId) ? activeId : workspaces[0].id;
  const workspaceName = workspaces.find((w) => w.id === workspaceId)?.name ?? "Unknown";

  const [apiKeys, projects] = await Promise.all([
    getApiKeys(workspaceId),
    getProjects(workspaceId),
  ]);

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-semibold tracking-tight">API Keys</h1>
          <p className="text-sm text-muted-foreground">Manage API keys for {workspaceName}</p>
        </div>
      </div>
      <ApiKeysList apiKeys={apiKeys} projects={projects} />
    </div>
  );
}
