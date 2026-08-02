"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { AlertTriangle } from "lucide-react";
import type { UsageSummary } from "@/types";

interface ErrorRateCardProps {
  summary: UsageSummary | null;
}

export function ErrorRateCard({ summary }: ErrorRateCardProps) {
  if (!summary || summary.totalRequests === 0) {
    return (
      <Card className="border-border/50">
        <CardHeader className="pb-3">
          <CardTitle className="text-sm font-medium">Error rate</CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-sm text-muted-foreground">No data available yet.</p>
        </CardContent>
      </Card>
    );
  }

  const errorRate = summary.errorRate;
  const circumference = 2 * Math.PI * 54;
  const dashOffset = circumference * (1 - errorRate / 100);

  return (
    <Card className="border-border/50">
      <CardHeader className="pb-3">
        <CardTitle className="text-sm font-medium">Error rate</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="flex items-center justify-center">
          <div className="relative flex h-32 w-32 items-center justify-center">
            <svg className="h-32 w-32 -rotate-90" viewBox="0 0 120 120">
              <circle cx="60" cy="60" r="54" fill="none" stroke="hsl(var(--muted))" strokeWidth="8" />
              <circle
                cx="60"
                cy="60"
                r="54"
                fill="none"
                stroke={`hsl(${errorRate > 5 ? "var(--destructive)" : errorRate > 2 ? "35, 92%, 50%" : "142, 71%, 45%"})`}
                strokeWidth="8"
                strokeDasharray={`${circumference} ${circumference}`}
                strokeDashoffset={dashOffset}
                strokeLinecap="round"
              />
            </svg>
            <div className="absolute flex flex-col items-center">
              <AlertTriangle className={`h-5 w-5 ${errorRate > 2 ? "text-destructive" : "text-emerald-500"}`} />
              <span className="text-xl font-semibold">{errorRate}%</span>
              <span className="text-xs text-muted-foreground">error rate</span>
            </div>
          </div>
        </div>
        <div className="mt-3 space-y-1.5 text-xs text-muted-foreground">
          <div className="flex justify-between">
            <span>Total errors</span>
            <span className="font-medium text-red-500">{summary.totalErrors}</span>
          </div>
          <div className="flex justify-between">
            <span>Total requests</span>
            <span className="font-medium">{formatNumber(summary.totalRequests)}</span>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}

function formatNumber(n: number): string {
  if (n >= 1_000_000) return `${(n / 1_000_000).toFixed(1)}M`;
  if (n >= 1_000) return `${(n / 1_000).toFixed(1)}K`;
  return String(n);
}
