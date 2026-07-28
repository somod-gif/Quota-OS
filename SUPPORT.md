# QuotaOS Support

## Where to Get Help

### GitHub Issues
Use [GitHub Issues](https://github.com/quota-os/quota-os/issues) to report bugs and request features. Before opening a new issue, please search existing issues to avoid duplicates.

- **Bug reports** – Use the [Bug Report template](.github/ISSUE_TEMPLATE/bug_report.md)
- **Feature requests** – Use the [Feature Request template](.github/ISSUE_TEMPLATE/feature_request.md)

### GitHub Discussions
For questions, ideas, and general conversation, join [GitHub Discussions](https://github.com/quota-os/quota-os/discussions). This is the best place for:

- "How do I...?" questions
- Feature brainstorming and design discussions
- Sharing your QuotaOS setup or use cases
- Community support from other users

### Email
For sensitive or private matters, contact the maintainers directly:

- **Security vulnerabilities** – [security@quota-os.dev](mailto:security@quota-os.dev)
- **Code of conduct reports** – [support@quota-os.dev](mailto:support@quota-os.dev)
- **Other inquiries** – [support@quota-os.dev](mailto:support@quota-os.dev)

---

## Frequently Asked Questions

### What is QuotaOS?

QuotaOS is a web-based resource quota management system built with Next.js, Supabase, and Drizzle ORM. It allows organizations to track, allocate, and monitor usage limits across teams and projects.

### What stack does QuotaOS use?

- **Framework:** Next.js (App Router)
- **Language:** TypeScript (strict mode)
- **Styling:** Tailwind CSS v4
- **Database:** PostgreSQL + Drizzle ORM
- **Auth:** Supabase Auth with SSR
- **Caching:** Upstash Redis
- **Forms:** React Hook Form + Zod
- **Testing:** Vitest + Testing Library
- **UI Components:** Radix UI + shadcn/ui

### How do I set up QuotaOS locally?

See the [Contributing Guide](CONTRIBUTING.md#development-setup) for detailed development setup instructions.

### Do I need a Supabase account to run QuotaOS?

Yes. QuotaOS uses Supabase for authentication and database services. You'll need a Supabase project with the relevant schema applied via Drizzle migrations.

### How do I preview documentation locally?

Documentation is powered by FumaDocs. Run `npm run dev` and visit [http://localhost:3000/docs](http://localhost:3000/docs) to browse the documentation site locally.

### How do I run tests?

```bash
npm test          # Run all tests
npm run test:watch  # Watch mode
npm run test:run    # Run with Vitest UI
```

### How do I contribute?

See the [Contributing Guide](CONTRIBUTING.md) for our PR workflow, code conventions, and branch naming rules.

### What version of Node.js is required?

Node.js 20.x or later (LTS recommended).

### Does QuotaOS have a public roadmap?

We track planned features and milestones under [GitHub Issues](https://github.com/quota-os/quota-os/issues?q=is%3Aissue+is%3Aopen+label%3Aenhancement) with the `enhancement` label.

### Is QuotaOS production-ready?

QuotaOS is currently in early development (v0.1.0). While we are actively building toward a stable release, breaking changes may occur. We recommend pinning to a specific version in production.

### How can I report a security issue?

Please see our [Security Policy](SECURITY.md) for instructions on responsible disclosure.

### Where can I find the changelog?

See the [CHANGELOG.md](CHANGELOG.md) for a record of all releases and changes.

### Can I use QuotaOS for commercial purposes?

Yes. QuotaOS is open source. Please see the license file for details.