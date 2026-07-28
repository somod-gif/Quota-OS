import { DashboardShell } from "@/components/dashboard/dashboard-shell";
import { getUserWorkspaces, createWorkspace } from "@/features/workspace/actions";
import { redirect } from "next/navigation";
import type { ReactNode } from "react";

export default async function DashboardLayout({ children }: { children: ReactNode }) {
  let workspaces = await getUserWorkspaces();

  if (workspaces.length === 0) {
    const result = await createWorkspace({ name: "My Workspace", slug: "my-workspace" });
    if (result.data) {
      workspaces = await getUserWorkspaces();
    } else {
      redirect("/auth/login");
    }
  }

  return <DashboardShell workspaces={workspaces}>{children}</DashboardShell>;
}
