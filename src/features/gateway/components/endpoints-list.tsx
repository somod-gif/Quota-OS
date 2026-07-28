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
import {
  Select, SelectContent, SelectItem, SelectTrigger, SelectValue,
} from "@/components/ui/select"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { PlusIcon, Trash2Icon } from "lucide-react"
import { toast } from "sonner"
import { ConfirmDialog } from "@/components/ui/confirm-dialog"
import { createEndpoint, deleteEndpoint } from "@/features/gateway/actions"
import type { GatewayEndpoint, Project } from "@/types"

interface EndpointsListProps {
  endpoints: GatewayEndpoint[]
  projects: Project[]
}

const methodColors: Record<string, string> = {
  GET: "bg-emerald-500/10 text-emerald-500 border-emerald-500/20",
  POST: "bg-blue-500/10 text-blue-500 border-blue-500/20",
  PUT: "bg-amber-500/10 text-amber-500 border-amber-500/20",
  PATCH: "bg-violet-500/10 text-violet-500 border-violet-500/20",
  DELETE: "bg-red-500/10 text-red-500 border-red-500/20",
}

export function EndpointsList({ endpoints, projects }: EndpointsListProps) {
  const router = useRouter()
  const [open, setOpen] = useState(false)
  const [name, setName] = useState("")
  const [path, setPath] = useState("")
  const [method, setMethod] = useState("GET")
  const [targetUrl, setTargetUrl] = useState("")
  const [projectId, setProjectId] = useState("")
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [deleteTarget, setDeleteTarget] = useState<string | null>(null)

  async function handleCreate(e: React.FormEvent) {
    e.preventDefault()
    if (!projectId) { setError("Please select a project"); return }
    setLoading(true)
    setError(null)

    const result = await createEndpoint(projectId, {
      name,
      path,
      method: method as GatewayEndpoint["method"],
      target_url: targetUrl,
    })

    if (result.error || !result.data) {
      setError(result.error ?? "Failed to create endpoint")
      setLoading(false)
      return
    }

    setName("")
    setPath("")
    setMethod("GET")
    setTargetUrl("")
    setProjectId("")
    setOpen(false)
    setLoading(false)
    router.refresh()
  }

  async function handleDelete(endpointId: string) {
    await deleteEndpoint(endpointId)
    setDeleteTarget(null)
    toast.success("Endpoint deleted")
    router.refresh()
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-lg font-medium">Gateway Endpoints</h2>
          <p className="text-sm text-muted-foreground">Configure API gateway routing rules</p>
        </div>
        <Dialog open={open} onOpenChange={setOpen}>
          <DialogTrigger asChild>
            <Button>
              <PlusIcon />
              Add Endpoint
            </Button>
          </DialogTrigger>
          <DialogContent className="sm:max-w-lg">
            <form onSubmit={handleCreate}>
              <DialogHeader>
                <DialogTitle>Add Endpoint</DialogTitle>
                <DialogDescription>Create a new gateway routing rule.</DialogDescription>
              </DialogHeader>
              <div className="grid gap-4 py-4">
                <div className="grid grid-cols-2 gap-4">
                  <div className="grid gap-2">
                    <Label htmlFor="name">Name</Label>
                    <Input id="name" placeholder="e.g. List Users" value={name} onChange={(e) => setName(e.target.value)} required />
                  </div>
                  <div className="grid gap-2">
                    <Label htmlFor="project">Project</Label>
                    <Select value={projectId} onValueChange={setProjectId} required>
                      <SelectTrigger id="project">
                        <SelectValue placeholder="Select project" />
                      </SelectTrigger>
                      <SelectContent>
                        {projects.map((p) => (
                          <SelectItem key={p.id} value={p.id}>{p.name}</SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                </div>
                <div className="grid gap-2">
                  <Label htmlFor="path">Path</Label>
                  <Input id="path" placeholder="/api/v1/users" value={path} onChange={(e) => setPath(e.target.value)} required />
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div className="grid gap-2">
                    <Label htmlFor="method">Method</Label>
                    <Select value={method} onValueChange={setMethod}>
                      <SelectTrigger id="method">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        {["GET", "POST", "PUT", "PATCH", "DELETE"].map((m) => (
                          <SelectItem key={m} value={m}>{m}</SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="grid gap-2">
                    <Label htmlFor="target-url">Target URL</Label>
                    <Input id="target-url" placeholder="https://service.internal:4001/users" value={targetUrl} onChange={(e) => setTargetUrl(e.target.value)} required />
                  </div>
                </div>
                {error && <p className="text-sm text-destructive">{error}</p>}
              </div>
              <DialogFooter>
                <Button type="submit" disabled={loading}>{loading ? "Adding..." : "Add Endpoint"}</Button>
              </DialogFooter>
            </form>
          </DialogContent>
        </Dialog>
      </div>
      {endpoints.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-12 text-center">
          <p className="text-sm text-muted-foreground">No endpoints yet. Add your first gateway route.</p>
        </div>
      ) : (
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Path</TableHead>
              <TableHead>Method</TableHead>
              <TableHead>Target URL</TableHead>
              <TableHead>Status</TableHead>
              <TableHead className="w-20">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {endpoints.map((ep) => (
              <TableRow key={ep.id}>
                <TableCell className="font-mono text-xs font-medium">{ep.path}</TableCell>
                <TableCell>
                  <Badge className={methodColors[ep.method] ?? ""} variant="outline">
                    {ep.method}
                  </Badge>
                </TableCell>
                <TableCell className="max-w-64 truncate font-mono text-xs text-muted-foreground">
                  {ep.target_url}
                </TableCell>
                <TableCell>
                  <Badge variant={ep.status === "active" ? "default" : "secondary"}>{ep.status}</Badge>
                </TableCell>
                <TableCell>
                  <Button variant="ghost" size="icon" onClick={() => setDeleteTarget(ep.id)} aria-label="Delete endpoint">
                    <Trash2Icon className="size-3.5" />
                  </Button>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      )}

      <ConfirmDialog
        open={deleteTarget !== null}
        onOpenChange={(v) => { if (!v) setDeleteTarget(null) }}
        title="Delete Endpoint"
        description="Delete this endpoint?"
        confirmLabel="Delete"
        onConfirm={() => { if (deleteTarget) handleDelete(deleteTarget) }}
      />
    </div>
  )
}
