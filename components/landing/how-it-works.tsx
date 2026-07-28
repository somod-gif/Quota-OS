"use client";

import { ArrowRight } from "lucide-react";

const steps = [
  {
    number: "01",
    title: "Create a project",
    description:
      "Set up your first project in seconds. Each project gets its own API keys, rate limits, and gateway configuration.",
  },
  {
    number: "02",
    title: "Connect providers",
    description:
      "Add your third-party API providers like OpenAI, Stripe, or SendGrid. Configure authentication and rate limits per provider.",
  },
  {
    number: "03",
    title: "Configure gateway",
    description:
      "Define your API endpoints with methods, paths, and target URLs. Attach rate limits and caching rules to each endpoint.",
  },
  {
    number: "04",
    title: "Monitor & scale",
    description:
      "Track real-time usage, latency, and error rates. Set up alerts and let QuotaOS handle the rest.",
  },
];

export function HowItWorks() {
  return (
    <section id="how-it-works" className="border-t border-border/40 py-24">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="mx-auto max-w-2xl text-center">
          <h2 className="text-3xl font-bold tracking-tight sm:text-4xl">
            How it works
          </h2>
          <p className="mt-4 text-lg text-muted-foreground">
            Get started in minutes with a simple four-step workflow.
          </p>
        </div>

        <div className="mt-16 grid gap-8 md:grid-cols-4">
          {steps.map((step, index) => (
            <div key={step.number} className="relative">
              {index < steps.length - 1 && (
                <div className="absolute right-0 top-8 hidden md:block">
                  <ArrowRight className="h-5 w-5 text-muted-foreground/30" />
                </div>
              )}
              <div className="space-y-4">
                <div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-primary/10">
                  <span className="text-2xl font-bold text-primary">{step.number}</span>
                </div>
                <h3 className="text-lg font-semibold">{step.title}</h3>
                <p className="text-sm leading-6 text-muted-foreground">{step.description}</p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
