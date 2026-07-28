"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import {
  Table, TableBody, TableCell, TableHead, TableHeader, TableRow,
} from "@/components/ui/table"
import {
  Dialog, DialogContent, DialogDescription, DialogFooter,
  DialogHeader, DialogTitle, DialogTrigger,
} from "@/components/ui/dialog"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import {
  Select, SelectContent, SelectItem, SelectTrigger, SelectValue,
} from "@/components/ui/select"
import { PlusIcon, CopyIcon, Trash2Icon, CheckIcon } from "lucide-react"
import { toast } from "sonner"
import { ConfirmDialog } from "@/components/ui/confirm-dialog"
import { createApiKey, revokeApiKey, deleteApiKey } from "@/features/api-keys/actions"
import type { ApiKey, Project } from "@/types"

interface ApiKeysListProps {
  apiKeys: ApiKey[]
  projects: Project[]
}

export function ApiKeysList({ apiKeys, projects }: ApiKeysListProps) {
  const router = useRouter()
  const [open, setOpen] = useState(false)
  const [name, setName] = useState("")
  const [projectId, setProjectId] = useState("")
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [newKey, setNewKey] = useState<string | null>(null)
  const [copied, setCopied] = useState(false)
  const [confirmAction, setConfirmAction] = useState<{ id: string; type: "revoke" | "delete" } | null>(null)

  async function handleCreate(e: React.FormEvent) {
    e.preventDefault()
    if (!projectId) {
      setError("Please select a project")
      return
    }
    setLoading(true)
    setError(null)

    const result = await createApiKey(projectId, { name })
    if (result.error || !result.data) {
      setError(result.error ?? "Failed to create API key")
      setLoading(false)
      return
    }

    setNewKey(result.data.key)
    setLoading(false)
  }

  function handleClose() {
    setOpen(false)
    setName("")
    setProjectId("")
    setError(null)
    setNewKey(null)
    setCopied(false)
    router.refresh()
  }

  async function handleRevoke(keyId: string) {
    await revokeApiKey(keyId)
    setConfirmAction(null)
    toast.success("API key revoked")
    router.refresh()
  }

  async function handleDelete(keyId: string) {
    await deleteApiKey(keyId)
    setConfirmAction(null)
    toast.success("API key deleted")
    router.refresh()
  }

  function copyKey(key: string) {
    navigator.clipboard.writeText(key)
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-lg font-medium">API Keys</h2>
          <p className="text-sm text-muted-foreground">Manage API keys for authentication</p>
        </div>
        <Dialog open={open} onOpenChange={(v) => { if (!v) handleClose(); else setOpen(true) }}>
          <DialogTrigger asChild>
            <Button>
              <PlusIcon />
              Create API Key
            </Button>
          </DialogTrigger>
          <DialogContent>
            {newKey ? (
              <>
                <DialogHeader>
                  <DialogTitle>API Key Created</DialogTitle>
                  <DialogDescription>
                    Copy this key now. You won&apos;t be able to see it again.
                  </DialogDescription>
                </DialogHeader>
                <div className="grid gap-4 py-4">
                  <div className="flex items-center gap-2 rounded-md border bg-muted p-3">
                    <code className="flex-1 break-all text-xs">{newKey}</code>
                    <Button size="icon" variant="ghost" onClick={() => { copyKey(newKey); toast.success("Copied to clipboard") }} aria-label="Copy API key">
                      {copied ? <CheckIcon className="size-3.5" /> : <CopyIcon className="size-3.5" />}
                    </Button>
                  </div>
                </div>
                <DialogFooter>
                  <Button onClick={handleClose}>Done</Button>
                </DialogFooter>
              </>
            ) : (
              <form onSubmit={handleCreate}>
                <DialogHeader>
                  <DialogTitle>Create API Key</DialogTitle>
                  <DialogDescription>Generate a new API key for your project.</DialogDescription>
                </DialogHeader>
                <div className="grid gap-4 py-4">
                  <div className="grid gap-2">
                    <Label htmlFor="key-name">Key Name</Label>
                    <Input id="key-name" placeholder="e.g. Production Key" value={name} onChange={(e) => setName(e.target.value)} required />
                  </div>
                  <div className="grid gap-2">
                    <Label htmlFor="key-project">Project</Label>
                    <Select value={projectId} onValueChange={setProjectId} required>
                      <SelectTrigger id="key-project">
                        <SelectValue placeholder="Select project" />
                      </SelectTrigger>
                      <SelectContent>
                        {projects.map((p) => (
                          <SelectItem key={p.id} value={p.id}>{p.name}</SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                  {error && <p className="text-sm text-destructive">{error}</p>}
                </div>
                <DialogFooter>
                  <Button type="submit" disabled={loading}>{loading ? "Generating..." : "Generate"}</Button>
                </DialogFooter>
              </form>
            )}
          </DialogContent>
        </Dialog>
      </div>
      {apiKeys.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-12 text-center">
          <p className="text-sm text-muted-foreground">No API keys yet. Create one to get started.</p>
        </div>
      ) : (
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Name</TableHead>
              <TableHead>Key</TableHead>
              <TableHead>Status</TableHead>
              <TableHead>Created</TableHead>
              <TableHead>Last Used</TableHead>
              <TableHead className="w-24">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {apiKeys.map((key) => (
              <TableRow key={key.id}>
                <TableCell className="font-medium">{key.name}</TableCell>
                <TableCell>
                  <code className="rounded bg-muted px-1.5 py-0.5 text-xs">
                    {key.key_prefix}...{key.key_last_four}
                  </code>
                </TableCell>
                <TableCell>
                  <Badge variant={key.status === "active" ? "default" : key.status === "revoked" ? "destructive" : "secondary"}>
                    {key.status}
                  </Badge>
                </TableCell>
                <TableCell className="text-muted-foreground">{new Date(key.created_at).toLocaleDateString()}</TableCell>
                <TableCell className="text-muted-foreground">{key.last_used_at ? new Date(key.last_used_at).toLocaleDateString() : "Never"}</TableCell>
                <TableCell>
                  <div className="flex items-center gap-1">
                    <Button variant="ghost" size="icon" onClick={() => setConfirmAction({ id: key.id, type: "revoke" })} aria-label="Revoke API key">
                      <Trash2Icon className="size-3.5" />
                    </Button>
                  </div>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      )}

      <ConfirmDialog
        open={confirmAction !== null}
        onOpenChange={(v) => { if (!v) setConfirmAction(null) }}
        title={confirmAction?.type === "revoke" ? "Revoke API Key" : "Delete API Key"}
        description={
          confirmAction?.type === "revoke"
            ? "Revoke this API key? It will stop working immediately."
            : "Delete this API key permanently?"
        }
        confirmLabel={confirmAction?.type === "revoke" ? "Revoke" : "Delete"}
        onConfirm={() => {
          if (!confirmAction) return
          if (confirmAction.type === "revoke") handleRevoke(confirmAction.id)
          else handleDelete(confirmAction.id)
        }}
      />
    </div>
  )
}
