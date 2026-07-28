"use client"

import {
  Card, CardContent, CardDescription, CardHeader, CardTitle,
} from "@/components/ui/card"
import {
  Table, TableBody, TableCell, TableHead, TableHeader, TableRow,
} from "@/components/ui/table"
import { Activity, AlertTriangle, Gauge } from "lucide-react"
import type { UsageSummary, UsageSeries } from "@/types"

interface UsageOverviewProps {
  summary: UsageSummary
  series: UsageSeries[]
}

export function UsageOverview({ summary, series }: UsageOverviewProps) {
  const summaryCards = [
    {
      title: "Total Requests",
      value: summary.totalRequests.toLocaleString(),
      icon: Activity,
      description: "Last 7 days",
    },
    {
      title: "Error Rate",
      value: `${summary.errorRate}%`,
      icon: AlertTriangle,
      description: `${summary.totalErrors} errors total`,
    },
    {
      title: "Avg Latency",
      value: `${summary.avgLatency}ms`,
      icon: Gauge,
      description: "Average response time",
    },
  ]

  return (
    <div className="space-y-6">
      <div className="grid gap-4 md:grid-cols-3">
        {summaryCards.map((card) => (
          <Card key={card.title}>
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium">{card.title}</CardTitle>
              <card.icon className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{card.value}</div>
              <p className="text-xs text-muted-foreground">{card.description}</p>
            </CardContent>
          </Card>
        ))}
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Daily Usage</CardTitle>
          <CardDescription>Last 7 days of API usage</CardDescription>
        </CardHeader>
        <CardContent>
          {series.length === 0 ? (
            <p className="text-sm text-muted-foreground py-8 text-center">No usage data available yet.</p>
          ) : (
            <div className="relative h-40 mb-6">
              <div className="absolute inset-0 flex items-end gap-1">
                {series.map((day) => {
                  const maxRequests = Math.max(...series.map((d) => d.requests), 1)
                  const height = (day.requests / maxRequests) * 100
                  return (
                    <div key={day.timestamp} className="flex-1 flex flex-col items-center gap-1">
                      <div
                        className="w-full rounded-t bg-primary/80 hover:bg-primary transition-colors"
                        style={{ height: `${Math.max(height, 2)}%` }}
                        title={`${day.requests} requests`}
                      />
                    </div>
                  )
                })}
              </div>
            </div>
          )}

          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Date</TableHead>
                <TableHead className="text-right">Requests</TableHead>
                <TableHead className="text-right">Errors</TableHead>
                <TableHead className="text-right">Avg Latency</TableHead>
                <TableHead className="text-right">Error Rate</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {series.map((day) => (
                <TableRow key={day.timestamp}>
                  <TableCell>{new Date(day.timestamp).toLocaleDateString()}</TableCell>
                  <TableCell className="text-right">{day.requests.toLocaleString()}</TableCell>
                  <TableCell className="text-right text-red-500">{day.errors}</TableCell>
                  <TableCell className="text-right font-mono">{day.latency}ms</TableCell>
                  <TableCell className="text-right">
                    {day.requests > 0 ? `${Math.round((day.errors / day.requests) * 100)}%` : "0%"}
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  )
}
