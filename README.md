<div align="center">
  <picture>
    <source media="(prefers-color-scheme: dark)" srcset="https://quotaos.com/og-dark.png">
    <img alt="QuotaOS" src="https://quotaos.com/og.png" width="400">
  </picture>

  <h1>QuotaOS</h1>
  <p><strong>The AI-Native API Infrastructure Platform</strong></p>

  <p>A unified control plane for managing external API authentication, rate limiting, quotas, logging, and analytics.</p>

  <p>
    <a href="#installation"><img src="https://img.shields.io/badge/dynamic/json?url=https%3A%2F%2Fraw.githubusercontent.com%2Fquotaos%2Fquotaos%2Fmain%2Fpackage.json&query=%24.version&label=Version" alt="Version"></a>
    <a href="https://nextjs.org"><img src="https://img.shields.io/badge/Next.js-16-000?logo=next.js" alt="Next.js 16"></a>
    <a href="#license"><img src="https://img.shields.io/badge/License-MIT-green" alt="MIT License"></a>
    <a href="https://github.com/quotaos/quotaos/actions"><img src="https://img.shields.io/badge/Build-Passing-brightgreen" alt="Build"></a>
    <a href="https://github.com/quotaos/quotaos"><img src="https://img.shields.io/github/stars/quotaos/quotaos?style=social" alt="Stars"></a>
  </p>
</div>

---

## Table of Contents

- [Project Overview](#project-overview)
- [Why QuotaOS Exists](#why-quotaos-exists)
- [Key Features](#key-features)
- [Architecture](#architecture)
- [Technology Stack](#technology-stack)
- [System Architecture Diagram](#system-architecture-diagram)
- [Database Schema](#database-schema)
- [Folder Structure](#folder-structure)
- [Screenshots](#screenshots)
- [Prerequisites](#prerequisites)
- [Installation](#installation)
- [Docker Setup](#docker-setup)
- [Environment Variables](#environment-variables)
- [Development Workflow](#development-workflow)
- [API Examples](#api-examples)
- [SDK Examples](#sdk-examples)
- [Authentication](#authentication)
- [Rate Limiting](#rate-limiting)
- [Logging & Analytics](#logging--analytics)
- [Testing](#testing)
- [Deployment](#deployment)
- [Security](#security)
- [Roadmap](#roadmap)
- [Contributing](#contributing)
- [License](#license)

---

## Project Overview

**QuotaOS** is an AI-native API Infrastructure Platform — a unified control plane for managing authentication, rate limiting, quotas, request logging, and usage analytics across all your external API integrations.

Think **Kong** + **Cloudflare API Gateway** + **Upstash** combined into a single, open-source platform that you can self-host or deploy to the cloud.

QuotaOS provides:

- A **developer dashboard** to manage workspaces, projects, API keys, providers, and gateway endpoints
- A **proxy middleware** that handles authentication, IP rate limiting, and security headers
- A **RESTful API** for programmatic key management, rate limit checking, and request logging
- **Fumadocs** documentation for end-user reference
- **Usage analytics** with charts for requests, latency, error rates, and more

Whether you're building AI applications that call multiple LLM providers, managing a microservices mesh, or running an API marketplace, QuotaOS gives you the infrastructure layer you need to operate at scale.

---

## Why QuotaOS Exists

Modern applications depend on dozens of external APIs — LLM providers (OpenAI, Anthropic, Google), payment gateways, SaaS platforms, cloud services, and more. Yet the tooling for managing these integrations is fragmented:

- **No unified auth layer** — Each integration manages its own API keys and credentials
- **No centralized rate limiting** — You rely on each provider's own rate limit enforcement, leading to 429s and cascading failures
- **No request observability** — Understanding which API calls are failing, how fast they respond, and who is making them requires plumbing logs through separate systems
- **No quota management** — Tracking usage across teams, projects, and workspaces is manual or non-existent
- **No security governance** — API key rotation, encryption of credentials, and access control are afterthoughts

QuotaOS solves all of these problems by providing a **control plane** that sits between your application and the external APIs it calls.

---

## Key Features

### Workspace Engine
Multi-tenant workspaces with role-based access control (owner, admin, member). Users can belong to multiple workspaces and switch between them seamlessly. Each workspace has its own isolated projects, API keys, providers, and configuration.

### Projects
Organize your integrations into projects within a workspace. Each project acts as a logical container for API keys, providers, rate limit rules, gateway endpoints, and logs.

### API Key Management
Generate scoped API keys with SHA-256 hashing for secure storage. Keys follow the format `qos_<prefix>.<secret>` — only the hash and last four characters are stored. Keys can be named, activated, deactivated, and set to expire.

### Provider Connections
Securely store external provider credentials (API keys, base URLs, auth config) with **AES-256-GCM** encryption at rest. Supports any auth type — API key, Bearer token, OAuth — with configurable JSON payloads.

### Gateway Engine
Define proxy endpoints that route requests to external providers. Each endpoint specifies a path, HTTP method, target URL, and optional rate limit rule and cache TTL. The gateway can be extended with a forward proxy for production routing.

### Global Rate Limiting
Configure rate limit rules with configurable windows (in milliseconds), max requests, and strategy (sliding window, fixed window). Scoped per project or globally. Uses Upstash Redis for distributed rate limiting in production.

### Request Logging
All API requests can be logged with method, path, status code, latency, IP address, user agent, headers, body sizes, and error information. Logs are filterable by method, status code range, and search terms.

### Usage Analytics
Aggregated usage metrics with 7-day overview including total requests, blocked requests, rate-limited requests, cached responses, error counts, average latency, and P99 latency. Visualized in the dashboard with requests, latency, and error rate charts.

### Dashboard
Built with Next.js 16 App Router, React 19, and shadcn/ui. Provides overview cards, requests/latency charts, recent logs table, top APIs, and error rate monitoring. Full sidebar navigation for all management features.

### Developer SDK (REST API)
A RESTful API at `/api/v1/` for programmatic access to key validation, key creation, rate limit checking, and request logging — all authenticated via Bearer tokens.

### Fumadocs Documentation
End-user documentation served via Fumadocs with MDX support, search, and a dedicated `/docs` route.

### Security
- **IP rate limiting** — In-memory rate limiter in the proxy layer (30 req/min per IP)
- **Security headers** — `X-Content-Type-Options`, `X-Frame-Options`, `X-XSS-Protection`, `Referrer-Policy`
- **Encryption** — Provider credentials encrypted with AES-256-GCM
- **Input validation** — All API inputs validated with Zod schemas
- **Authentication** — API keys authenticated via SHA-256 hash comparison

---

## Architecture

QuotaOS is built on **Next.js 16 App Router** with the following high-level architecture:

```
┌─────────────────────────────────────────────────────────┐
│                    Client / Application                   │
└──────────────┬──────────────────────────────────────────┘
               │
               ▼
┌─────────────────────────────────────────────────────────┐
│              Next.js 16 Middleware (proxy.ts)             │
│  • IP Rate Limiting (in-memory, 30 req/min per IP)       │
│  • Security Headers                                      │
│  • Supabase Auth Session Validation                      │
│  • Public path bypass                                    │
└──────────────┬──────────────────────────────────────────┘
               │
               ▼
┌─────────────────────────────────────────────────────────┐
│                  API Routes (/api/v1/)                    │
│  • /keys — Create & manage API keys                     │
│  • /keys/validate — Validate API key                    │
│  • /rate-limit — Check rate limits                      │
│  • /logs — Ingest request logs                          │
└──────────────┬──────────────────────────────────────────┘
               │
               ▼
┌─────────────────────────────────────────────────────────┐
│              Server Actions (Dashboard)                  │
│  • Workspace CRUD                                       │
│  • Project CRUD                                         │
│  • API Key CRUD                                         │
│  • Provider CRUD                                        │
│  • Gateway Endpoint CRUD                                │
│  • Rate Limit Rule CRUD                                 │
│  • Alert CRUD                                           │
│  • Usage & Analytics Queries                            │
└──────────────┬──────────────────────────────────────────┘
               │
               ▼
┌─────────────────────────────────────────────────────────┐
│                    Data Layer                             │
│  ┌──────────────┐  ┌──────────────┐  ┌───────────────┐  │
│  │  PostgreSQL   │  │    Upstash   │  │    Supabase    │  │
│  │  (Drizzle ORM)│  │    Redis     │  │    Auth        │  │
│  │  • Schema     │  │  • Rate      │  │  • Sessions   │  │
│  │  • Migrations │  │    Limits    │  │  • OAuth      │  │
│  │  • Relations  │  │  • Caching   │  │  • Users      │  │
│  └──────────────┘  └──────────────┘  └───────────────┘  │
└─────────────────────────────────────────────────────────┘
```

**Key architectural decisions:**

- **Next.js 16 Turbopack** — Lightning-fast development with Turbopack for HMR and builds
- **Drizzle ORM + PostgreSQL** — Type-safe database access with auto-generated migrations
- **Supabase Auth** — Authentication managed by Supabase (email/password, OAuth, magic links)
- **Upstash Redis** — Serverless Redis for distributed rate limiting and caching
- **Zod Validation** — Runtime validation for all API inputs and environment variables
- **Server Actions** — All dashboard mutations use Next.js Server Actions for progressive enhancement
- **React Query** — Client-side data fetching with caching and optimistic updates

---

## Technology Stack

| Category              | Technology                                                                 |
|-----------------------|----------------------------------------------------------------------------|
| **Framework**         | [Next.js 16](https://nextjs.org) (App Router, Turbopack)                   |
| **React**             | React 19                                                                   |
| **Language**          | TypeScript 5                                                               |
| **Database**          | PostgreSQL (via [Drizzle ORM](https://orm.drizzle.team) 0.45)              |
| **Authentication**    | [Supabase Auth](https://supabase.com/auth) (SSR)                           |
| **Rate Limiting**     | [Upstash Redis](https://upstash.com) + in-memory IP limiter                |
| **Validation**        | [Zod](https://zod.dev) 4                                                   |
| **UI Library**        | [shadcn/ui](https://ui.shadcn.com) (Radix UI) + [Tailwind CSS 4](https://tailwindcss.com) |
| **Icons**             | [Lucide React](https://lucide.dev)                                         |
| **Forms**             | React Hook Form + Hookform Resolvers                                       |
| **Data Fetching**     | [TanStack React Query](https://tanstack.com/query) 5                       |
| **Tables**            | [TanStack React Table](https://tanstack.com/table) 8                       |
| **Theme**             | next-themes (dark/light mode)                                              |
| **Documentation**     | [Fumadocs](https://fumadocs.vercel.app) + MDX                             |
| **Logging**           | [Pino](https://getpino.io)                                                 |
| **Date Utilities**    | date-fns                                                                   |
| **Testing**           | [Vitest](https://vitest.dev) + Testing Library                             |
| **Linting**           | ESLint 9 + Prettier                                                        |
| **Encryption**        | Node.js `crypto` (AES-256-GCM, SHA-256)                                   |

---

## System Architecture Diagram

```
                         ┌─────────────────────────────────┐
                         │        Your Application          │
                         │   (Client / Server / Mobile)     │
                         └──────────────┬──────────────────┘
                                        │
                         HTTTPS          │  API Key: qos_xxx.yyy
                                        │
                                        ▼
┌──────────────────────────────────────────────────────────────────────┐
│                        QuotaOS Proxy Layer                            │
│                                                                       │
│  ┌─────────────────────┐    ┌────────────────────────────────────┐   │
│  │  IP Rate Limiter     │    │  Security Headers                  │   │
│  │  (30 req/min per IP) │───▶│  • X-Content-Type-Options         │   │
│  │  In-memory Map       │    │  • X-Frame-Options: DENY          │   │
│  └─────────────────────┘    │  • X-XSS-Protection                │   │
│                             │  • Referrer-Policy                 │   │
│                             └──────────────┬─────────────────────┘   │
│                                            │                         │
│  ┌─────────────────────────────────────────▼────────────────────┐   │
│  │  Supabase Auth Middleware                                     │   │
│  │  • Validates user session for /dashboard routes              │   │
│  │  • Redirects unauthenticated requests to /auth/login         │   │
│  │  • Public paths (/, /auth/*, /docs*) bypass auth checks      │   │
│  └─────────────────────────────────────────────────────────────┘   │
└──────────────────────────────────────────────────────────────────────┘
                                        │
                         ┌──────────────┴────────────────┐
                         │                               │
                         ▼                               ▼
          ┌─────────────────────────┐     ┌──────────────────────────┐
          │    Public / Auth Routes   │     │    API Routes (/api/v1/) │
          │                          │     │                          │
          │  /           Landing     │     │  POST /keys              │
          │  /auth/*     Auth pages  │     │  GET  /keys/validate     │
          │  /docs       Docs        │     │  POST /rate-limit        │
          │                          │     │  POST /logs              │
          └──────────────────────────┘     └──────────┬───────────────┘
                                                       │
                                                       ▼
                                        ┌──────────────────────────┐
                                        │   API Key Authentication  │
                                        │                          │
                                        │  1. Extract Bearer token │
                                        │  2. Parse prefix         │
                                        │  3. SHA-256 hash token   │
                                        │  4. Look up by prefix    │
                                        │  5. Compare hashes       │
                                        │  6. Check status/expiry  │
                                        │  7. Update last_used_at  │
                                        └──────────┬───────────────┘
                                                       │
                                                       ▼
┌──────────────────────────────────────────────────────────────────────┐
│                         QuotaOS Dashboard                            │
│                                                                      │
│  ┌─────────┐ ┌──────────┐ ┌──────────┐ ┌─────────┐ ┌────────────┐  │
│  │Overview  │ │ Projects │ │ API Keys │ │Providers│ │  Gateway   │  │
│  │  Cards   │ │   List   │ │   List   │ │  List   │ │ Endpoints  │  │
│  │  Charts  │ │  Create  │ │  Create  │ │ Create  │ │   Create   │  │
│  │  Logs    │ │  Edit    │ │  Revoke  │ │ Encrypt │ │   Edit     │  │
│  └─────────┘ └──────────┘ └──────────┘ └─────────┘ └────────────┘  │
│  ┌─────────┐ ┌──────────┐ ┌──────────┐ ┌────────────────────────┐  │
│  │  Usage  │ │   Logs   │ │  Rate    │ │       Alerts           │  │
│  │Analytics│ │  Filter  │ │  Limits  │ │   Create / Edit        │  │
│  │ 7-Day   │ │  Search  │ │  Rules   │ │   Email Notifications  │  │
│  │  View   │ │          │ │  Manage  │ │                        │  │
│  └─────────┘ └──────────┘ └──────────┘ └────────────────────────┘  │
└──────────────────────────────────────────────────────────────────────┘
                                        │
                                        ▼
┌──────────────────────────────────────────────────────────────────────┐
│                          Data Layer                                  │
│                                                                      │
│  ┌─────────────────────────────────────────────────────────────┐    │
│  │                     PostgreSQL (via Drizzle ORM)              │    │
│  │                                                              │    │
│  │  workspaces ──▶ workspace_members ──▶ projects ──▶ api_keys  │    │
│  │       │                │                   │                  │    │
│  │       │                │                   ├── providers       │    │
│  │       │                │                   ├── rate_limits     │    │
│  │       │                │                   ├── gateway_endpts  │    │
│  │       │                │                   ├── request_logs    │    │
│  │       │                │                   ├── usage_records   │    │
│  │       │                │                   └── alerts          │    │
│  │       │                │                                        │    │
│  │       └── invitations  │                                        │    │
│  └─────────────────────────────────────────────────────────────┘    │
│                                                                      │
│  ┌─────────────────────────────────────────────────────────────┐    │
│  │              Upstash Redis (optional)                        │    │
│  │                                                              │    │
│  │  • Distributed rate limiting: ratelimit:{key}:{window}       │    │
│  │  • Response caching: cache:{key}                             │    │
│  └─────────────────────────────────────────────────────────────┘    │
│                                                                      │
│  ┌─────────────────────────────────────────────────────────────┐    │
│  │            Supabase Auth (external)                          │    │
│  │                                                              │    │
│  │  • User management & sessions                                │    │
│  │  • Email/password & OAuth providers                          │    │
│  │  • SSR cookie-based auth                                     │    │
│  └─────────────────────────────────────────────────────────────┘    │
└──────────────────────────────────────────────────────────────────────┘
```

---

## Database Schema

QuotaOS uses PostgreSQL with Drizzle ORM. The schema consists of the following main tables:

### `workspaces`
| Column       | Type            | Description                    |
|-------------|-----------------|--------------------------------|
| `id`        | `uuid` (PK)     | Auto-generated unique ID       |
| `name`      | `varchar(255)`  | Workspace display name         |
| `slug`      | `varchar(255)`  | Unique URL-friendly identifier |
| `created_at`| `timestamp`     | Auto-set creation time         |
| `updated_at`| `timestamp`     | Auto-set update time           |

### `workspace_members`
| Column         | Type             | Description                      |
|---------------|------------------|----------------------------------|
| `id`          | `uuid` (PK)      | Auto-generated unique ID         |
| `workspace_id`| `uuid` (FK)      | References `workspaces.id`        |
| `user_id`     | `uuid`           | Supabase Auth user ID            |
| `role`        | `varchar(20)`    | `owner`, `admin`, or `member`    |
| `created_at`  | `timestamp`      | Auto-set creation time           |

Unique constraint on `(workspace_id, user_id)`.

### `invitations`
| Column         | Type             | Description                      |
|---------------|------------------|----------------------------------|
| `id`          | `uuid` (PK)      | Auto-generated unique ID         |
| `workspace_id`| `uuid` (FK)      | References `workspaces.id`        |
| `email`       | `varchar(255)`   | Invited user's email             |
| `role`        | `varchar(20)`    | Role to assign                   |
| `token`       | `varchar(64)`    | Unique invitation token          |
| `status`      | `varchar(20)`    | `pending`, `accepted`, `expired` |
| `invited_by`  | `uuid`           | User ID of the inviter           |
| `expires_at`  | `timestamp`      | Invitation expiration            |
| `created_at`  | `timestamp`      | Auto-set creation time           |
| `updated_at`  | `timestamp`      | Auto-set update time             |

### `projects`
| Column         | Type             | Description                      |
|---------------|------------------|----------------------------------|
| `id`          | `uuid` (PK)      | Auto-generated unique ID         |
| `workspace_id`| `uuid` (FK)      | References `workspaces.id`        |
| `name`        | `varchar(255)`   | Project display name             |
| `slug`        | `varchar(255)`   | Unique per-workspace slug        |
| `description` | `text`           | Optional description             |
| `created_at`  | `timestamp`      | Auto-set creation time           |
| `updated_at`  | `timestamp`      | Auto-set update time             |

Unique index on `(workspace_id, slug)`.

### `api_keys`
| Column          | Type             | Description                      |
|----------------|------------------|----------------------------------|
| `id`           | `uuid` (PK)      | Auto-generated unique ID         |
| `project_id`   | `uuid` (FK)      | References `projects.id`          |
| `name`         | `varchar(255)`   | Key display name                 |
| `key_prefix`   | `varchar(20)`    | First 12 chars (`qos_...`)       |
| `key_hash`     | `text`           | SHA-256 hash of the full key     |
| `key_last_four`| `varchar(4)`     | Last 4 chars of the secret       |
| `status`       | `varchar(20)`    | `active` or `inactive`           |
| `expires_at`   | `timestamp`      | Optional expiration date         |
| `last_used_at` | `timestamp`      | Last authentication timestamp    |
| `created_at`   | `timestamp`      | Auto-set creation time           |
| `updated_at`   | `timestamp`      | Auto-set update time             |

### `providers`
| Column            | Type             | Description                      |
|------------------|------------------|----------------------------------|
| `id`             | `uuid` (PK)      | Auto-generated unique ID         |
| `project_id`     | `uuid` (FK)      | References `projects.id`          |
| `name`           | `varchar(255)`   | Provider display name            |
| `base_url`       | `text`           | API base URL                     |
| `auth_type`      | `varchar(20)`    | `api_key`, `bearer`, `oauth`     |
| `auth_config`    | `jsonb`          | AES-256-GCM encrypted credentials|
| `rate_limit_rpm` | `integer`        | Requests per minute limit        |
| `rate_limit_rpd` | `integer`        | Requests per day limit           |
| `status`         | `varchar(20)`    | `active` or `inactive`           |
| `created_at`     | `timestamp`      | Auto-set creation time           |
| `updated_at`     | `timestamp`      | Auto-set update time             |

### `rate_limits`
| Column         | Type             | Description                      |
|---------------|------------------|----------------------------------|
| `id`          | `uuid` (PK)      | Auto-generated unique ID         |
| `project_id`  | `uuid` (FK)      | References `projects.id`          |
| `name`        | `varchar(255)`   | Rule display name                |
| `max_requests`| `integer`        | Maximum requests in the window   |
| `window_ms`   | `integer`        | Time window in milliseconds      |
| `strategy`    | `varchar(30)`    | `sliding_window` or `fixed_window`|
| `scope`       | `varchar(20)`    | `global` or `per_ip`             |
| `status`      | `varchar(20)`    | `active` or `inactive`           |
| `created_at`  | `timestamp`      | Auto-set creation time           |
| `updated_at`  | `timestamp`      | Auto-set update time             |

### `gateway_endpoints`
| Column          | Type             | Description                      |
|----------------|------------------|----------------------------------|
| `id`           | `uuid` (PK)      | Auto-generated unique ID         |
| `project_id`   | `uuid` (FK)      | References `projects.id`          |
| `name`         | `varchar(255)`   | Endpoint display name            |
| `path`         | `text`           | Proxy path (e.g., `/v1/chat`)    |
| `method`       | `varchar(10)`    | `GET`, `POST`, `PUT`, etc.       |
| `provider_id`  | `uuid` (FK)      | References `providers.id`         |
| `target_url`   | `text`           | Upstream API URL                 |
| `rate_limit_id`| `uuid` (FK)      | References `rate_limits.id`       |
| `cache_ttl`    | `integer`        | Cache TTL in seconds             |
| `status`       | `varchar(20)`    | `active` or `inactive`           |
| `created_at`   | `timestamp`      | Auto-set creation time           |
| `updated_at`   | `timestamp`      | Auto-set update time             |

### `request_logs`
| Column               | Type             | Description                      |
|---------------------|------------------|----------------------------------|
| `id`                | `uuid` (PK)      | Auto-generated unique ID         |
| `project_id`        | `uuid` (FK)      | References `projects.id`          |
| `endpoint_id`       | `uuid` (FK)      | References `gateway_endpoints.id` |
| `api_key_id`        | `uuid` (FK)      | References `api_keys.id`          |
| `method`            | `varchar(10)`    | HTTP method                      |
| `path`              | `text`           | Request path                     |
| `status_code`       | `integer`        | HTTP response status code        |
| `latency_ms`        | `integer`        | Request latency in milliseconds  |
| `ip_address`        | `varchar(45)`    | Client IP address                |
| `user_agent`        | `text`           | User agent string                |
| `blocked`           | `boolean`        | Was request blocked by security  |
| `rate_limited`      | `boolean`        | Was request rate limited         |
| `cached`            | `boolean`        | Was response served from cache   |
| `error`             | `text`           | Error message if any             |
| `request_headers`   | `jsonb`          | Request headers                  |
| `response_headers`  | `jsonb`          | Response headers                 |
| `request_body_size` | `integer`        | Request body size in bytes       |
| `response_body_size`| `integer`        | Response body size in bytes      |
| `created_at`        | `timestamp`      | Auto-set creation time           |

### `usage_records`
| Column            | Type             | Description                      |
|------------------|------------------|----------------------------------|
| `id`             | `uuid` (PK)      | Auto-generated unique ID         |
| `project_id`     | `uuid` (FK)      | References `projects.id`          |
| `timestamp`      | `timestamp`      | Aggregation period start         |
| `requests`       | `integer`        | Total request count              |
| `blocked`        | `integer`        | Blocked request count            |
| `rate_limited`   | `integer`        | Rate-limited request count       |
| `cached`         | `integer`        | Cached response count            |
| `errors`         | `integer`        | Error response count             |
| `avg_latency_ms` | `integer`        | Average latency                  |
| `p99_latency_ms` | `integer`        | 99th percentile latency          |

### `alerts`
| Column            | Type             | Description                      |
|------------------|------------------|----------------------------------|
| `id`             | `uuid` (PK)      | Auto-generated unique ID         |
| `project_id`     | `uuid` (FK)      | References `projects.id`          |
| `name`           | `varchar(255)`   | Alert display name               |
| `metric`         | `varchar(30)`    | `error_rate`, `latency`, `requests`|
| `condition`      | `varchar(10)`    | `gt` (greater than)              |
| `threshold`      | `integer`        | Threshold value                  |
| `window_ms`      | `integer`        | Evaluation window                |
| `channels`       | `text[]`         | Notification channels (`email`)  |
| `enabled`        | `boolean`        | Whether the alert is active      |
| `last_triggered_at`| `timestamp`    | Last time alert was triggered    |
| `created_at`     | `timestamp`      | Auto-set creation time           |
| `updated_at`     | `timestamp`      | Auto-set update time             |

---

## Folder Structure

```
quota-os/
├── .env                          # Environment variables
├── .gitignore                    # Git ignore rules
├── AGENTS.md                     # AI agent instructions
├── CLAUDE.md                     # Claude AI context
├── components.json               # shadcn/ui configuration
├── drizzle.config.ts             # Drizzle Kit configuration
├── eslint.config.mjs             # ESLint 9 flat config
├── next.config.js                # Next.js configuration
├── next-env.d.ts                 # Next.js TypeScript declarations
├── package.json                  # Dependencies and scripts
├── postcss.config.mjs            # PostCSS configuration
├── tsconfig.json                 # TypeScript configuration
├── vitest.config.ts              # Vitest test configuration
│
├── public/                       # Static assets
│   ├── file.svg
│   ├── globe.svg
│   ├── next.svg
│   ├── vercel.svg
│   └── window.svg
│
├── components/                   # Reusable UI components (shadcn/ui)
│   └── ui/
│       ├── badge.tsx
│       ├── button.tsx
│       ├── card.tsx
│       ├── dialog.tsx
│       ├── dropdown-menu.tsx
│       ├── form.tsx
│       ├── input.tsx
│       ├── label.tsx
│       ├── select.tsx
│       ├── separator.tsx
│       ├── table.tsx
│       ├── toast.tsx
│       ├── tooltip.tsx
│       └── ...
│
├── hooks/                        # Shared React hooks
│   ├── index.ts
│   ├── use-media-query.ts
│   └── use-mounted.ts
│
├── lib/                          # Core business logic
│   ├── api-auth.ts               # API key authentication (SHA-256)
│   ├── api-utils.ts              # HTTP response helpers
│   ├── auth.ts                   # Supabase auth helpers
│   ├── authorization.ts          # RBAC for workspaces
│   ├── encryption.ts             # AES-256-GCM encrypt/decrypt
│   ├── logger.ts                 # Pino logger
│   ├── redis.ts                  # Upstash Redis client
│   ├── security.ts               # IP rate limiting + security headers
│   ├── supabase/
│   │   ├── client.ts             # Supabase browser client
│   │   ├── index.ts
│   │   └── server.ts             # Supabase server client
│   ├── utils.ts                  # Shared utilities (slugify, formatting, key gen)
│   └── workspace-cookie.ts       # Active workspace cookie management
│
├── src/
│   ├── app/                      # Next.js App Router pages
│   │   ├── layout.tsx            # Root layout (Geist font, providers)
│   │   ├── page.tsx              # Landing page
│   │   ├── globals.css           # Tailwind CSS global styles
│   │   │
│   │   ├── api/
│   │   │   └── v1/
│   │   │       ├── keys/
│   │   │       │   ├── route.ts              # POST - Create API key
│   │   │       │   └── validate/
│   │   │       │       └── route.ts          # GET - Validate API key
│   │   │       ├── logs/
│   │   │       │   └── route.ts              # POST - Ingest request log
│   │   │       └── rate-limit/
│   │   │           └── route.ts              # POST - Check rate limit
│   │   │
│   │   ├── auth/
│   │   │   ├── callback/
│   │   │   │   └── route.ts      # Supabase OAuth callback
│   │   │   ├── login/
│   │   │   │   └── page.tsx      # Sign-in page
│   │   │   └── register/
│   │   │       └── page.tsx      # Registration page
│   │   │
│   │   ├── dashboard/            # Protected dashboard routes
│   │   │   ├── layout.tsx        # Dashboard layout (sidebar, nav)
│   │   │   ├── page.tsx          # Overview (cards, charts, logs)
│   │   │   ├── loading.tsx       # Loading state
│   │   │   ├── error.tsx         # Error boundary
│   │   │   ├── alerts/
│   │   │   │   └── page.tsx      # Alert management
│   │   │   ├── api-keys/
│   │   │   │   └── page.tsx      # API key management
│   │   │   ├── gateway/
│   │   │   │   └── page.tsx      # Gateway endpoint management
│   │   │   ├── logs/
│   │   │   │   └── page.tsx      # Request log viewer
│   │   │   ├── projects/
│   │   │   │   └── page.tsx      # Project management
│   │   │   ├── providers/
│   │   │   │   └── page.tsx      # Provider management
│   │   │   ├── rate-limits/
│   │   │   │   └── page.tsx      # Rate limit rule management
│   │   │   ├── settings/
│   │   │   │   ├── page.tsx      # General settings
│   │   │   │   └── workspace/
│   │   │   │       └── [workspaceId]/
│   │   │   │           ├── page.tsx                    # Workspace settings
│   │   │   │           └── workspace-settings-client.tsx
│   │   │   └── usage/
│   │   │       └── page.tsx      # Usage analytics
│   │   │
│   │   └── docs/
│   │       └── page.tsx          # Fumadocs documentation root
│   │
│   ├── config/
│   │   ├── env.ts                # Zod-validated environment variables
│   │   ├── index.ts
│   │   └── site.ts               # Site and dashboard navigation config
│   │
│   ├── drizzle/
│   │   ├── index.ts              # Drizzle ORM client & schema export
│   │   ├── schema.ts             # Complete database schema
│   │   └── migrations/           # Auto-generated SQL migrations
│   │
│   ├── features/                 # Feature-based modules
│   │   ├── alerts/
│   │   │   ├── index.ts
│   │   │   ├── actions.ts        # Server Actions (CRUD)
│   │   │   └── components/
│   │   │       └── alerts-list.tsx
│   │   ├── api-keys/
│   │   │   ├── index.ts
│   │   │   ├── actions.ts
│   │   │   └── components/
│   │   │       └── api-keys-list.tsx
│   │   ├── auth/
│   │   │   ├── index.ts
│   │   │   ├── actions.ts
│   │   │   └── components/
│   │   │       ├── sign-in-form.tsx
│   │   │       └── sign-up-form.tsx
│   │   ├── dashboard/
│   │   │   └── components/
│   │   │       ├── error-rate-card.tsx
│   │   │       ├── latency-chart.tsx
│   │   │       ├── overview-cards.tsx
│   │   │       ├── recent-logs.tsx
│   │   │       ├── requests-chart.tsx
│   │   │       └── top-apis.tsx
│   │   ├── gateway/
│   │   │   ├── index.ts
│   │   │   ├── actions.ts
│   │   │   └── components/
│   │   │       └── endpoints-list.tsx
│   │   ├── projects/
│   │   │   ├── index.ts
│   │   │   ├── actions.ts
│   │   │   └── components/
│   │   │       └── projects-list.tsx
│   │   ├── providers/
│   │   │   ├── index.ts
│   │   │   ├── actions.ts
│   │   │   └── components/
│   │   │       └── providers-list.tsx
│   │   ├── rate-limiter/
│   │   │   ├── index.ts
│   │   │   ├── actions.ts
│   │   │   └── components/
│   │   │       └── rate-limits-list.tsx
│   │   ├── usage/
│   │   │   ├── index.ts
│   │   │   ├── actions.ts
│   │   │   └── components/
│   │   │       ├── logs-table.tsx
│   │   │       └── usage-overview.tsx
│   │   └── workspace/
│   │       ├── index.ts
│   │       ├── actions.ts
│   │       └── components/
│   │           ├── create-workspace-dialog.tsx
│   │           ├── members-list.tsx
│   │           └── workspace-switcher.tsx
│   │
│   ├── hooks/                    # App-specific hooks
│   ├── lib/                      # Symlinked /lib for app imports
│   ├── providers/
│   │   ├── index.ts
│   │   ├── query-provider.tsx    # TanStack Query provider
│   │   └── theme-provider.tsx    # next-themes provider
│   │
│   ├── proxy.ts                  # Next.js middleware (security + auth)
│   ├── styles/                   # Additional styles
│   ├── test/
│   │   ├── setup.ts              # Vitest setup (jest-dom matchers)
│   │   └── utils.test.ts         # Utility function tests
│   ├── tests/                    # Integration / E2E tests
│   └── types/                    # TypeScript type definitions
│       ├── index.ts
│       ├── alert.ts
│       ├── api-key.ts
│       ├── gateway.ts
│       ├── project.ts
│       ├── provider.ts
│       ├── rate-limit.ts
│       ├── request-log.ts
│       ├── usage.ts
│       └── workspace.ts
│
└── node_modules/                 # Dependencies
```

---

## Screenshots

> **Coming soon.** We are working on adding screenshots of the dashboard, API playground, and documentation pages.

To add screenshots:

1. Place images in the `public/images/` directory
2. Reference them in this section using standard Markdown:
   ```md
   ![Dashboard Overview](/images/dashboard-overview.png)
   ```
3. Recommended screenshots:
   - Dashboard overview with cards and charts
   - API Keys management page
   - Provider configuration with encryption
   - Gateway endpoints list
   - Rate limit rule creation
   - Request logs with filtering
   - Usage analytics charts
   - Documentation pages via Fumadocs

---

## Prerequisites

Before installing QuotaOS, ensure you have the following:

- **Node.js** 20.x or later (LTS recommended)
- **npm** 10.x or later (included with Node.js)
- **PostgreSQL** 14+ (local install, Docker, or managed — Supabase, Neon, RDS)
- **Git** (for cloning the repository)
- **A Supabase account** (free tier works) — for authentication
- **(Optional) Upstash Redis** account — for distributed rate limiting and caching

---

## Installation

### 1. Clone the repository

```bash
git clone https://github.com/quotaos/quotaos.git
cd quotaos
```

### 2. Install dependencies

```bash
npm install
```

### 3. Configure environment variables

Copy the example environment file and fill in your values:

```bash
cp .env.example .env
```

See the [Environment Variables](#environment-variables) section for all required and optional variables.

Required variables to get started:

```
DATABASE_URL=postgresql://user:password@host:5432/quotaos
NEXT_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-key
SUPABASE_SERVICE_ROLE_KEY=your-service-role-key
PROVIDER_ENCRYPTION_KEY=your-32-character-random-string
```

### 4. Run database migrations

```bash
npm run db:generate   # Generate SQL from schema (if schema changed)
npm run db:migrate    # Apply migrations to your database
```

### 5. Start the development server

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) in your browser. You should see the QuotaOS landing page.

---

## Docker Setup

A Docker Compose setup is available for local development with PostgreSQL.

Create a `docker-compose.yml` in the project root:

```yaml
services:
  postgres:
    image: postgres:16-alpine
    environment:
      POSTGRES_DB: quotaos
      POSTGRES_USER: quotaos
      POSTGRES_PASSWORD: quotaos_password
    ports:
      - "5432:5432"
    volumes:
      - pgdata:/var/lib/postgresql/data

  app:
    build:
      context: .
      dockerfile: Dockerfile
    ports:
      - "3000:3000"
    environment:
      DATABASE_URL: postgresql://quotaos:quotaos_password@postgres:5432/quotaos
      NEXT_PUBLIC_SUPABASE_URL: ${NEXT_PUBLIC_SUPABASE_URL}
      NEXT_PUBLIC_SUPABASE_ANON_KEY: ${NEXT_PUBLIC_SUPABASE_ANON_KEY}
      SUPABASE_SERVICE_ROLE_KEY: ${SUPABASE_SERVICE_ROLE_KEY}
      PROVIDER_ENCRYPTION_KEY: ${PROVIDER_ENCRYPTION_KEY}
      UPSTASH_REDIS_REST_URL: ${UPSTASH_REDIS_REST_URL}
      UPSTASH_REDIS_REST_TOKEN: ${UPSTASH_REDIS_REST_TOKEN}
    depends_on:
      - postgres

volumes:
  pgdata:
```

Start the services:

```bash
docker compose up -d
```

Run migrations inside the container:

```bash
docker compose exec app npm run db:migrate
```

---

## Environment Variables

| Variable | Required | Default | Description |
|---|---|---|---|
| `DATABASE_URL` | **Yes** | `postgres://...` | PostgreSQL connection string (used by Drizzle ORM) |
| `NEXT_PUBLIC_SUPABASE_URL` | **Yes** | `https://placeholder.supabase.co` | Supabase project URL |
| `NEXT_PUBLIC_SUPABASE_ANON_KEY` | **Yes** | — | Supabase anonymous/publishable key |
| `SUPABASE_SERVICE_ROLE_KEY` | **Yes** | — | Supabase service role key (for admin operations) |
| `PROVIDER_ENCRYPTION_KEY` | **Yes** | — | 32+ character string used for AES-256-GCM encryption of provider credentials |
| `UPSTASH_REDIS_REST_URL` | No | — | Upstash Redis REST URL (rate limiting + caching) |
| `UPSTASH_REDIS_REST_TOKEN` | No | — | Upstash Redis REST token |
| `LOG_LEVEL` | No | `info` | Pino log level: `trace`, `debug`, `info`, `warn`, `error`, `fatal` |

**Important security notes:**

- `PROVIDER_ENCRYPTION_KEY` must be at least 32 characters long. Generate one with: `openssl rand -hex 16` or `node -e "console.log(crypto.randomBytes(32).toString('hex'))"`
- Never commit the `.env` file to version control
- In production, use a secrets manager (Vercel Environment Variables, AWS Secrets Manager, etc.)
- Rotate the encryption key periodically and re-encrypt existing provider credentials

---

## Development Workflow

### Available Scripts

```bash
npm run dev              # Start development server (Turbopack HMR)
npm run build            # Production build
npm run start            # Start production server
npm run lint             # Run ESLint
npm run test             # Run Vitest tests (single run)
npm run test:watch       # Run tests in watch mode
npm run test:run         # Run tests (single run, alias)
npm run typecheck        # TypeScript type checking (tsc --noEmit)
npm run format           # Format code with Prettier

# Database operations
npm run db:generate      # Generate Drizzle migrations from schema
npm run db:migrate       # Apply pending migrations
npm run db:push          # Push schema directly (dev only)
npm run db:studio        # Launch Drizzle Studio (GUI DB browser)
```

### Typical Development Cycle

1. **Edit the database schema** in `src/drizzle/schema.ts`
2. **Generate migrations**: `npm run db:generate`
3. **Apply migrations**: `npm run db:migrate`
4. **Implement features** using Server Actions in `src/features/*/actions.ts`
5. **Create UI components** in `src/features/*/components/`
6. **Add API routes** in `src/app/api/v1/`
7. **Write tests** in `src/test/`
8. **Run type check**: `npm run typecheck`
9. **Run linter**: `npm run lint`
10. **Run tests**: `npm test`

### Code Conventions

- **Feature-based organization** — Each domain (workspace, projects, API keys, etc.) has its own folder under `src/features/` with actions, components, and types
- **Server Actions** for all mutations — Dashboard CRUD operations use Next.js Server Actions with `"use server"`
- **API Routes for SDK** — The `/api/v1/` routes are authenticated via Bearer API keys and follow RESTful conventions
- **Zod validation** — All environment variables, API inputs, and form data are validated with Zod schemas
- **No comments in production code** — Code should be self-documenting with clear function and variable names

---

## API Examples

All API endpoints require authentication via a Bearer token using a QuotaOS API key.

### Key Health Check (Validate API Key)

```bash
curl -X GET https://quotaos.example.com/api/v1/keys/validate \
  -H "Authorization: Bearer qos_a1b2c3d4e5f6g7h8.secretkeyvaluehere1234567890abcdef"
```

**Response:**
```json
{
  "success": true,
  "data": {
    "valid": true,
    "project_id": "550e8400-e29b-41d4-a716-446655440000",
    "workspace_id": "660e8400-e29b-41d4-a716-446655440001"
  }
}
```

### Create a New API Key

```bash
curl -X POST https://quotaos.example.com/api/v1/keys \
  -H "Authorization: Bearer qos_a1b2c3d4e5f6g7h8.secretkeyvaluehere1234567890abcdef" \
  -H "Content-Type: application/json" \
  -d '{"name": "Production Key - OpenAI"}'
```

**Response:**
```json
{
  "success": true,
  "data": {
    "key": "qos_x9k2m4n7.8F3jL9qR2tW5bN7vX1cK4pY6mU8sA0dG3hJ5kL7zX9cV1bN3mQ5",
    "id": "770e8400-e29b-41d4-a716-446655440002",
    "key_prefix": "qos_x9k2m4n7",
    "key_last_four": "mQ5"
  }
}
```

**Important:** The full `key` value is only returned once. Store it securely. Only the SHA-256 hash and last four characters are stored in the database.

### Check Rate Limit

```bash
curl -X POST https://quotaos.example.com/api/v1/rate-limit \
  -H "Authorization: Bearer qos_a1b2c3d4e5f6g7h8.secretkeyvaluehere1234567890abcdef" \
  -H "Content-Type: application/json" \
  -d '{"max_requests": 100, "window_ms": 60000}'
```

**Response:**
```json
{
  "success": true,
  "data": {
    "success": true,
    "remaining": 99,
    "reset": 1719876543210
  }
}
```

When rate limit is exceeded:

```json
{
  "success": true,
  "data": {
    "success": false,
    "remaining": 0,
    "reset": 1719876543210
  }
}
```

### Ingest a Request Log

```bash
curl -X POST https://quotaos.example.com/api/v1/logs \
  -H "Authorization: Bearer qos_a1b2c3d4e5f6g7h8.secretkeyvaluehere1234567890abcdef" \
  -H "Content-Type: application/json" \
  -d '{
    "method": "POST",
    "path": "/v1/chat/completions",
    "status_code": 200,
    "latency_ms": 342,
    "ip_address": "203.0.113.42",
    "user_agent": "my-app/1.0",
    "cached": false,
    "response_body_size": 4096
  }'
```

**Response:**
```json
{
  "success": true,
  "data": {
    "id": "880e8400-e29b-41d4-a716-446655440003"
  }
}
```

---

## SDK Examples

### JavaScript / TypeScript SDK

You can use the QuotaOS REST API directly from any JavaScript or TypeScript application.

#### Basic Client

```typescript
class QuotaOSClient {
  private baseUrl: string;
  private apiKey: string;

  constructor(baseUrl: string, apiKey: string) {
    this.baseUrl = baseUrl.replace(/\/$/, "");
    this.apiKey = apiKey;
  }

  private async request<T>(
    method: string,
    path: string,
    body?: Record<string, unknown>,
  ): Promise<T> {
    const response = await fetch(`${this.baseUrl}${path}`, {
      method,
      headers: {
        "Authorization": `Bearer ${this.apiKey}`,
        "Content-Type": "application/json",
      },
      body: body ? JSON.stringify(body) : undefined,
    });

    const json = await response.json();

    if (!response.ok) {
      throw new Error(json.error || `HTTP ${response.status}`);
    }

    return json.data as T;
  }

  async validateKey(): Promise<{
    valid: boolean;
    project_id: string;
    workspace_id: string;
  }> {
    return this.request("GET", "/api/v1/keys/validate");
  }

  async createKey(name: string): Promise<{
    key: string;
    id: string;
    key_prefix: string;
    key_last_four: string;
  }> {
    return this.request("POST", "/api/v1/keys", { name });
  }

  async checkRateLimit(
    maxRequests: number = 100,
    windowMs: number = 60000,
  ): Promise<{ success: boolean; remaining: number; reset: number }> {
    return this.request("POST", "/api/v1/rate-limit", {
      max_requests: maxRequests,
      window_ms: windowMs,
    });
  }

  async logRequest(data: {
    method: string;
    path: string;
    status_code?: number;
    latency_ms?: number;
    ip_address?: string;
    user_agent?: string;
    blocked?: boolean;
    rate_limited?: boolean;
    cached?: boolean;
    error?: string;
    request_body_size?: number;
    response_body_size?: number;
  }): Promise<{ id: string }> {
    return this.request("POST", "/api/v1/logs", data);
  }
}
```

#### Usage Example

```typescript
import { QuotaOSClient } from "@quotaos/sdk";

const client = new QuotaOSClient(
  "https://quotaos.example.com",
  process.env.QUOTAOS_API_KEY!,
);

// Validate your API key
const { valid, project_id } = await client.validateKey();
console.log(`Key valid: ${valid}, Project: ${project_id}`);

// Check rate limit before making an external API call
const { success, remaining, reset } = await client.checkRateLimit(100, 60000);

if (!success) {
  console.warn(`Rate limited. Reset at: ${new Date(reset)}`);
  throw new Error("Rate limit exceeded");
}

// Make your external API call here
const startTime = Date.now();
const response = await fetch("https://api.openai.com/v1/chat/completions", {
  method: "POST",
  headers: {
    "Authorization": `Bearer ${process.env.OPENAI_API_KEY}`,
    "Content-Type": "application/json",
  },
  body: JSON.stringify({ model: "gpt-4", messages: [] }),
});
const latency = Date.now() - startTime;

// Log the request to QuotaOS
await client.logRequest({
  method: "POST",
  path: "/v1/chat/completions",
  status_code: response.status,
  latency_ms: latency,
  cached: false,
  response_body_size: parseInt(response.headers.get("content-length") || "0"),
});

console.log(`Request completed in ${latency}ms. Remaining quota: ${remaining}`);
```

---

## Authentication

QuotaOS uses a two-layer authentication system:

### 1. Dashboard Authentication (Supabase Auth)

The dashboard uses [Supabase Auth](https://supabase.com/auth) with cookie-based SSR sessions:

- Users sign up / sign in via `/auth/login` and `/auth/register`
- Authentication is handled by Supabase (email/password, OAuth providers)
- The proxy middleware (`src/proxy.ts`) checks the session cookie for all `/dashboard/*` routes
- Unauthenticated users are redirected to `/auth/login`
- Public routes (`/`, `/auth/*`, `/docs/*`) are accessible without authentication

### 2. API Authentication (API Keys)

The REST API uses Bearer token authentication with SHA-256 hashing:

```typescript
// Authentication flow (src/lib/api-auth.ts):
// 1. Extract "Authorization: Bearer qos_<prefix>.<secret>" header
// 2. Parse the prefix (first 12 characters)
// 3. SHA-256 hash the full token
// 4. Look up the key in the database by prefix
// 5. Compare hashes (constant-time comparison recommended for production)
// 6. Check key status is "active"
// 7. Check key has not expired
// 8. Update last_used_at timestamp
// 9. Return authenticated context (apiKeyId, projectId, workspaceId)
```

**API key format:**
```
qos_<8-character-prefix>.<32-character-secret>
```

**Storage:**
- Only the SHA-256 hash and last 4 characters are stored in `api_keys.key_hash` and `api_keys.key_last_four`
- The full key is returned exactly once at creation time
- If a key is lost, it cannot be recovered — create a new one

---

## Rate Limiting

QuotaOS has two rate-limiting layers:

### 1. Global IP Rate Limiting (Proxy Layer)

Configured in `src/lib/security.ts`:

- **Default limit:** 30 requests per minute per IP address
- **Window:** 60,000ms (1 minute)
- **Storage:** In-memory `Map<string, { count: number; resetAt: number }>`
- **Response:** HTTP 429 with `Retry-After: 60` header
- **Scope:** All requests to the platform (including dashboard pages)

This protects the platform itself from abuse. In production with multiple instances, replace with a distributed solution (Redis-based).

### 2. Configured Rate Limit Rules (Per API/Project)

Managed through the dashboard or API:

- **Strategy options:** `sliding_window` (default) or `fixed_window`
- **Scope options:** `global` (across all keys) or `per_ip` (per client IP)
- **Storage:** Upstash Redis (falls back to pass-through if Redis is unavailable)
- **Key pattern:** `ratelimit:api:{apiKeyId}:{windowKey}`

When Redis is available, rate limiting is distributed and works across multiple instances. The `incrementRateLimit` function in `src/lib/redis.ts` uses Redis `INCR` with TTL windows.

---

## Logging & Analytics

### Request Logging

Every API request can be logged to `request_logs` via the `POST /api/v1/logs` endpoint. Logs capture:

- HTTP method and path
- Request and response status codes
- Latency in milliseconds
- Client IP address and user agent
- Blocked/rate-limited/cached flags
- Error messages
- Request and response headers (JSON)
- Request and response body sizes

Logs are filterable in the dashboard by:
- HTTP method (GET, POST, PUT, etc.)
- Status code range (e.g., 4xx errors, 5xx errors)
- Text search (path or IP address)

### Usage Analytics

Usage records are aggregated into `usage_records` for efficient querying:

- **7-day overview** — Total requests, blocked, rate-limited, cached, errors
- **Average latency** — Weighted average across all requests
- **P99 latency** — 99th percentile latency
- **Error rate** — Percentage of requests that resulted in errors

The dashboard displays:
- **Overview cards** — Key metrics at a glance
- **Requests chart** — Daily request volume over time
- **Latency chart** — Average and P99 latency over time
- **Recent logs table** — Last 8 requests with status, latency, and path
- **Top APIs** — Most frequently called endpoints
- **Error rate card** — Error percentage with trend indication

### Alerts

Alerts can be configured to monitor specific metrics:

- **Metrics:** `error_rate`, `latency`, `requests`
- **Conditions:** `gt` (greater than threshold)
- **Channels:** Email (extensible to Slack, webhooks, PagerDuty)
- **Windows:** Configurable evaluation window

---

## Testing

QuotaOS uses [Vitest](https://vitest.dev) for testing.

### Running Tests

```bash
# Run all tests once
npm test

# Run tests in watch mode (for development)
npm run test:watch

# Run with UI
npx vitest --ui
```

### Test Structure

```
src/test/
├── setup.ts              # Global test setup (@testing-library/jest-dom)
└── utils.test.ts          # Unit tests for utility functions
```

### Current Test Coverage

Tests cover the utility functions in `src/lib/utils.ts`:

- **`slugify`** — Slug generation from text strings
- **`generateApiKey`** — API key generation with correct format, prefix, secret, and SHA-256 hash
- **`truncate`** — String truncation with ellipsis
- **`getMethodColor`** — HTTP method color mappings
- **`getStatusColor`** — HTTP status code color mappings

### Writing Tests

Test files use Vitest with Testing Library:

```typescript
import { describe, it, expect } from "vitest";
import { myFunction } from "@/lib/my-module";

describe("myFunction", () => {
  it("should return expected output", () => {
    expect(myFunction("input")).toBe("expected");
  });
});
```

### Test Configuration

- **Environment:** jsdom (browser-like environment for React components)
- **Globals:** Enabled (`describe`, `it`, `expect` available without imports)
- **Path alias:** `@/` maps to `./src/`

---

## Deployment

### Deploy to Vercel

QuotaOS is built on Next.js and deploys seamlessly to [Vercel](https://vercel.com):

1. Push your repository to GitHub
2. Go to [vercel.com/new](https://vercel.com/new)
3. Import your repository
4. Configure environment variables (see [Environment Variables](#environment-variables))
5. Deploy

**Important for Vercel deployment:**
- The `edge` runtime is not used — all routes use the Node.js runtime
- Server Actions work out of the box on Vercel
- For Redis, use Upstash (serverless, HTTP-based) — traditional Redis with persistent TCP connections is not recommended on serverless platforms
- For PostgreSQL, use Supabase, Neon, or AWS RDS with connection pooling

### Production Architecture

```
                          ┌──────────────────┐
                          │   Vercel Edge     │
                          │   (CDN + Proxy)   │
                          └────────┬─────────┘
                                   │
                          ┌────────▼─────────┐
                          │  Vercel (Next.js) │
                          │  • Middleware     │
                          │  • API Routes    │
                          │  • Server Actions│
                          │  • SSR Pages     │
                          └────────┬─────────┘
                                   │
              ┌────────────────────┼────────────────────┐
              │                    │                    │
              ▼                    ▼                    ▼
    ┌─────────────────┐  ┌─────────────────┐  ┌─────────────────┐
    │    Supabase      │  │    Upstash       │  │  Managed DB     │
    │    Auth          │  │    Redis         │  │  (Supabase/Neon)│
    │    (Users,       │  │    (Rate Limits, │  │  (PostgreSQL)   │
    │     Sessions)    │  │     Caching)     │  │  (Drizzle ORM)  │
    └─────────────────┘  └─────────────────┘  └─────────────────┘
```

### Self-Hosting

For self-hosted deployments:

1. Set up a PostgreSQL instance (Docker, AWS RDS, DigitalOcean Managed DB)
2. Optionally set up Upstash Redis or a self-hosted Redis instance
3. Set up a reverse proxy (nginx, Caddy) with SSL termination
4. Build and start the Next.js application:

```bash
npm run build
npm start
```

Example nginx configuration:

```nginx
server {
    listen 443 ssl;
    server_name quotaos.example.com;

    ssl_certificate /path/to/cert.pem;
    ssl_certificate_key /path/to/key.pem;

    location / {
        proxy_pass http://127.0.0.1:3000;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_set_header X-Forwarded-For $remote_addr;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_cache_bypass $http_upgrade;
    }
}
```

---

## Security

### Encryption

| Data | Algorithm | Details |
|---|---|---|
| Provider credentials (API keys, secrets) | AES-256-GCM | Encrypted at rest with a configurable encryption key (`PROVIDER_ENCRYPTION_KEY`). Uses random 16-byte IVs and 16-byte auth tags. Format: `iv:tag:ciphertext` |
| API keys in transit | HTTPS | All API communication must use TLS/SSL |
| API keys at rest | SHA-256 | Only the hash (not the plaintext key) is stored in the database |

### Security Headers

All responses include (via `src/lib/security.ts`):

| Header | Value |
|---|---|
| `X-Content-Type-Options` | `nosniff` |
| `X-Frame-Options` | `DENY` |
| `X-XSS-Protection` | `1; mode=block` |
| `Referrer-Policy` | `strict-origin-when-cross-origin` |

### Rate Limiting (Platform Protection)

- **IP-based rate limiting** — 30 requests per minute per IP at the middleware layer
- **Response:** HTTP 429 with `Retry-After: 60` header
- **Scope:** Applies to all incoming requests before authentication

### Input Validation

- **All API inputs** validated with Zod schemas in route handlers
- **All environment variables** validated at startup in `src/config/env.ts`
- **All form data** validated with React Hook Form + Zod resolvers
- **SQL injection** prevented by Drizzle ORM's parameterized queries

### Authentication Security

- API keys are compared by SHA-256 hash — the plaintext key is never stored
- Only the key prefix (first 12 chars) and last 4 chars are stored for UI display
- Keys can be set to expire at a specific date
- Inactive keys are rejected immediately
- Supabase sessions use HTTP-only cookies with `SameSite: Lax`

### Best Practices for Production

1. **Use strong encryption keys** — `PROVIDER_ENCRYPTION_KEY` should be at least 32 random characters
2. **Rotate encryption keys** — Periodically re-encrypt provider credentials with a new key
3. **Enable HTTPS** — Never serve the dashboard or API over plain HTTP
4. **Set API key expiration** — Use `expires_at` for all keys with finite lifetimes
5. **Monitor logs** — Regularly review request logs for anomalous patterns
6. **Use environment-specific keys** — Separate encryption keys for development, staging, and production
7. **Database firewall** — Restrict PostgreSQL access to only the application's IP

---

## Roadmap

The following features and improvements are planned for future releases:

### Q3 2026

- [ ] **Billing & Usage-Based Pricing** — Stripe integration with per-workspace billing plans, usage metering, invoice generation
- [ ] **Webhooks** — Outbound webhooks for real-time event notifications (key created, rate limit exceeded, alert triggered, etc.)
- [ ] **Real-Time Dashboard** — WebSocket-based live updates for logs, usage metrics, and alerts using Server-Sent Events (SSE)
- [ ] **SSO / SAML** — Enterprise single sign-on support (Google Workspace, Microsoft Entra ID, Okta)

### Q4 2026

- [ ] **Multi-Region Replication** — Geo-distributed rate limiting and caching with regional Redis clusters
- [ ] **GraphQL API** — GraphQL endpoint for flexible queries and mutations
- [ ] **Provider Proxy** — Full forward proxy that routes API calls through QuotaOS to external providers with automatic credential injection
- [ ] **Audit Logs** — Immutable audit trail for all configuration changes (who changed what and when)

### 2027

- [ ] **AI-Powered Recommendations** — Anomaly detection, rate limit optimization suggestions, cost optimization insights
- [ ] **Marketplace** — Community provider templates, pre-built integrations, and plugin ecosystem
- [ ] **On-Premises Helm Chart** — Kubernetes-native deployment with Helm chart for enterprise customers
- [ ] **RBAC Enhancements** — Custom roles with granular permissions per resource type

### Under Consideration

- [ ] Terraform provider for infrastructure-as-code management
- [ ] OpenTelemetry integration for distributed tracing
- [ ] Native SDKs for Python, Go, Rust, and Ruby
- [ ] Email notification delivery for alerts (SendGrid, Resend)
- [ ] Slack / Discord integration for alert notifications
- [ ] API monetization — Allow workspace owners to sell API access through QuotaOS

---

## Contributing

We welcome contributions! Please see our [CONTRIBUTING.md](CONTRIBUTING.md) for guidelines on:

- Code of conduct
- Development setup
- Pull request process
- Coding standards
- Commit message conventions

**Quick start for contributors:**

```bash
# Fork the repository
git clone https://github.com/your-username/quotaos.git
cd quotaos
npm install

# Create a feature branch
git checkout -b feat/my-feature

# Make your changes, then run checks
npm run typecheck
npm run lint
npm test

# Commit and push
git commit -m "feat: add my awesome feature"
git push origin feat/my-feature

# Open a pull request
```

---

## License

MIT License

Copyright (c) 2026 QuotaOS

Permission is hereby granted, free of charge, to any person obtaining a copy
of this software and associated documentation files (the "Software"), to deal
in the Software without restriction, including without limitation the rights
to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
copies of the Software, and to permit persons to whom the Software is
furnished to do so, subject to the following conditions:

The above copyright notice and this permission notice shall be included in all
copies or substantial portions of the Software.

THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE
SOFTWARE.

---

<div align="center">
  <p>
    <a href="https://quotaos.com">Website</a> ·
    <a href="https://github.com/quotaos/quotaos">GitHub</a> ·
    <a href="https://twitter.com/quotaos">Twitter</a> ·
    <a href="https://quotaos.com/docs">Documentation</a>
  </p>
  <p>
    Built with <a href="https://nextjs.org">Next.js 16</a>, 
    <a href="https://ui.shadcn.com">shadcn/ui</a>, 
    <a href="https://orm.drizzle.team">Drizzle ORM</a>, and 
    <a href="https://supabase.com">Supabase</a>
  </p>
</div>
