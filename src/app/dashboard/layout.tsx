import { DashboardShell } from "@/components/dashboard/dashboard-shell";
import { getUserWorkspaces, createWorkspace } from "@/features/workspace/actions";
import { redirect } from "next/navigation";
import crypto from "crypto";
import type { ReactNode } from "react";

export default async function DashboardLayout({ children }: { children: ReactNode }) {
  let workspaces = await getUserWorkspaces();

  if (workspaces.length === 0) {
    const suffix = crypto.randomBytes(4).toString("hex");
    const result = await createWorkspace({ name: "My Workspace", slug: `my-workspace-${suffix}` });
    if (result.data) {
      workspaces = await getUserWorkspaces();
    } else {
      redirect("/auth/login");
    }
  }

  return <DashboardShell workspaces={workspaces}>{children}</DashboardShell>;
}
