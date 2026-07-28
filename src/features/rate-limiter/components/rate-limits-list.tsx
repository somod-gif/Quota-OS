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
import { createRateLimit, deleteRateLimit } from "@/features/rate-limiter/actions"
import type { RateLimit, Project } from "@/types"

interface RateLimitsListProps {
  rateLimits: RateLimit[]
  projects: Project[]
}

const strategyBadge: Record<string, "default" | "secondary" | "outline"> = {
  token_bucket: "default",
  fixed_window: "secondary",
  sliding_window: "outline",
}

const strategyLabel: Record<string, string> = {
  token_bucket: "Token Bucket",
  fixed_window: "Fixed Window",
  sliding_window: "Sliding Window",
}

export function RateLimitsList({ rateLimits, projects }: RateLimitsListProps) {
  const router = useRouter()
  const [open, setOpen] = useState(false)
  const [name, setName] = useState("")
  const [projectId, setProjectId] = useState("")
  const [maxRequests, setMaxRequests] = useState("")
  const [windowMs, setWindowMs] = useState("60000")
  const [strategy, setStrategy] = useState("sliding_window")
  const [scope, setScope] = useState("global")
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [deleteTarget, setDeleteTarget] = useState<string | null>(null)

  async function handleCreate(e: React.FormEvent) {
    e.preventDefault()
    if (!projectId) { setError("Please select a project"); return }
    setLoading(true)
    setError(null)

    const result = await createRateLimit(projectId, {
      name,
      max_requests: parseInt(maxRequests),
      window_ms: parseInt(windowMs),
      strategy: strategy as RateLimit["strategy"],
      scope: scope as RateLimit["scope"],
    })

    if (result.error || !result.data) {
      setError(result.error ?? "Failed to create rate limit")
      setLoading(false)
      return
    }

    setName("")
    setProjectId("")
    setMaxRequests("")
    setWindowMs("60000")
    setStrategy("sliding_window")
    setScope("global")
    setOpen(false)
    setLoading(false)
    router.refresh()
  }

  async function handleDelete(ruleId: string) {
    await deleteRateLimit(ruleId)
    setDeleteTarget(null)
    toast.success("Rate limit deleted")
    router.refresh()
  }

  function formatWindow(ms: number): string {
    if (ms >= 3_600_000) return `${ms / 3_600_000}h`
    if (ms >= 60_000) return `${ms / 60_000}m`
    return `${ms / 1_000}s`
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-lg font-medium">Rate Limit Rules</h2>
          <p className="text-sm text-muted-foreground">Define rate limiting policies</p>
        </div>
        <Dialog open={open} onOpenChange={setOpen}>
          <DialogTrigger asChild>
            <Button>
              <PlusIcon />
              Add Rule
            </Button>
          </DialogTrigger>
          <DialogContent className="sm:max-w-lg">
            <form onSubmit={handleCreate}>
              <DialogHeader>
                <DialogTitle>Add Rate Limit Rule</DialogTitle>
                <DialogDescription>Define a new rate limiting policy.</DialogDescription>
              </DialogHeader>
              <div className="grid gap-4 py-4">
                <div className="grid grid-cols-2 gap-4">
                  <div className="grid gap-2">
                    <Label htmlFor="name">Name</Label>
                    <Input id="name" placeholder="e.g. Global Default" value={name} onChange={(e) => setName(e.target.value)} required />
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
                <div className="grid grid-cols-2 gap-4">
                  <div className="grid gap-2">
                    <Label htmlFor="max-requests">Max Requests</Label>
                    <Input id="max-requests" type="number" placeholder="1000" value={maxRequests} onChange={(e) => setMaxRequests(e.target.value)} required />
                  </div>
                  <div className="grid gap-2">
                    <Label htmlFor="window">Window (ms)</Label>
                    <Input id="window" type="number" placeholder="60000" value={windowMs} onChange={(e) => setWindowMs(e.target.value)} required />
                  </div>
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div className="grid gap-2">
                    <Label htmlFor="strategy">Strategy</Label>
                    <Select value={strategy} onValueChange={setStrategy}>
                      <SelectTrigger id="strategy">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="sliding_window">Sliding Window</SelectItem>
                        <SelectItem value="fixed_window">Fixed Window</SelectItem>
                        <SelectItem value="token_bucket">Token Bucket</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="grid gap-2">
                    <Label htmlFor="scope">Scope</Label>
                    <Select value={scope} onValueChange={setScope}>
                      <SelectTrigger id="scope">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="global">Global</SelectItem>
                        <SelectItem value="user">Per User</SelectItem>
                        <SelectItem value="ip">Per IP</SelectItem>
                        <SelectItem value="key">Per API Key</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>
                {error && <p className="text-sm text-destructive">{error}</p>}
              </div>
              <DialogFooter>
                <Button type="submit" disabled={loading}>{loading ? "Adding..." : "Add Rule"}</Button>
              </DialogFooter>
            </form>
          </DialogContent>
        </Dialog>
      </div>
      {rateLimits.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-12 text-center">
          <p className="text-sm text-muted-foreground">No rate limit rules yet. Add your first rule.</p>
        </div>
      ) : (
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Name</TableHead>
              <TableHead>Max Requests</TableHead>
              <TableHead>Window</TableHead>
              <TableHead>Strategy</TableHead>
              <TableHead>Scope</TableHead>
              <TableHead>Status</TableHead>
              <TableHead className="w-20">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {rateLimits.map((rule) => (
              <TableRow key={rule.id}>
                <TableCell className="font-medium">{rule.name}</TableCell>
                <TableCell className="font-mono text-muted-foreground">{rule.max_requests.toLocaleString()}</TableCell>
                <TableCell className="text-muted-foreground">{formatWindow(rule.window_ms)}</TableCell>
                <TableCell>
                  <Badge variant={strategyBadge[rule.strategy] ?? "outline"}>{strategyLabel[rule.strategy] ?? rule.strategy}</Badge>
                </TableCell>
                <TableCell><Badge variant="outline">{rule.scope}</Badge></TableCell>
                <TableCell>
                  <Badge variant={rule.status === "active" ? "default" : "secondary"}>{rule.status}</Badge>
                </TableCell>
                <TableCell>
                  <Button variant="ghost" size="icon" onClick={() => setDeleteTarget(rule.id)} aria-label="Delete rate limit">
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
        title="Delete Rate Limit"
        description="Delete this rate limit rule?"
        confirmLabel="Delete"
        onConfirm={() => { if (deleteTarget) handleDelete(deleteTarget) }}
      />
    </div>
  )
}
