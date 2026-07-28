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
import { Switch } from "@/components/ui/switch"
import { PlusIcon, Trash2Icon } from "lucide-react"
import { toast } from "sonner"
import { ConfirmDialog } from "@/components/ui/confirm-dialog"
import { createAlert, updateAlert, deleteAlert } from "@/features/alerts/actions"
import type { Alert, Project } from "@/types"

interface AlertsListProps {
  alerts: Alert[]
  projects: Project[]
}

const metricLabel: Record<string, string> = {
  error_rate: "Error Rate",
  latency: "Latency",
  rate_limit: "Rate Limit",
  usage: "Usage",
  quota: "Quota",
}

const conditionLabel: Record<string, string> = {
  gt: ">",
  lt: "<",
  gte: "≥",
  lte: "≤",
  eq: "=",
}

export function AlertsList({ alerts, projects }: AlertsListProps) {
  const router = useRouter()
  const [open, setOpen] = useState(false)
  const [name, setName] = useState("")
  const [projectId, setProjectId] = useState("")
  const [metric, setMetric] = useState("error_rate")
  const [condition, setCondition] = useState("gt")
  const [threshold, setThreshold] = useState("")
  const [windowMs, setWindowMs] = useState("300000")
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [deleteTarget, setDeleteTarget] = useState<string | null>(null)

  async function handleCreate(e: React.FormEvent) {
    e.preventDefault()
    if (!projectId) { setError("Please select a project"); return }
    setLoading(true)
    setError(null)

    const result = await createAlert(projectId, {
      project_id: projectId,
      name,
      metric: metric as Alert["metric"],
      condition: condition as Alert["condition"],
      threshold: parseInt(threshold),
      window_ms: parseInt(windowMs),
      channels: ["email"],
    })

    if (result.error || !result.data) {
      setError(result.error ?? "Failed to create alert")
      setLoading(false)
      return
    }

    setName("")
    setProjectId("")
    setMetric("error_rate")
    setCondition("gt")
    setThreshold("")
    setWindowMs("300000")
    setOpen(false)
    setLoading(false)
    router.refresh()
  }

  async function handleToggle(alertId: string, enabled: boolean) {
    await updateAlert(alertId, { enabled })
    router.refresh()
  }

  async function handleDelete(alertId: string) {
    await deleteAlert(alertId)
    setDeleteTarget(null)
    toast.success("Alert deleted")
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
          <h2 className="text-lg font-medium">Alert Rules</h2>
          <p className="text-sm text-muted-foreground">Configure alert conditions and notification channels</p>
        </div>
        <Dialog open={open} onOpenChange={setOpen}>
          <DialogTrigger asChild>
            <Button>
              <PlusIcon />
              Create Alert
            </Button>
          </DialogTrigger>
          <DialogContent className="sm:max-w-lg">
            <form onSubmit={handleCreate}>
              <DialogHeader>
                <DialogTitle>Create Alert</DialogTitle>
                <DialogDescription>Define a new alert rule.</DialogDescription>
              </DialogHeader>
              <div className="grid gap-4 py-4">
                <div className="grid grid-cols-2 gap-4">
                  <div className="grid gap-2">
                    <Label htmlFor="name">Name</Label>
                    <Input id="name" placeholder="e.g. High Error Rate" value={name} onChange={(e) => setName(e.target.value)} required />
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
                <div className="grid grid-cols-3 gap-4">
                  <div className="grid gap-2">
                    <Label htmlFor="metric">Metric</Label>
                    <Select value={metric} onValueChange={setMetric}>
                      <SelectTrigger id="metric">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="error_rate">Error Rate</SelectItem>
                        <SelectItem value="latency">Latency</SelectItem>
                        <SelectItem value="rate_limit">Rate Limit</SelectItem>
                        <SelectItem value="usage">Usage</SelectItem>
                        <SelectItem value="quota">Quota</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="grid gap-2">
                    <Label htmlFor="condition">Condition</Label>
                    <Select value={condition} onValueChange={setCondition}>
                      <SelectTrigger id="condition">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="gt">&gt;</SelectItem>
                        <SelectItem value="lt">&lt;</SelectItem>
                        <SelectItem value="gte">≥</SelectItem>
                        <SelectItem value="lte">≤</SelectItem>
                        <SelectItem value="eq">=</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="grid gap-2">
                    <Label htmlFor="threshold">Threshold</Label>
                    <Input id="threshold" type="number" placeholder="100" value={threshold} onChange={(e) => setThreshold(e.target.value)} required />
                  </div>
                </div>
                <div className="grid gap-2">
                  <Label htmlFor="window">Window</Label>
                  <Select value={windowMs} onValueChange={setWindowMs}>
                    <SelectTrigger id="window">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="60000">1 minute</SelectItem>
                      <SelectItem value="300000">5 minutes</SelectItem>
                      <SelectItem value="600000">10 minutes</SelectItem>
                      <SelectItem value="1800000">30 minutes</SelectItem>
                      <SelectItem value="3600000">1 hour</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                {error && <p className="text-sm text-destructive">{error}</p>}
              </div>
              <DialogFooter>
                <Button type="submit" disabled={loading}>{loading ? "Creating..." : "Create Alert"}</Button>
              </DialogFooter>
            </form>
          </DialogContent>
        </Dialog>
      </div>
      {alerts.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-12 text-center">
          <p className="text-sm text-muted-foreground">No alert rules configured. Create one to get notified.</p>
        </div>
      ) : (
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Name</TableHead>
              <TableHead>Metric</TableHead>
              <TableHead>Condition</TableHead>
              <TableHead>Threshold</TableHead>
              <TableHead>Window</TableHead>
              <TableHead>Enabled</TableHead>
              <TableHead>Last Triggered</TableHead>
              <TableHead className="w-20">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {alerts.map((alert) => (
              <TableRow key={alert.id}>
                <TableCell className="font-medium">{alert.name}</TableCell>
                <TableCell>
                  <Badge variant="outline">{metricLabel[alert.metric] ?? alert.metric}</Badge>
                </TableCell>
                <TableCell className="font-mono">{conditionLabel[alert.condition] ?? alert.condition}</TableCell>
                <TableCell className="font-mono">{alert.threshold.toLocaleString()}</TableCell>
                <TableCell className="text-muted-foreground">{formatWindow(alert.window_ms)}</TableCell>
                <TableCell>
                  <Switch checked={alert.enabled} onCheckedChange={(checked) => handleToggle(alert.id, checked)} />
                </TableCell>
                <TableCell className="text-muted-foreground text-xs">
                  {alert.last_triggered_at ? new Date(alert.last_triggered_at).toLocaleDateString() : "Never"}
                </TableCell>
                <TableCell>
                  <Button variant="ghost" size="icon" onClick={() => setDeleteTarget(alert.id)} aria-label="Delete alert">
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
        title="Delete Alert"
        description="Delete this alert rule?"
        confirmLabel="Delete"
        onConfirm={() => { if (deleteTarget) handleDelete(deleteTarget) }}
      />
    </div>
  )
}
