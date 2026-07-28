"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Trash2Icon, ShieldIcon, UserIcon } from "lucide-react";
import { updateMemberRole, removeMember, createInvitation } from "../actions";
import type { WorkspaceMember, WorkspaceRole } from "@/types";
import { WORKSPACE_ROLES } from "@/types";

interface MembersListProps {
  workspaceId: string;
  members: WorkspaceMember[];
  currentUserId: string | null;
  currentUserRole: WorkspaceRole | null;
}

const roleBadgeColors: Record<string, string> = {
  owner: "bg-amber-500/10 text-amber-500 border-amber-500/20",
  admin: "bg-emerald-500/10 text-emerald-500 border-emerald-500/20",
  member: "bg-blue-500/10 text-blue-500 border-blue-500/20",
};

export function MembersList({
  workspaceId,
  members,
  currentUserId,
  currentUserRole,
}: MembersListProps) {
  const router = useRouter();
  const [inviteEmail, setInviteEmail] = useState("");
  const [inviteRole, setInviteRole] = useState<WorkspaceRole>("member");
  const [inviteDialogOpen, setInviteDialogOpen] = useState(false);
  const [inviteError, setInviteError] = useState<string | null>(null);
  const [inviteLoading, setInviteLoading] = useState(false);

  const canManage = currentUserRole === "owner" || currentUserRole === "admin";

  async function handleInvite(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setInviteLoading(true);
    setInviteError(null);

    const result = await createInvitation(workspaceId, {
      email: inviteEmail,
      role: inviteRole,
    });

    if (result.error) {
      setInviteError(result.error);
      setInviteLoading(false);
      return;
    }

    setInviteEmail("");
    setInviteRole("member");
    setInviteDialogOpen(false);
    router.refresh();
  }

  async function handleRoleChange(memberId: string, role: WorkspaceRole) {
    await updateMemberRole(workspaceId, memberId, role);
    router.refresh();
  }

  async function handleRemove(memberId: string) {
    await removeMember(workspaceId, memberId);
    router.refresh();
  }

  return (
    <div className="space-y-4">
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>User</TableHead>
            <TableHead>Role</TableHead>
            <TableHead className="w-20">Actions</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {members.map((member) => (
            <TableRow key={member.id}>
              <TableCell className="font-medium">
                <div className="flex items-center gap-2">
                  <div className="flex h-8 w-8 items-center justify-center rounded-full bg-muted">
                    <UserIcon className="h-4 w-4 text-muted-foreground" />
                  </div>
                  <span className="text-sm">{member.user_id === currentUserId ? "You" : member.user_id.slice(0, 8)}</span>
                </div>
              </TableCell>
              <TableCell>
                {canManage && member.user_id !== currentUserId && member.role !== "owner" ? (
                  <Select
                    defaultValue={member.role}
                    onValueChange={(value) => handleRoleChange(member.id, value as WorkspaceRole)}
                  >
                    <SelectTrigger className="h-7 w-28">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {WORKSPACE_ROLES.filter((r) => r !== "owner").map((role) => (
                        <SelectItem key={role} value={role}>
                          {role.charAt(0).toUpperCase() + role.slice(1)}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                ) : (
                  <Badge variant="outline" className={roleBadgeColors[member.role]}>
                    {member.role.charAt(0).toUpperCase() + member.role.slice(1)}
                  </Badge>
                )}
              </TableCell>
              <TableCell>
                {canManage && member.user_id !== currentUserId && member.role !== "owner" && (
                  <Button
                    variant="ghost"
                    size="icon"
                    className="h-8 w-8 text-destructive"
                    onClick={() => handleRemove(member.id)}
                  >
                    <Trash2Icon className="h-3.5 w-3.5" />
                  </Button>
                )}
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>

      {canManage && (
        <div className="flex justify-end">
          <Dialog open={inviteDialogOpen} onOpenChange={setInviteDialogOpen}>
            <DialogTrigger asChild>
              <Button variant="outline">
                <ShieldIcon className="mr-2 h-3.5 w-3.5" />
                Invite Member
              </Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>Invite member</DialogTitle>
                <DialogDescription>
                  Send an invitation to join this workspace.
                </DialogDescription>
              </DialogHeader>
              <form onSubmit={handleInvite} className="space-y-4">
                <div className="grid gap-2">
                  <Label htmlFor="invite-email">Email address</Label>
                  <Input
                    id="invite-email"
                    type="email"
                    value={inviteEmail}
                    onChange={(e) => setInviteEmail(e.target.value)}
                    placeholder="colleague@company.com"
                    required
                  />
                </div>
                <div className="grid gap-2">
                  <Label htmlFor="invite-role">Role</Label>
                  <Select
                    defaultValue="member"
                    onValueChange={(value) => setInviteRole(value as WorkspaceRole)}
                  >
                    <SelectTrigger id="invite-role">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="admin">Admin</SelectItem>
                      <SelectItem value="member">Member</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                {inviteError && (
                  <div className="rounded-md bg-destructive/10 px-3 py-2 text-sm text-destructive">
                    {inviteError}
                  </div>
                )}

                <DialogFooter>
                  <Button type="button" variant="outline" onClick={() => setInviteDialogOpen(false)}>
                    Cancel
                  </Button>
                  <Button type="submit" disabled={inviteLoading}>
                    {inviteLoading ? "Sending..." : "Send invitation"}
                  </Button>
                </DialogFooter>
              </form>
            </DialogContent>
          </Dialog>
        </div>
      )}
    </div>
  );
}
