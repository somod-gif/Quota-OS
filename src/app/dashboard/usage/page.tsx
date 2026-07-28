import { getUsageOverview } from "@/features/usage/actions";
import { getUserWorkspaces } from "@/features/workspace/actions";
import { getActiveWorkspaceId } from "@/lib/workspace-cookie";
import { UsageOverview } from "@/features/usage/components/usage-overview";
import { redirect } from "next/navigation";

export default async function UsagePage() {
  const workspaces = await getUserWorkspaces();

  if (workspaces.length === 0) {
    redirect("/dashboard");
  }

  const activeId = await getActiveWorkspaceId();
  const workspaceId = activeId && workspaces.some((w) => w.id === activeId) ? activeId : workspaces[0].id;
  const workspaceName = workspaces.find((w) => w.id === workspaceId)?.name ?? "Unknown";

  const { summary, series } = await getUsageOverview(workspaceId);

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-semibold tracking-tight">Usage</h1>
        <p className="text-sm text-muted-foreground">Monitor your API usage and quotas for {workspaceName}</p>
      </div>
      <UsageOverview summary={summary} series={series} />
    </div>
  );
}
