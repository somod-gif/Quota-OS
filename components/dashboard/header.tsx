"use client";

import { MobileSidebar } from "./mobile-sidebar";
import { Button } from "@/components/ui/button";
import { LogOut } from "lucide-react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { WorkspaceSwitcher } from "@/features/workspace/components/workspace-switcher";
import { signOut } from "@/features/auth/actions";
import type { Workspace, WorkspaceRole } from "@/types";

type WorkspaceWithRole = Workspace & { role: WorkspaceRole };

interface HeaderProps {
  workspaces: WorkspaceWithRole[];
  activeWorkspace: WorkspaceWithRole | null;
  onSwitchWorkspace: (workspaceId: string) => void;
  onCreateWorkspace: () => void;
}

export function Header({
  workspaces,
  activeWorkspace,
  onSwitchWorkspace,
  onCreateWorkspace,
}: HeaderProps) {

  return (
    <header className="sticky top-0 z-20 flex h-14 items-center gap-4 border-b border-border bg-background/95 px-4 backdrop-blur supports-[backdrop-filter]:bg-background/60 md:px-6">
      <MobileSidebar />

      <div className="hidden w-48 md:block">
        <WorkspaceSwitcher
          workspaces={workspaces}
          activeWorkspace={activeWorkspace}
          onSwitch={onSwitchWorkspace}
          onCreateClick={onCreateWorkspace}
        />
      </div>

      <div className="flex-1" />

      <div className="flex items-center gap-2">

        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="ghost" className="h-9 w-9 rounded-full p-0">
              <Avatar className="h-8 w-8">
                <AvatarFallback className="bg-primary text-primary-foreground text-xs">U</AvatarFallback>
              </Avatar>
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end" className="w-48">
            <DropdownMenuItem asChild>
              <a href="/dashboard/profile" className="cursor-pointer">Profile</a>
            </DropdownMenuItem>
            <DropdownMenuItem asChild>
              <a href="/dashboard/settings" className="cursor-pointer">Settings</a>
            </DropdownMenuItem>
            <DropdownMenuSeparator />
            <DropdownMenuItem onClick={signOut} className="cursor-pointer text-destructive">
              <LogOut className="mr-2 h-4 w-4" />
              Sign out
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
    </header>
  );
}
