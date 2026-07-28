"use client"

import {
  Card, CardContent, CardDescription, CardHeader, CardTitle,
} from "@/components/ui/card"
import type { UsageSeries } from "@/types"

interface LatencyChartProps {
  series: UsageSeries[]
}

export function LatencyChart({ series }: LatencyChartProps) {
  const maxLatency = Math.max(...series.map((d) => d.latency), 1)

  return (
    <Card>
      <CardHeader>
        <CardTitle>Latency</CardTitle>
        <CardDescription>Average response time (ms)</CardDescription>
      </CardHeader>
      <CardContent>
        {series.length === 0 ? (
          <p className="text-sm text-muted-foreground py-8 text-center">No data available yet.</p>
        ) : (
          <div className="h-48 flex items-end gap-2">
            {series.map((day) => (
              <div key={day.timestamp} className="flex-1 flex flex-col items-center gap-1">
                <div
                  className="w-full rounded-t bg-amber-500/80 hover:bg-amber-500 transition-colors"
                  style={{ height: `${(day.latency / maxLatency) * 100}%`, minHeight: "4px" }}
                />
                <span className="text-xs text-muted-foreground">
                  {new Date(day.timestamp).toLocaleDateString(undefined, { weekday: "short" })}
                </span>
              </div>
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  )
}
