"use client";

import {
  KeyRound,
  Gauge,
  Network,
  BarChart3,
  BellRing,
  Cable,
  ScrollText,
  Shield,
} from "lucide-react";

const features = [
  {
    icon: KeyRound,
    title: "API Key Management",
    description:
      "Create, rotate, and revoke API keys with granular permissions. Monitor usage per key with automatic expiry and scope-based access control.",
  },
  {
    icon: Gauge,
    title: "Global Rate Limiting",
    description:
      "Configure rate limits at global, user, IP, or key level. Supports token bucket, sliding window, and fixed window strategies.",
  },
  {
    icon: Network,
    title: "Unified Gateway",
    description:
      "Route API requests through a single gateway with built-in caching, retries, circuit breaking, and load balancing across providers.",
  },
  {
    icon: Cable,
    title: "Provider Connections",
    description:
      "Connect and manage third-party API providers. Store auth configurations, set provider-level rate limits, and monitor health status.",
  },
  {
    icon: BarChart3,
    title: "Usage Analytics",
    description:
      "Track request volumes, latency distributions, error rates, and quota consumption with real-time dashboards and exportable reports.",
  },
  {
    icon: ScrollText,
    title: "Request Logs",
    description:
      "Full request and response logging with search, filtering, and correlation IDs. Debug issues with complete payload inspection.",
  },
  {
    icon: BellRing,
    title: "Alerts & Notifications",
    description:
      "Set up alerts on error rates, latency thresholds, and quota limits. Get notified via email, Slack, or webhooks when things need attention.",
  },
  {
    icon: Shield,
    title: "Authentication",
    description:
      "Built-in authentication with Supabase. Support for email/password, OAuth providers, and SSO. Team-based workspace management.",
  },
];

export function Features() {
  return (
    <section id="features" className="border-t border-border/40 py-24">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="mx-auto max-w-2xl text-center">
          <h2 className="text-3xl font-bold tracking-tight sm:text-4xl">
            Everything you need to control your APIs
          </h2>
          <p className="mt-4 text-lg text-muted-foreground">
            A comprehensive platform for managing, monitoring, and securing your API integrations.
          </p>
        </div>

        <div className="mt-16 grid gap-8 sm:grid-cols-2 lg:grid-cols-4">
          {features.map((feature) => {
            const Icon = feature.icon;
            return (
              <div key={feature.title} className="group rounded-xl p-6 transition-all hover:bg-card/50">
                <div className="mb-4 flex h-10 w-10 items-center justify-center rounded-lg bg-primary/10">
                  <Icon className="h-5 w-5 text-primary" />
                </div>
                <h3 className="font-semibold">{feature.title}</h3>
                <p className="mt-2 text-sm leading-6 text-muted-foreground">{feature.description}</p>
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
}
