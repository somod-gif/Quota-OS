"use client";

import { useMemo } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import type { RequestLog } from "@/types";

interface TopApisProps {
  logs: RequestLog[];
}

export function TopApis({ logs }: TopApisProps) {
  const topApis = useMemo(() => {
    const counts = new Map<string, number>();
    for (const log of logs) {
      const key = `${log.method} ${log.path}`;
      counts.set(key, (counts.get(key) ?? 0) + 1);
    }
    const total = logs.length;
    return Array.from(counts.entries())
      .sort((a, b) => b[1] - a[1])
      .slice(0, 5)
      .map(([name, count]) => ({
        name,
        count,
        percentage: total > 0 ? Math.round((count / total) * 100) : 0,
      }));
  }, [logs]);

  if (topApis.length === 0) {
    return (
      <Card className="border-border/50">
        <CardHeader className="pb-3">
          <CardTitle className="text-sm font-medium">Top APIs</CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-sm text-muted-foreground">No request data available yet.</p>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="border-border/50">
      <CardHeader className="pb-3">
        <CardTitle className="text-sm font-medium">Top APIs</CardTitle>
      </CardHeader>
      <CardContent className="space-y-3">
        {topApis.map((api) => (
          <div key={api.name} className="space-y-1">
            <div className="flex items-center justify-between text-sm">
              <span className="font-medium truncate">{api.name}</span>
              <span className="text-xs text-muted-foreground">{formatNumber(api.count)}</span>
            </div>
            <div className="h-1.5 rounded-full bg-muted">
              <div
                className="h-1.5 rounded-full bg-primary/60 transition-all"
                style={{ width: `${api.percentage}%` }}
              />
            </div>
          </div>
        ))}
      </CardContent>
    </Card>
  );
}

function formatNumber(n: number): string {
  if (n >= 1_000_000) return `${(n / 1_000_000).toFixed(1)}M`;
  if (n >= 1_000) return `${(n / 1_000).toFixed(1)}K`;
  return String(n);
}
