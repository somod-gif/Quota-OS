"use client";

import { useState, useCallback } from "react";
import { useRouter } from "next/navigation";
import { cn } from "@/lib/utils";
import { Sidebar } from "./sidebar";
import { Header } from "./header";
import { CreateWorkspaceDialog } from "@/features/workspace/components/create-workspace-dialog";
import { setActiveWorkspace } from "@/features/workspace";
import type { ReactNode } from "react";
import type { Workspace, WorkspaceRole } from "@/types";

type WorkspaceWithRole = Workspace & { role: WorkspaceRole };

interface DashboardShellProps {
  children: ReactNode;
  workspaces: WorkspaceWithRole[];
}

export function DashboardShell({ children, workspaces }: DashboardShellProps) {
  const router = useRouter();
  const [showCreateWorkspace, setShowCreateWorkspace] = useState(false);
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
  const [activeWorkspaceId, setActiveWorkspaceId] = useState<string>(workspaces[0]?.id ?? "");

  const activeWorkspace = workspaces.find((w) => w.id === activeWorkspaceId) ?? workspaces[0] ?? null;

  const handleSwitchWorkspace = useCallback(
    async (workspaceId: string) => {
      setActiveWorkspaceId(workspaceId);
      await setActiveWorkspace(workspaceId);
      router.refresh();
    },
    [router],
  );

  return (
    <div className="flex min-h-screen">
      <Sidebar collapsed={sidebarCollapsed} onToggle={() => setSidebarCollapsed(!sidebarCollapsed)} />
      <div className={cn("flex flex-1 flex-col", sidebarCollapsed ? "md:pl-16" : "md:pl-60")}>
        <Header
          workspaces={workspaces}
          activeWorkspace={activeWorkspace}
          onSwitchWorkspace={handleSwitchWorkspace}
          onCreateWorkspace={() => setShowCreateWorkspace(true)}
        />
        <main className="flex-1 p-6 md:p-8">{children}</main>
      </div>
      <CreateWorkspaceDialog
        open={showCreateWorkspace}
        onOpenChange={setShowCreateWorkspace}
      />
    </div>
  );
}
