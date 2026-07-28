import { getProjects } from "@/features/projects/actions";
import { getUserWorkspaces } from "@/features/workspace/actions";
import { getActiveWorkspaceId } from "@/lib/workspace-cookie";
import { ProjectsList } from "@/features/projects/components/projects-list";
import { redirect } from "next/navigation";

export default async function ProjectsPage() {
  const workspaces = await getUserWorkspaces();

  if (workspaces.length === 0) {
    redirect("/dashboard");
  }

  const activeId = await getActiveWorkspaceId();
  const workspaceId = activeId && workspaces.some((w) => w.id === activeId) ? activeId : workspaces[0].id;
  const workspaceName = workspaces.find((w) => w.id === workspaceId)?.name ?? "Unknown";
  const projects = await getProjects(workspaceId);

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-semibold tracking-tight">Projects</h1>
          <p className="text-sm text-muted-foreground">Manage your API projects for {workspaceName}</p>
        </div>
      </div>
      <ProjectsList projects={projects} workspaceId={workspaceId} />
    </div>
  );
}
