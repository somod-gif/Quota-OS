"use client";

import { useState } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
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
import {
  ShieldIcon,
  UserIcon,
  CopyIcon,
  BanIcon,
  CrownIcon,
  UserMinusIcon,
} from "lucide-react";
import {
  updateMemberRole,
  removeMember,
  createInvitation,
  cancelInvitation,
  transferOwnership,
  getWorkspaceMembers,
  getWorkspaceInvitations,
} from "../actions";
import type { WorkspaceMember, WorkspaceRole, Invitation } from "@/types";
import { WORKSPACE_ROLES } from "@/types";

interface MembersListProps {
  workspaceId: string;
  members: WorkspaceMember[];
  invitations: Invitation[];
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
  members: initialMembers,
  invitations: initialInvitations,
  currentUserId,
  currentUserRole,
}: MembersListProps) {
  const queryClient = useQueryClient();
  const [inviteEmail, setInviteEmail] = useState("");
  const [inviteRole, setInviteRole] = useState<WorkspaceRole>("member");
  const [inviteDialogOpen, setInviteDialogOpen] = useState(false);
  const [inviteError, setInviteError] = useState<string | null>(null);

  const canManage = currentUserRole === "owner" || currentUserRole === "admin";
  const isOwner = currentUserRole === "owner";

  const { data: members, isFetching: membersFetching } = useQuery({
    queryKey: ["workspace-members", workspaceId],
    queryFn: () => getWorkspaceMembers(workspaceId),
    initialData: initialMembers,
    initialDataUpdatedAt: 0,
    refetchInterval: 30_000,
  });

  const { data: invitations } = useQuery({
    queryKey: ["workspace-invitations", workspaceId],
    queryFn: () => getWorkspaceInvitations(workspaceId),
    initialData: initialInvitations,
    initialDataUpdatedAt: 0,
    refetchInterval: 30_000,
  });

  const invalidate = () => {
    queryClient.invalidateQueries({ queryKey: ["workspace-members", workspaceId] });
    queryClient.invalidateQueries({ queryKey: ["workspace-invitations", workspaceId] });
  };

  const roleMutation = useMutation({
    mutationFn: ({ memberId, role }: { memberId: string; role: WorkspaceRole }) =>
      updateMemberRole(workspaceId, memberId, role),
    onMutate: async ({ memberId, role }) => {
      await queryClient.cancelQueries({ queryKey: ["workspace-members", workspaceId] });
      const previous = queryClient.getQueryData<WorkspaceMember[]>(["workspace-members", workspaceId]);
      queryClient.setQueryData<WorkspaceMember[]>(["workspace-members", workspaceId], (old) =>
        old?.map((m) => (m.id === memberId ? { ...m, role } : m)),
      );
      return { previous };
    },
    onSuccess: (data, { role }) => {
      if ("error" in data && data.error) {
        toast.error(data.error);
        return;
      }
      toast.success(`Role updated to ${role}`);
    },
    onError: (err) => {
      toast.error(err instanceof Error ? err.message : "Failed to update role");
    },
  });

  const removeMutation = useMutation({
    mutationFn: (memberId: string) => removeMember(workspaceId, memberId),
    onMutate: async (memberId) => {
      await queryClient.cancelQueries({ queryKey: ["workspace-members", workspaceId] });
      const previous = queryClient.getQueryData<WorkspaceMember[]>(["workspace-members", workspaceId]);
      queryClient.setQueryData<WorkspaceMember[]>(["workspace-members", workspaceId], (old) =>
        old?.filter((m) => m.id !== memberId),
      );
      return { previous };
    },
    onSuccess: (data) => {
      if ("error" in data && data.error) {
        toast.error(data.error);
        invalidate();
        return;
      }
      toast.success("Member removed from workspace");
    },
    onError: (err) => {
      toast.error(err instanceof Error ? err.message : "Failed to remove member");
      invalidate();
    },
  });

  const transferMutation = useMutation({
    mutationFn: (memberId: string) => transferOwnership(workspaceId, memberId),
    onSuccess: (data) => {
      if ("error" in data && data.error) {
        toast.error(data.error);
        return;
      }
      toast.success("Ownership transferred");
      invalidate();
    },
    onError: (err) => {
      toast.error(err instanceof Error ? err.message : "Failed to transfer ownership");
    },
  });

  const inviteMutation = useMutation({
    mutationFn: (email: string) =>
      createInvitation(workspaceId, { email, role: inviteRole }),
    onSuccess: (result, email) => {
      if ("error" in result && result.error) {
        setInviteError(result.error);
        return;
      }
      setInviteEmail("");
      setInviteRole("member");
      setInviteDialogOpen(false);
      toast.success(`Invitation sent to ${email}`, {
        description: "They can join by opening the invitation link.",
      });
      invalidate();
    },
    onError: (err) => {
      setInviteError(err instanceof Error ? err.message : "Failed to send invitation");
    },
  });

  const cancelInviteMutation = useMutation({
    mutationFn: (invitationId: string) => cancelInvitation(workspaceId, invitationId),
    onSuccess: () => {
      toast.success("Invitation cancelled");
      invalidate();
    },
    onError: (err) => {
      toast.error(err instanceof Error ? err.message : "Failed to cancel invitation");
    },
  });

  async function handleInvite(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setInviteError(null);
    inviteMutation.mutate(inviteEmail);
  }

  async function handleCopyInviteLink(invitation: Invitation) {
    const link = `${window.location.origin}/auth/accept-invitation?token=${invitation.token}`;
    await navigator.clipboard.writeText(link);
    toast.success("Invitation link copied", {
      description: "Share it with the person you invited.",
    });
  }

  return (
    <div className="space-y-6">
      <div>
        <h3 className="text-sm font-medium">Team Members</h3>
        <p className="text-xs text-muted-foreground">Manage who has access to this workspace.</p>
      </div>

      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>User</TableHead>
            <TableHead>Role</TableHead>
            <TableHead className="w-32">Actions</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {membersFetching && members.length === 0
            ? Array.from({ length: 3 }).map((_, i) => (
                <TableRow key={i}>
                  <TableCell><Skeleton className="h-8 w-40" /></TableCell>
                  <TableCell><Skeleton className="h-6 w-20" /></TableCell>
                  <TableCell><Skeleton className="h-6 w-16" /></TableCell>
                </TableRow>
              ))
            : members.map((member) => (
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
                        onValueChange={(value) =>
                          roleMutation.mutate({ memberId: member.id, role: value as WorkspaceRole })
                        }
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
                    <div className="flex items-center gap-1">
                      {isOwner && member.user_id !== currentUserId && member.role !== "owner" && (
                        <Button
                          variant="ghost"
                          size="icon"
                          className="h-8 w-8 text-amber-500"
                          title="Transfer ownership"
                          onClick={() => transferMutation.mutate(member.id)}
                        >
                          <CrownIcon className="h-3.5 w-3.5" />
                        </Button>
                      )}
                      {canManage && member.user_id !== currentUserId && member.role !== "owner" && (
                        <Button
                          variant="ghost"
                          size="icon"
                          className="h-8 w-8 text-destructive"
                          title="Remove member"
                          onClick={() => removeMutation.mutate(member.id)}
                        >
                          <UserMinusIcon className="h-3.5 w-3.5" />
                        </Button>
                      )}
                    </div>
                  </TableCell>
                </TableRow>
              ))}
        </TableBody>
      </Table>

      {invitations.length > 0 && (
        <>
          <div>
            <h3 className="text-sm font-medium">Pending Invitations</h3>
            <p className="text-xs text-muted-foreground">
              Invitations awaiting acceptance. Share the link with the invited person.
            </p>
          </div>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Email</TableHead>
                <TableHead>Role</TableHead>
                <TableHead>Status</TableHead>
                <TableHead className="w-32">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {invitations.map((invitation) => (
                <TableRow key={invitation.id}>
                  <TableCell className="font-medium">
                    <span className="text-sm">{invitation.email}</span>
                  </TableCell>
                  <TableCell>
                    <Badge variant="outline" className={roleBadgeColors[invitation.role]}>
                      {invitation.role.charAt(0).toUpperCase() + invitation.role.slice(1)}
                    </Badge>
                  </TableCell>
                  <TableCell>
                    <Badge variant="outline" className="bg-blue-500/10 text-blue-500 border-blue-500/20">
                      Pending
                    </Badge>
                  </TableCell>
                  <TableCell>
                    <div className="flex items-center gap-1">
                      <Button
                        variant="ghost"
                        size="icon"
                        className="h-8 w-8"
                        title="Copy invitation link"
                        onClick={() => handleCopyInviteLink(invitation)}
                      >
                        <CopyIcon className="h-3.5 w-3.5" />
                      </Button>
                      {canManage && (
                        <Button
                          variant="ghost"
                          size="icon"
                          className="h-8 w-8 text-destructive"
                          title="Cancel invitation"
                          disabled={cancelInviteMutation.isPending}
                          onClick={() => cancelInviteMutation.mutate(invitation.id)}
                        >
                          <BanIcon className="h-3.5 w-3.5" />
                        </Button>
                      )}
                    </div>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </>
      )}

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
                  Send an invitation to join this workspace. You&apos;ll get a link to share with them.
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
                  <Button type="submit" disabled={inviteMutation.isPending}>
                    {inviteMutation.isPending ? "Sending..." : "Send invitation"}
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
