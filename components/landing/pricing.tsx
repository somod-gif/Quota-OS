"use client";

import { Button } from "@/components/ui/button";
import { Check } from "lucide-react";
import Link from "next/link";

const plans = [
  {
    name: "Starter",
    price: "$0",
    period: "",
    description: "Perfect for personal projects and MVPs.",
    features: [
      "Up to 3 Projects",
      "100,000 Gateway Requests / month",
      "5 API Keys",
      "5 Provider Connections",
      "Basic Rate Limiting",
      "7-Day Request Logs",
      "Basic Analytics",
      "Community Support",
    ],
    cta: "Get Started Free",
    href: "/auth/register",
    featured: false,
  },
  {
    name: "Pro",
    price: "$30",
    period: "/month",
    description: "For startups building production applications.",
    features: [
      "Unlimited Projects",
      "10 Million Gateway Requests / month",
      "Unlimited API Keys",
      "Unlimited Provider Connections",
      "Advanced Rate Limiting",
      "90-Day Request Logs",
      "Real-Time Analytics",
      "Provider Failover",
      "Webhooks",
      "Team Collaboration (Up to 10 Members)",
      "Priority Support",
    ],
    cta: "Start Free Trial",
    href: "/auth/register",
    featured: true,
  },
  {
    name: "Business",
    price: "$90",
    period: "/month",
    description: "For growing companies running mission-critical workloads.",
    features: [
      "Everything in Pro",
      "100 Million Gateway Requests / month",
      "Multi-Workspace Support",
      "Role-Based Access Control (RBAC)",
      "Audit Logs",
      "Custom Quotas & Policies",
      "API Usage Insights",
      "Single Sign-On (SSO)",
      "Advanced Alerts",
      "Premium Support",
    ],
    cta: "Contact Sales",
    href: "/contact",
    featured: false,
  },
  {
    name: "Enterprise",
    price: "Custom",
    period: "",
    description: "For organizations operating at enterprise scale.",
    features: [
      "Unlimited Requests",
      "Unlimited Workspaces",
      "Unlimited Team Members",
      "Dedicated Infrastructure",
      "Bring Your Own Cloud (BYOC)",
      "Custom Integrations",
      "Enterprise SLA",
      "Dedicated Customer Success Manager",
      "24/7 Priority Support",
      "Compliance & Security Reviews",
    ],
    cta: "Contact Sales",
    href: "/contact",
    featured: false,
  },
];

export function Pricing() {
  return (
    <section id="pricing" className="border-t border-border/40 py-24">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="mx-auto max-w-2xl text-center">
          <h2 className="text-3xl font-bold tracking-tight sm:text-4xl">
            Simple, transparent pricing
          </h2>
          <p className="mt-4 text-lg text-muted-foreground">
            Start for free. Scale as your business grows. No hidden fees.
          </p>
        </div>

        <div className="mt-16 grid gap-8 md:grid-cols-2 xl:grid-cols-4">
          {plans.map((plan) => (
            <div
              key={plan.name}
              className={`relative flex flex-col rounded-2xl border ${
                plan.featured
                  ? "border-primary/50 bg-primary/5 shadow-lg shadow-primary/5"
                  : "border-border/50 bg-card"
              } p-8`}
            >
              {plan.featured && (
                <div className="absolute -top-3 left-1/2 -translate-x-1/2">
                  <span className="rounded-full bg-primary px-3 py-1 text-xs font-medium text-primary-foreground">
                    Most Popular
                  </span>
                </div>
              )}

              <div className="mb-6">
                <h3 className="text-lg font-semibold">{plan.name}</h3>
                <div className="mt-2 flex items-baseline gap-1">
                  <span className="text-4xl font-bold">{plan.price}</span>
                  {plan.period && <span className="text-sm text-muted-foreground">{plan.period}</span>}
                </div>
                <p className="mt-2 text-sm text-muted-foreground">{plan.description}</p>
              </div>

              <ul className="mb-8 flex-1 space-y-3">
                {plan.features.map((feature) => (
                  <li key={feature} className="flex items-start gap-3 text-sm">
                    <Check className="h-4 w-4 text-primary shrink-0 mt-0.5" />
                    <span>{feature}</span>
                  </li>
                ))}
              </ul>

              <Button
                variant={plan.featured ? "default" : "outline"}
                className="w-full"
                asChild
              >
                <Link href={plan.href}>{plan.cta}</Link>
              </Button>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
