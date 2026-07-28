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
import { Textarea } from "@/components/ui/textarea"
import { PlusIcon, Trash2Icon } from "lucide-react"
import { toast } from "sonner"
import { ConfirmDialog } from "@/components/ui/confirm-dialog"
import { createProvider, deleteProvider } from "@/features/providers/actions"
import type { Provider, Project } from "@/types"

interface ProvidersListProps {
  providers: Provider[]
  projects: Project[]
}

const authTypeBadge: Record<string, "default" | "secondary" | "outline"> = {
  api_key: "default",
  bearer: "default",
  basic: "outline",
  oauth2: "secondary",
  none: "outline",
}

const statusBadge: Record<string, "default" | "destructive" | "secondary"> = {
  active: "default",
  inactive: "secondary",
  error: "destructive",
}

export function ProvidersList({ providers, projects }: ProvidersListProps) {
  const router = useRouter()
  const [open, setOpen] = useState(false)
  const [name, setName] = useState("")
  const [baseUrl, setBaseUrl] = useState("")
  const [projectId, setProjectId] = useState("")
  const [authType, setAuthType] = useState<string>("api_key")
  const [authValue, setAuthValue] = useState("")
  const [rateLimitRpm, setRateLimitRpm] = useState("")
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [deleteTarget, setDeleteTarget] = useState<string | null>(null)

  async function handleCreate(e: React.FormEvent) {
    e.preventDefault()
    if (!projectId) { setError("Please select a project"); return }
    setLoading(true)
    setError(null)

    const authConfig: Record<string, string> = {}
    if (authType === "api_key" || authType === "bearer") {
      authConfig.token = authValue
    } else if (authType === "basic") {
      const [user, pass] = authValue.split(":")
      authConfig.username = user ?? ""
      authConfig.password = pass ?? ""
    }

    const result = await createProvider(projectId, {
      name,
      base_url: baseUrl,
      auth_type: authType as Provider["auth_type"],
      auth_config: Object.keys(authConfig).length > 0 ? authConfig : null,
      rate_limit_rpm: rateLimitRpm ? parseInt(rateLimitRpm) : null,
    })

    if (result.error) {
      setError(result.error)
      setLoading(false)
      return
    }

    setName("")
    setBaseUrl("")
    setProjectId("")
    setAuthType("api_key")
    setAuthValue("")
    setRateLimitRpm("")
    setOpen(false)
    setLoading(false)
    router.refresh()
  }

  async function handleDelete(providerId: string) {
    await deleteProvider(providerId)
    setDeleteTarget(null)
    toast.success("Provider deleted")
    router.refresh()
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-lg font-medium">Providers</h2>
          <p className="text-sm text-muted-foreground">Connected third-party API providers</p>
        </div>
        <Dialog open={open} onOpenChange={setOpen}>
          <DialogTrigger asChild>
            <Button>
              <PlusIcon />
              Add Provider
            </Button>
          </DialogTrigger>
          <DialogContent className="sm:max-w-lg">
            <form onSubmit={handleCreate}>
              <DialogHeader>
                <DialogTitle>Add Provider</DialogTitle>
                <DialogDescription>Connect a third-party API provider.</DialogDescription>
              </DialogHeader>
              <div className="grid gap-4 py-4">
                <div className="grid grid-cols-2 gap-4">
                  <div className="grid gap-2">
                    <Label htmlFor="name">Provider Name</Label>
                    <Input id="name" placeholder="e.g. OpenAI" value={name} onChange={(e) => setName(e.target.value)} required />
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
                  <Label htmlFor="base-url">Base URL</Label>
                  <Input id="base-url" placeholder="https://api.openai.com/v1" value={baseUrl} onChange={(e) => setBaseUrl(e.target.value)} required />
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div className="grid gap-2">
                    <Label htmlFor="auth-type">Auth Type</Label>
                    <Select value={authType} onValueChange={setAuthType}>
                      <SelectTrigger id="auth-type">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="api_key">API Key</SelectItem>
                        <SelectItem value="bearer">Bearer Token</SelectItem>
                        <SelectItem value="basic">Basic Auth</SelectItem>
                        <SelectItem value="oauth2">OAuth 2.0</SelectItem>
                        <SelectItem value="none">None</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="grid gap-2">
                    <Label htmlFor="rate-limit">Rate Limit (RPM)</Label>
                    <Input id="rate-limit" type="number" placeholder="e.g. 500" value={rateLimitRpm} onChange={(e) => setRateLimitRpm(e.target.value)} />
                  </div>
                </div>
                {authType !== "none" && authType !== "oauth2" && (
                  <div className="grid gap-2">
                    <Label htmlFor="auth-value">
                      {authType === "basic" ? "Credentials (user:pass)" : authType === "api_key" ? "API Key" : "Token"}
                    </Label>
                    <Textarea id="auth-value" placeholder="Paste your secret here" value={authValue} onChange={(e) => setAuthValue(e.target.value)} />
                  </div>
                )}
                {authType === "oauth2" && (
                  <p className="text-xs text-muted-foreground">OAuth 2.0 configuration must be completed via the provider&apos;s developer portal.</p>
                )}
                {error && <p className="text-sm text-destructive">{error}</p>}
              </div>
              <DialogFooter>
                <Button type="submit" disabled={loading}>{loading ? "Adding..." : "Add Provider"}</Button>
              </DialogFooter>
            </form>
          </DialogContent>
        </Dialog>
      </div>
      {providers.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-12 text-center">
          <p className="text-sm text-muted-foreground">No providers yet. Add your first API provider.</p>
        </div>
      ) : (
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Name</TableHead>
              <TableHead>Base URL</TableHead>
              <TableHead>Auth Type</TableHead>
              <TableHead>Rate Limit</TableHead>
              <TableHead>Status</TableHead>
              <TableHead className="w-20">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {providers.map((p) => (
              <TableRow key={p.id}>
                <TableCell className="font-medium">{p.name}</TableCell>
                <TableCell className="max-w-60 truncate text-muted-foreground font-mono text-xs">
                  {p.base_url}
                </TableCell>
                <TableCell>
                  <Badge variant={authTypeBadge[p.auth_type] ?? "outline"}>{p.auth_type}</Badge>
                </TableCell>
                <TableCell className="text-muted-foreground">
                  {p.rate_limit_rpm ? `${p.rate_limit_rpm}/min` : "—"}
                </TableCell>
                <TableCell>
                  <Badge variant={statusBadge[p.status] ?? "secondary"}>{p.status}</Badge>
                </TableCell>
                <TableCell>
                  <Button variant="ghost" size="icon" onClick={() => setDeleteTarget(p.id)} aria-label="Delete provider">
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
        title="Delete Provider"
        description="Delete this provider? This cannot be undone."
        confirmLabel="Delete"
        onConfirm={() => { if (deleteTarget) handleDelete(deleteTarget) }}
      />
    </div>
  )
}
