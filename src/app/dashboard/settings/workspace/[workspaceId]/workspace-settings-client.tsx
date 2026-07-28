"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Separator } from "@/components/ui/separator";
import { Switch } from "@/components/ui/switch";
import {
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
} from "@/components/ui/tabs";
import { updateWorkspace } from "@/features/workspace/actions";
import { MembersList } from "@/features/workspace/components/members-list";
import { SaveIcon, CreditCardIcon } from "lucide-react";
import type { Workspace, WorkspaceMember, WorkspaceRole, Invitation } from "@/types";

interface WorkspaceSettingsClientProps {
  workspace: Workspace & { role: WorkspaceRole };
  members: WorkspaceMember[];
  invitations: Invitation[];
  currentUserId: string | null;
}

export function WorkspaceSettingsClient({
  workspace,
  members: initialMembers,
  currentUserId,
}: WorkspaceSettingsClientProps) {
  const router = useRouter();
  const [name, setName] = useState(workspace.name);
  const [slug, setSlug] = useState(workspace.slug);
  const [saving, setSaving] = useState(false);
  const [saveError, setSaveError] = useState<string | null>(null);

  async function handleSave() {
    setSaving(true);
    setSaveError(null);

    const result = await updateWorkspace(workspace.id, { name, slug });

    if (result.error) {
      setSaveError(result.error);
      setSaving(false);
      return;
    }

    setSaving(false);
    router.refresh();
  }

  return (
    <Tabs defaultValue="general">
      <TabsList>
        <TabsTrigger value="general">General</TabsTrigger>
        <TabsTrigger value="team">Team</TabsTrigger>
        <TabsTrigger value="billing">Billing</TabsTrigger>
      </TabsList>

      <TabsContent value="general" className="mt-4 space-y-4">
        <Card>
          <CardHeader>
            <CardTitle>Workspace Settings</CardTitle>
            <CardDescription>Configure your workspace name and identifier.</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid gap-2">
              <Label htmlFor="workspace-name">Workspace Name</Label>
              <Input
                id="workspace-name"
                value={name}
                onChange={(e) => setName(e.target.value)}
              />
            </div>
            <div className="grid gap-2">
              <Label htmlFor="workspace-slug">Slug</Label>
              <Input
                id="workspace-slug"
                value={slug}
                onChange={(e) => setSlug(e.target.value)}
              />
            </div>
            <Separator />
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium">API Access</p>
                <p className="text-xs text-muted-foreground">Allow incoming API requests</p>
              </div>
              <Switch defaultChecked />
            </div>
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium">Request Logging</p>
                <p className="text-xs text-muted-foreground">Log all API requests and responses</p>
              </div>
              <Switch defaultChecked />
            </div>

            {saveError && (
              <div className="rounded-md bg-destructive/10 px-3 py-2 text-sm text-destructive">
                {saveError}
              </div>
            )}

            <div className="flex justify-end">
              <Button onClick={handleSave} disabled={saving}>
                <SaveIcon className="mr-2 h-3.5 w-3.5" />
                {saving ? "Saving..." : "Save Changes"}
              </Button>
            </div>
          </CardContent>
        </Card>
      </TabsContent>

      <TabsContent value="team" className="mt-4 space-y-4">
        <Card>
          <CardHeader>
            <CardTitle>Team Members</CardTitle>
            <CardDescription>Manage who has access to this workspace.</CardDescription>
          </CardHeader>
          <CardContent>
            <MembersList
              workspaceId={workspace.id}
              members={initialMembers}
              currentUserId={currentUserId}
              currentUserRole={workspace.role}
            />
          </CardContent>
        </Card>
      </TabsContent>

      <TabsContent value="billing" className="mt-4 space-y-4">
        <Card>
          <CardHeader>
            <CardTitle>Plan & Billing</CardTitle>
            <CardDescription>View and manage your subscription plan.</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-center justify-between rounded-lg border p-4">
              <div>
                <p className="text-sm font-medium">Current Plan</p>
                <p className="text-xs text-muted-foreground">You are on the Pro plan</p>
              </div>
              <div className="rounded-full bg-emerald-500/10 px-3 py-1 text-xs font-medium text-emerald-500">
                Active
              </div>
            </div>
            <div className="grid grid-cols-2 gap-4 text-sm">
              <div>
                <p className="text-muted-foreground">Requests</p>
                <p className="font-medium">100,000 / month</p>
              </div>
              <div>
                <p className="text-muted-foreground">API Keys</p>
                <p className="font-medium">Unlimited</p>
              </div>
              <div>
                <p className="text-muted-foreground">Team Members</p>
                <p className="font-medium">Up to 10</p>
              </div>
              <div>
                <p className="text-muted-foreground">Support</p>
                <p className="font-medium">Priority</p>
              </div>
            </div>
            <Separator />
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium">Payment Method</p>
                <p className="text-xs text-muted-foreground">No payment method added</p>
              </div>
              <Button variant="outline" size="sm">
                <CreditCardIcon className="mr-2 h-3.5 w-3.5" />
                Add
              </Button>
            </div>
            <div className="flex justify-end">
              <Button variant="outline">Manage Subscription</Button>
            </div>
          </CardContent>
        </Card>
      </TabsContent>
    </Tabs>
  );
}
