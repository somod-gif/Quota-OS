"use client"

import { useState } from "react"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import {
  Select, SelectContent, SelectItem, SelectTrigger, SelectValue,
} from "@/components/ui/select"
import {
  Table, TableBody, TableCell, TableHead, TableHeader, TableRow,
} from "@/components/ui/table"
import { SearchIcon, RefreshCwIcon } from "lucide-react"
import { getMethodColor, getStatusColor } from "@/lib/utils"
import { getLogs } from "@/features/usage/actions"
import type { RequestLog } from "@/types"

interface LogsTableProps {
  logs: RequestLog[]
  workspaceId: string
}

function getStatusBadgeVariant(status: number | null): "default" | "destructive" | "secondary" | "outline" {
  if (status === null) return "outline"
  if (status < 300) return "default"
  if (status < 400) return "secondary"
  if (status < 500) return "outline"
  return "destructive"
}

function getLatencyColor(ms: number | null): string {
  if (ms === null) return "text-muted-foreground"
  if (ms < 100) return "text-emerald-500"
  if (ms < 500) return "text-amber-500"
  return "text-red-500"
}

function timeAgo(dateStr: string): string {
  const diff = Date.now() - new Date(dateStr).getTime()
  const sec = Math.floor(diff / 1000)
  if (sec < 60) return `${sec}s ago`
  const min = Math.floor(sec / 60)
  if (min < 60) return `${min}m ago`
  const hr = Math.floor(min / 60)
  if (hr < 24) return `${hr}h ago`
  return new Date(dateStr).toLocaleDateString()
}

export function LogsTable({ logs, workspaceId }: LogsTableProps) {
  const [search, setSearch] = useState("")
  const [methodFilter, setMethodFilter] = useState("all")
  const [statusFilter, setStatusFilter] = useState("all")
  const [displayLogs, setDisplayLogs] = useState(logs)
  const [loading, setLoading] = useState(false)

  async function handleSearch() {
    setLoading(true)
    const statusRanges: Record<string, { min: number; max: number } | null> = {
      all: null,
      "2xx": { min: 200, max: 299 },
      "3xx": { min: 300, max: 399 },
      "4xx": { min: 400, max: 499 },
      "5xx": { min: 500, max: 599 },
    }
    const statusRange = statusRanges[statusFilter] ?? null

    const result = await getLogs(workspaceId, {
      limit: 50,
      method: methodFilter !== "all" ? methodFilter : undefined,
      statusMin: statusRange?.min,
      statusMax: statusRange?.max,
      search: search || undefined,
    })
    setDisplayLogs(result)
    setLoading(false)
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center gap-2">
        <div className="relative flex-1">
          <SearchIcon className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Search by path or IP..."
            className="pl-8"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && handleSearch()}
          />
        </div>
        <Select value={methodFilter} onValueChange={setMethodFilter}>
          <SelectTrigger className="w-28">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Methods</SelectItem>
            <SelectItem value="GET">GET</SelectItem>
            <SelectItem value="POST">POST</SelectItem>
            <SelectItem value="PUT">PUT</SelectItem>
            <SelectItem value="PATCH">PATCH</SelectItem>
            <SelectItem value="DELETE">DELETE</SelectItem>
          </SelectContent>
        </Select>
        <Select value={statusFilter} onValueChange={setStatusFilter}>
          <SelectTrigger className="w-28">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Status</SelectItem>
            <SelectItem value="2xx">2xx</SelectItem>
            <SelectItem value="3xx">3xx</SelectItem>
            <SelectItem value="4xx">4xx</SelectItem>
            <SelectItem value="5xx">5xx</SelectItem>
          </SelectContent>
        </Select>
        <Button variant="outline" size="icon" onClick={handleSearch} disabled={loading}>
          <RefreshCwIcon className={`h-4 w-4 ${loading ? "animate-spin" : ""}`} />
        </Button>
      </div>
      {displayLogs.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-12 text-center">
          <p className="text-sm text-muted-foreground">No logs found.</p>
        </div>
      ) : (
        <div className="rounded-md border">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead className="w-16">Method</TableHead>
                <TableHead>Path</TableHead>
                <TableHead className="w-16">Status</TableHead>
                <TableHead className="w-20">Latency</TableHead>
                <TableHead className="w-32">IP</TableHead>
                <TableHead className="w-24">Time</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {displayLogs.map((log) => (
                <TableRow key={log.id}>
                  <TableCell>
                    <Badge variant="outline" className={getMethodColor(log.method) + " font-mono text-xs"}>
                      {log.method}
                    </Badge>
                  </TableCell>
                  <TableCell className="max-w-80 truncate font-mono text-xs">{log.path}</TableCell>
                  <TableCell>
                    <Badge variant={getStatusBadgeVariant(log.status_code)} className={getStatusColor(log.status_code)}>
                      {log.status_code ?? "—"}
                    </Badge>
                  </TableCell>
                  <TableCell className={`font-mono text-xs ${getLatencyColor(log.latency_ms)}`}>
                    {log.latency_ms ? `${log.latency_ms}ms` : "—"}
                  </TableCell>
                  <TableCell className="font-mono text-xs text-muted-foreground">{log.ip_address ?? "—"}</TableCell>
                  <TableCell className="text-xs text-muted-foreground">{timeAgo(log.created_at)}</TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
      )}
    </div>
  )
}
