# Contributing to QuotaOS

First off, thank you for considering contributing to QuotaOS. It's people like you that make QuotaOS a great tool.

## Table of Contents

- [Code of Conduct](#code-of-conduct)
- [How to Contribute](#how-to-contribute)
  - [Reporting Bugs](#reporting-bugs)
  - [Suggesting Features](#suggesting-features)
  - [Pull Request Process](#pull-request-process)
- [Development Setup](#development-setup)
  - [Prerequisites](#prerequisites)
  - [Environment Setup](#environment-setup)
  - [Running Locally](#running-locally)
  - [Database Setup](#database-setup)
  - [Running Tests](#running-tests)
- [Code Style](#code-style)
  - [TypeScript](#typescript)
  - [Tailwind CSS](#tailwind-css)
  - [Conventional Commits](#conventional-commits)
- [Branch Naming](#branch-naming)
- [Pull Request Checklist](#pull-request-checklist)

---

## Code of Conduct

This project and everyone participating in it is governed by the [QuotaOS Code of Conduct](CODE_OF_CONDUCT.md). By participating, you are expected to uphold this code. Please report unacceptable behavior to the project maintainers.

---

## How to Contribute

### Reporting Bugs

Before submitting a bug report, please check the existing [issues](https://github.com/quota-os/quota-os/issues) to see if the problem has already been reported. If it has, add a comment to the existing issue instead of opening a new one.

When creating a bug report, use the [Bug Report template](.github/ISSUE_TEMPLATE/bug_report.md) and include as many details as possible:

- A clear and descriptive title
- Steps to reproduce the behavior
- Expected behavior vs. actual behavior
- Screenshots or screen recordings if applicable
- Environment details (OS, browser, Node.js version)
- Any relevant logs or error messages

### Suggesting Features

Feature requests are welcome. Use the [Feature Request template](.github/ISSUE_TEMPLATE/feature_request.md) and provide:

- A clear description of the problem you're trying to solve
- A detailed proposal for the solution
- Any alternatives you've considered
- Why this feature would benefit the project

### Pull Request Process

1. Fork the repository and create your branch from `main`.
2. Install dependencies with `npm ci`.
3. Make your changes following the [code style](#code-style) guidelines.
4. Write or update tests as needed.
5. Run the full test suite and lint checks before submitting.
6. Ensure your branch is up to date with `main` (rebase, don't merge).
7. Submit the PR using the [Pull Request template](.github/PULL_REQUEST_TEMPLATE.md).
8. Ensure all CI checks pass. A maintainer will review your PR.
9. Address any feedback from code review. Once approved, your PR will be squashed and merged.

---

## Development Setup

### Prerequisites

- **Node.js** >= 20.x (LTS recommended)
- **npm** >= 10.x
- **PostgreSQL** >= 16.x (for local database)
- A Supabase account (for auth and storage features)

### Environment Setup

1. Fork and clone the repository:

   ```bash
   git clone https://github.com/your-username/quota-os.git
   cd quota-os
   ```

2. Install dependencies:

   ```bash
   npm ci
   ```

3. Copy the environment template and fill in your values:

   ```bash
   cp .env.example .env.local
   ```

   Required environment variables:

   | Variable | Description |
   |----------|-------------|
   | `NEXT_PUBLIC_SUPABASE_URL` | Supabase project URL |
   | `NEXT_PUBLIC_SUPABASE_ANON_KEY` | Supabase anonymous key |
   | `UPSTASH_REDIS_REST_URL` | Upstash Redis REST URL |
   | `UPSTASH_REDIS_REST_TOKEN` | Upstash Redis REST token |
   | `DATABASE_URL` | PostgreSQL connection string |

### Running Locally

Start the development server:

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) to view the application.

### Database Setup

QuotaOS uses Drizzle ORM with PostgreSQL. Run migrations to set up your local database:

```bash
npm run db:generate   # Generate SQL migrations from schema changes
npm run db:migrate    # Apply migrations to the database
npm run db:push       # Push schema directly (development only)
```

To open Drizzle Studio for inspecting data:

```bash
npm run db:studio
```

### Running Tests

```bash
npm test            # Run all tests once
npm run test:watch  # Run tests in watch mode
npm run test:run    # Run tests with UI
```

### Linting and Type Checking

```bash
npm run lint        # ESLint check
npm run typecheck   # TypeScript type checking
npm run format      # Format code with Prettier
```

---

## Code Style

### TypeScript

- Strict mode is enabled in `tsconfig.json`. Do not use `any` or `as any` unless absolutely necessary.
- Prefer `interface` over `type` for object shapes.
- Use `const` assertions (`as const`) for literal types.
- Define shared types in `src/types/` or co-located with the component.
- Use Zod schemas for runtime validation (React Hook Form + `@hookform/resolvers`).

### Tailwind CSS

- Use the `cn()` utility from `lib/utils.ts` for conditional class merging.
- Follow the existing spacing/color conventions from `tailwind.config.ts`.
- Prefer utility classes over custom CSS. If custom CSS is needed, place it in `src/app/globals.css`.
- Use Tailwind's `@apply` directive sparingly and only for repeated patterns.
- Group related classes with the `tw-merge` / `tailwind-merge` pattern.

### Conventional Commits

We follow the [Conventional Commits](https://www.conventionalcommits.org/) specification.

```
<type>(<scope>): <description>

[optional body]

[optional footer(s)]
```

**Types:**

| Type | Usage |
|------|-------|
| `feat` | A new feature |
| `fix` | A bug fix |
| `docs` | Documentation only changes |
| `style` | Code style changes (formatting, etc.) |
| `refactor` | Code change that neither fixes a bug nor adds a feature |
| `test` | Adding or updating tests |
| `chore` | Build process, dependencies, or tooling changes |
| `perf` | Performance improvements |
| `db` | Database schema or migration changes |

**Scopes:**

| Scope | Usage |
|-------|-------|
| `ui` | UI components and styling |
| `api` | API routes and server actions |
| `db` | Database schema and migrations |
| `auth` | Authentication and authorization |
| `dashboard` | Dashboard features |
| `docs` | Documentation |
| `deps` | Dependency updates |

**Examples:**

```
feat(dashboard): add resource usage charts
fix(api): handle null quota limits in user endpoint
docs(readme): update deployment instructions
db(migrations): add team_members table
```

---

## Branch Naming

Branches must follow a consistent naming convention:

```
<type>/<short-description>
```

**Types:** `feat`, `fix`, `docs`, `refactor`, `test`, `chore`, `db`, `perf`

**Examples:**

```
feat/resource-monitoring-dashboard
fix/quota-overflow-calculation
db/add-teams-schema
docs/api-authentication-guide
```

Use lowercase and hyphens to separate words. Keep descriptions concise (2-5 words).

---

## Pull Request Checklist

Before submitting your pull request, ensure the following:

- [ ] Code follows the project's TypeScript and Tailwind conventions
- [ ] ESLint passes (`npm run lint`)
- [ ] TypeScript type checks pass (`npm run typecheck`)
- [ ] All existing tests pass (`npm test`)
- [ ] New tests added for new features or bug fixes
- [ ] Conventional commit message format used in PR title and commits
- [ ] Branch is rebased on latest `main` (no merge commits)
- [ ] PR description clearly explains the changes and motivation
- [ ] Related issues referenced in the PR description (e.g., `Closes #123`)
- [ ] UI changes have been tested in light and dark mode
- [ ] Database migrations are backward-compatible (if applicable)
- [ ] No `.env` files, secrets, or sensitive data committed
- [ ] Changes are scoped to a single concern (avoid mixed-feature PRs)

---

## Questions?

If you have questions about contributing, feel free to open a [Discussion](https://github.com/quota-os/quota-os/discussions) or reach out to the maintainers.