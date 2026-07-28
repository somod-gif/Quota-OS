import { getAllRateLimits } from "@/features/rate-limiter/actions";
import { getProjects } from "@/features/projects/actions";
import { getUserWorkspaces } from "@/features/workspace/actions";
import { getActiveWorkspaceId } from "@/lib/workspace-cookie";
import { RateLimitsList } from "@/features/rate-limiter/components/rate-limits-list";
import { redirect } from "next/navigation";

export default async function RateLimitsPage() {
  const workspaces = await getUserWorkspaces();

  if (workspaces.length === 0) {
    redirect("/dashboard");
  }

  const activeId = await getActiveWorkspaceId();
  const workspaceId = activeId && workspaces.some((w) => w.id === activeId) ? activeId : workspaces[0].id;
  const workspaceName = workspaces.find((w) => w.id === workspaceId)?.name ?? "Unknown";

  const [rateLimits, projects] = await Promise.all([
    getAllRateLimits(workspaceId),
    getProjects(workspaceId),
  ]);

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-semibold tracking-tight">Rate Limits</h1>
          <p className="text-sm text-muted-foreground">Configure rate limiting rules for {workspaceName}</p>
        </div>
      </div>
      <RateLimitsList rateLimits={rateLimits} projects={projects} />
    </div>
  );
}
