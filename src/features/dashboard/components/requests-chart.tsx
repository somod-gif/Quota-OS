"use client"

import {
  Card, CardContent, CardDescription, CardHeader, CardTitle,
} from "@/components/ui/card"
import type { UsageSeries } from "@/types"

interface RequestsChartProps {
  series: UsageSeries[]
}

export function RequestsChart({ series }: RequestsChartProps) {
  const maxRequests = Math.max(...series.map((d) => d.requests), 1)

  return (
    <Card>
      <CardHeader>
        <CardTitle>Requests</CardTitle>
        <CardDescription>Daily API request volume</CardDescription>
      </CardHeader>
      <CardContent>
        {series.length === 0 ? (
          <p className="text-sm text-muted-foreground py-8 text-center">No data available yet.</p>
        ) : (
          <div className="h-48 flex items-end gap-2">
            {series.map((day) => (
              <div key={day.timestamp} className="flex-1 flex flex-col items-center gap-1">
                <div
                  className="w-full rounded-t bg-primary/80 hover:bg-primary transition-colors"
                  style={{ height: `${(day.requests / maxRequests) * 100}%`, minHeight: "4px" }}
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
