"use client";

import { useState } from "react";
import { ChevronDown } from "lucide-react";
import { cn } from "@/lib/utils";

const faqs = [
  {
    question: "What is QuotaOS?",
    answer:
      "QuotaOS is an AI-native control plane for external APIs. It sits between your application and third-party APIs, handling authentication, rate limiting, quotas, logging, monitoring, and analytics from a single unified dashboard.",
  },
  {
    question: "How does rate limiting work?",
    answer:
      "QuotaOS supports multiple rate limiting strategies including token bucket, sliding window, and fixed window. You can apply limits at global, user, IP, or API key level with configurable windows and max request counts.",
  },
  {
    question: "Can I use my own API keys?",
    answer:
      "Yes. QuotaOS acts as a proxy and gateway for your existing third-party APIs. You configure your provider API keys in the dashboard, and QuotaOS handles the authentication and routing.",
  },
  {
    question: "What providers are supported?",
    answer:
      "QuotaOS works with any REST API. You can connect providers like OpenAI, Stripe, SendGrid, Twilio, GitHub, and any custom API by configuring the base URL and authentication method.",
  },
  {
    question: "Is there a free tier?",
    answer:
      "Yes. Our Starter plan is free forever and includes up to 3 projects, 10,000 requests per day, basic rate limiting, and 7-day log retention.",
  },
  {
    question: "How is data stored and secured?",
    answer:
      "All data is encrypted at rest and in transit. We use Supabase for our database with row-level security. API keys are hashed before storage. We never log sensitive credential data.",
  },
];

export function FAQ() {
  const [openIndex, setOpenIndex] = useState<number | null>(null);

  return (
    <section id="faq" className="border-t border-border/40 py-24">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="mx-auto max-w-2xl text-center">
          <h2 className="text-3xl font-bold tracking-tight sm:text-4xl">
            Frequently asked questions
          </h2>
          <p className="mt-4 text-lg text-muted-foreground">
            Everything you need to know about QuotaOS.
          </p>
        </div>

        <div className="mx-auto mt-16 max-w-3xl divide-y divide-border/50">
          {faqs.map((faq, index) => {
            const isOpen = openIndex === index;
            return (
              <div key={index} className="py-5">
                <button
                  onClick={() => setOpenIndex(isOpen ? null : index)}
                  className="flex w-full items-center justify-between text-left"
                >
                  <span className="text-base font-medium">{faq.question}</span>
                  <ChevronDown
                    className={cn(
                      "h-4 w-4 shrink-0 text-muted-foreground transition-transform duration-200",
                      isOpen && "rotate-180",
                    )}
                  />
                </button>
                {isOpen && (
                  <p className="mt-3 pr-8 text-sm leading-7 text-muted-foreground">
                    {faq.answer}
                  </p>
                )}
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
}
