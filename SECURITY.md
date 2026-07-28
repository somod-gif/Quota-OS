# Security Policy

## Supported Versions

The following table describes which versions of QuotaOS currently receive security updates:

| Version | Supported |
|---------|-----------|
| 0.1.x   | :white_check_mark: |
| < 0.1   | :x: |

Only the latest minor release in the `0.1.x` line is actively supported with security patches. Users are encouraged to always run the most recent release.

## Reporting a Vulnerability

We take the security of QuotaOS seriously. If you discover a security vulnerability, please follow these steps:

### Do Not

- **Do not** file a public GitHub issue for the vulnerability.
- **Do not** discuss the vulnerability in public forums, Discord, or social media until it has been addressed.

### Do

1. **Report privately** by emailing **[security@quota-os.dev](mailto:security@quota-os.dev)**.
2. Include as much detail as possible in your report:
   - A clear description of the vulnerability
   - Steps to reproduce the issue
   - Affected versions, endpoints, or components
   - Potential impact and any proposed remediation
   - Proof of concept or example code (if applicable)
3. Allow up to **72 hours** for an initial acknowledgment of your report.
4. We will work with you to validate, reproduce, and develop a fix.
5. Once a fix is ready, we will coordinate a disclosure date and credit you in the release notes (unless you prefer to remain anonymous).

### Disclosure Policy

We follow a **coordinated disclosure** process:

1. The report is acknowledged within 72 hours.
2. A fix is developed and tested within **14 days** of confirmation (critical issues may be expedited).
3. A security advisory is published and a patched release is issued.
4. Public disclosure follows 30 days after the patch release, unless otherwise agreed.

We ask that reporters allow us time to address the issue before making any public disclosures.

## Security Practices

QuotaOS employs the following security practices:

### Authentication & Authorization
- Authentication is handled through **Supabase Auth** with row-level security (RLS) enforced at the database level.
- API routes and server actions validate session tokens and enforce authorization checks before processing requests.
- All authentication flows use HTTP-only cookies and CSRF protection via Supabase SSR.

### Data Validation
- All user-supplied input is validated with **Zod schemas** before processing.
- Database queries use **Drizzle ORM** parameterized queries to prevent SQL injection.
- File uploads (if applicable) are scanned and restricted by type and size.

### Secrets & Environment
- No secrets, API keys, or tokens are hardcoded in the codebase.
- Environment variables are loaded from `.env.local` (gitignored) and never committed.
- Production secrets are managed through the hosting platform's secure environment variable system.

### Dependencies
- Dependencies are regularly audited with `npm audit`.
- Automated Dependabot alerts are enabled on the repository.
- Outdated or unmaintained dependencies are replaced promptly.

### HTTPS & Transport
- All communication with the API and Supabase services is over HTTPS/TLS.
- Redis connections to Upstash are encrypted in transit.

### Data Storage
- Passwords are never stored — authentication is delegated to Supabase.
- Session data in Redis is encrypted and has a configurable TTL.
- Database connections use encrypted connections (SSL/TLS).

## Bug Bounty

At this time, QuotaOS does not operate a formal bug bounty program. However, we deeply appreciate and will publicly acknowledge all security researchers who responsibly disclose vulnerabilities. If you would like to be credited, please let us know when submitting your report.