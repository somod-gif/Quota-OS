"use client"

import { Callout } from "fumadocs-ui/components/callout"
import { Accordion, Accordions } from "fumadocs-ui/components/accordion"
import { Tab, Tabs } from "fumadocs-ui/components/tabs"
import { TypeTable } from "fumadocs-ui/components/type-table"
import { Steps, Step } from "fumadocs-ui/components/steps"

function Pre({ children }: { children: string }) {
  return <pre className="rounded-lg bg-muted p-3 text-sm overflow-x-auto">{children}</pre>
}

export default function DocsPage() {
  return (
    <article className="mx-auto max-w-4xl py-8 px-6">
      <h1 className="mb-2 text-3xl font-bold">QuotaOS API Reference</h1>
      <p className="mb-8 text-muted-foreground">
        Base URL: <code>https://quotaos.app/api/v1</code>
      </p>

      <Callout title="Authentication">
        All requests require a valid API key in the <code>Authorization</code> header:
        <Pre>Authorization: Bearer qos_prod_a1b2c3d4.s3cret...</Pre>
      </Callout>

      <h2 className="mb-4 mt-8 text-2xl font-semibold">Endpoints</h2>

      <Accordions type="multiple">
        <Accordion title="GET /api/v1/keys/validate — Validate a key">
          <p className="mb-4 text-muted-foreground">Check if an API key is valid and active.</p>
          <Tabs items={["Request", "Response"]}>
            <Tab value="Request">
              <Pre>{`GET /api/v1/keys/validate
Authorization: Bearer <key>`}</Pre>
            </Tab>
            <Tab value="Response">
              <Pre>{`{
  "valid": true,
  "project_id": "uuid",
  "workspace_id": "uuid"
}`}</Pre>
            </Tab>
          </Tabs>
        </Accordion>

        <Accordion title="POST /api/v1/keys — Create an API key">
          <p className="mb-4 text-muted-foreground">Create a new API key for a project.</p>
          <Tabs items={["Request", "Response"]}>
            <Tab value="Request">
              <Pre>{`POST /api/v1/keys
Authorization: Bearer <key>
Content-Type: application/json

{
  "name": "My Key"
}`}</Pre>
            </Tab>
            <Tab value="Response">
              <Callout type="warn">The full key is only shown once. Save it immediately.</Callout>
              <Pre>{`{
  "key": "qos_a1b2c3d4.s3cret...",
  "id": "uuid",
  "key_prefix": "qos_a1b2c3d4",
  "key_last_four": "f8a2"
}`}</Pre>
            </Tab>
          </Tabs>
        </Accordion>

        <Accordion title="POST /api/v1/rate-limit — Check rate limit">
          <p className="mb-4 text-muted-foreground">Check or consume rate limit for the authenticated key.</p>
          <Tabs items={["Request", "Response"]}>
            <Tab value="Request">
              <Pre>{`POST /api/v1/rate-limit
Authorization: Bearer <key>
Content-Type: application/json

{
  "max_requests": 100,
  "window_ms": 60000
}`}</Pre>
            </Tab>
            <Tab value="Response">
              <Pre>{`{
  "success": true,
  "remaining": 99,
  "reset": 1712345678000
}`}</Pre>
            </Tab>
          </Tabs>
          <TypeTable
            type={{
              max_requests: { type: "number", description: "Maximum requests allowed in the window" },
              window_ms: { type: "number", description: "Time window in milliseconds (e.g. 60000 = 1 minute)" },
              success: { type: "boolean", description: "Whether the request is within the limit" },
              remaining: { type: "number", description: "Requests remaining in the current window" },
              reset: { type: "number", description: "Unix timestamp when the window resets" },
            }}
          />
        </Accordion>

        <Accordion title="POST /api/v1/logs — Ingest a log entry">
          <p className="mb-4 text-muted-foreground">Record an API request log for analytics and monitoring.</p>
          <Tabs items={["Request", "Response"]}>
            <Tab value="Request">
              <Pre>{`POST /api/v1/logs
Authorization: Bearer <key>
Content-Type: application/json

{
  "method": "GET",
  "path": "/api/users",
  "status_code": 200,
  "latency_ms": 42,
  "ip_address": "1.2.3.4"
}`}</Pre>
            </Tab>
            <Tab value="Response">
              <Pre>{`{
  "id": "uuid-1234-5678"
}`}</Pre>
            </Tab>
          </Tabs>
        </Accordion>
      </Accordions>

      <h2 className="mb-4 mt-8 text-2xl font-semibold">Quick Start</h2>
      <Steps>
        <Step>
          <h3 className="text-lg font-medium">Get an API key</h3>
          <p>Create an API key from the dashboard at <strong>API Keys → Create API Key</strong>.</p>
          <Callout>Copy the key immediately — it won&apos;t be shown again.</Callout>
        </Step>
        <Step>
          <h3 className="text-lg font-medium">Validate the key</h3>
          <p>Test your key by calling the validate endpoint:</p>
          <Pre>{`curl -H "Authorization: Bearer <key>" \\
  https://quotaos.app/api/v1/keys/validate`}</Pre>
        </Step>
        <Step>
          <h3 className="text-lg font-medium">Check rate limits</h3>
          <p>Before making external API calls, check your rate limit status:</p>
          <Pre>{`curl -X POST https://quotaos.app/api/v1/rate-limit \\
  -H "Authorization: Bearer <key>" \\
  -H "Content-Type: application/json" \\
  -d '{ "max_requests": 100, "window_ms": 60000 }'`}</Pre>
        </Step>
        <Step>
          <h3 className="text-lg font-medium">Log requests</h3>
          <p>Ingest request logs for analytics:</p>
          <Pre>{`curl -X POST https://quotaos.app/api/v1/logs \\
  -H "Authorization: Bearer <key>" \\
  -H "Content-Type: application/json" \\
  -d '{ "method": "GET", "path": "/api/users", "status_code": 200, "latency_ms": 42 }'`}</Pre>
        </Step>
      </Steps>
    </article>
  )
}
