"use client"

import {
  Card, CardContent, CardHeader, CardTitle,
} from "@/components/ui/card"
import { Activity, AlertTriangle, Gauge, Shield } from "lucide-react"
import type { UsageSummary } from "@/types"

interface OverviewCardsProps {
  summary: UsageSummary
}

export function OverviewCards({ summary }: OverviewCardsProps) {
  const cards = [
    {
      title: "Total Requests",
      value: summary.totalRequests.toLocaleString(),
      icon: Activity,
      change: "+12%",
    },
    {
      title: "Error Rate",
      value: `${summary.errorRate}%`,
      icon: AlertTriangle,
      change: `${summary.totalErrors} errors`,
    },
    {
      title: "Avg Latency",
      value: `${summary.avgLatency}ms`,
      icon: Gauge,
      change: "Last 7 days",
    },
    {
      title: "Rate Limited",
      value: summary.totalRateLimited.toLocaleString(),
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
