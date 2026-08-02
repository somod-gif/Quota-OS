"use client"

import {
  Card, CardContent, CardHeader, CardTitle,
} from "@/components/ui/card"
import { Activity, AlertTriangle, Gauge, Shield } from "lucide-react"
import type { UsageSummary } from "@/types"

interface OverviewCardsProps {
  summary: UsageSummary | null
}

const EMPTY_SUMMARY: UsageSummary = {
  totalRequests: 0,
  totalBlocked: 0,
  totalRateLimited: 0,
  totalCached: 0,
  totalErrors: 0,
  avgLatency: 0,
  errorRate: 0,
}

export function OverviewCards({ summary }: OverviewCardsProps) {
  const s = summary ?? EMPTY_SUMMARY
  const cards = [
    {
      title: "Total Requests",
      value: s.totalRequests.toLocaleString(),
      icon: Activity,
      change: "Last 7 days",
    },
    {
      title: "Error Rate",
      value: `${s.errorRate}%`,
      icon: AlertTriangle,
      change: `${s.totalErrors} errors`,
    },
    {
      title: "Avg Latency",
      value: `${s.avgLatency}ms`,
      icon: Gauge,
      change: "Last 7 days",
    },
    {
      title: "Rate Limited",
      value: s.totalRateLimited.toLocaleString(),
      icon: Shield,
      change: "Last 7 days",
    },
  ]

  return (
    <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
      {cards.map((card) => (
        <Card key={card.title}>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">{card.title}</CardTitle>
            <card.icon className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{card.value}</div>
            <p className="text-xs text-muted-foreground">{card.change}</p>
          </CardContent>
        </Card>
      ))}
    </div>
  )
}
