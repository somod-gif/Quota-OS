"use client"

import { Badge } from "@/components/ui/badge"
import {
  Card, CardContent, CardDescription, CardHeader, CardTitle,
} from "@/components/ui/card"
import { getMethodColor, getStatusColor } from "@/lib/utils"
import type { RequestLog } from "@/types"

interface RecentLogsProps {
  logs: RequestLog[]
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

export function RecentLogs({ logs }: RecentLogsProps) {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Recent Requests</CardTitle>
        <CardDescription>Latest API requests across all projects</CardDescription>
      </CardHeader>
      <CardContent>
        {logs.length === 0 ? (
          <p className="text-sm text-muted-foreground py-4 text-center">No recent requests.</p>
        ) : (
          <div className="space-y-3">
            {logs.map((log) => (
              <div key={log.id} className="flex items-center gap-3">
                <Badge variant="outline" className={getMethodColor(log.method) + " font-mono text-xs"}>
                  {log.method}
                </Badge>
                <span className="flex-1 truncate font-mono text-xs">{log.path}</span>
                <Badge variant="outline" className={getStatusColor(log.status_code)}>
                  {log.status_code ?? "—"}
                </Badge>
                <span className="text-xs text-muted-foreground w-16 text-right">{timeAgo(log.created_at)}</span>
              </div>
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  )
}
