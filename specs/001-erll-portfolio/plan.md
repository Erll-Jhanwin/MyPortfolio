# Implementation Plan

**Scope source:** root `plan.md`. This file records implementation decisions and delivery order without duplicating the complete product plan.

## Architecture

- Next.js App Router and React server components render version-controlled portfolio pages. Client components are limited to inquiry forms and cookie preferences.
- TypeScript, Tailwind CSS 4 and a restrained custom design system provide responsive styling. Node.js runtime serves API routes, database adapters and SMTP integration.
- `src/content/projects.ts` is trusted, typed content. It starts empty until each project’s ownership and publication rights are verified. Optional local project screenshots have alt text, width, height and caption metadata.
- `/api/inquiries` validates bounded same-origin requests, checks a database-backed HMAC-IP rate limit, then inserts an inquiry and outbox job in one transaction. A server-only authenticated worker sends an opaque-reference notification through SMTP and retries failures with backoff.
- `/api/privacy-requests` persists minimum request data, enqueues a reference-only notice, and returns neutral 202. Identity verification and response are performed using the private operator runbook; no public read/admin endpoint exists.
- Local SQLite and Supabase PostgreSQL implement the same repository contract with separate migrations and dialect behavior. Production requires explicit `DATA_PROVIDER=postgres`, a restricted runtime role, a separate schema owner, and staging verification of grants/RLS.
- `/admin` provides owner-only project editing with environment-provisioned credentials, signed sessions, server-validated same-origin APIs, no public registration, and database-backed project/image storage for both providers. Uploaded media is decoded, resized, and stored as bounded WebP blobs; public routes serve it only when its project is published.
- No analytics, CMS, accounts, external media, advertising, or marketing dependency is included. DM Sans is loaded from Google Fonts in the browser as explicitly requested. Local preference storage is essential-only.

## Delivery sequence

1. Constitution, user stories and acceptance criteria; identify launch inputs that are absent without blocking independent implementation.
2. Research runtime/version choices, data model, endpoint contracts, vendor inventory, policies and owner review points.
3. Build shared layout and all public routes with accurate education wording, empty project collection, unavailable résumé state, policies and privacy form.
4. Add SQLite/PostgreSQL migrations/adapters, server validation, database idempotency/rate limits, transactional outbox, notification worker and retention cleanup.
5. Add unit/SQLite contract tests, optional Postgres runtime-role contract tests and critical Playwright browser flows.
6. Run package install, typecheck, lint, tests and build; perform responsive/accessibility checks. Run PostgreSQL auth and sender checks in staging.
7. Complete owner content, policy, vendor, host and operations decisions. Enable indexing only after release checklist and owner approval.

## Key assumptions and trade-offs

- The local environment has no existing app or dependencies. Dependency versions are pinned directly; npm registry access was unavailable while implementing, so the lockfile and install verification remain pending.
- No approved project, résumé, contact profile, testimonial, pricing, availability, image, business disclosure or legal jurisdiction exists in the repository. Empty/draft states are truthful; policy routes visibly request owner review and global indexing remains off until both approval flags are set.
- Mail delivery is configured through generic SMTP, using Mailpit locally. There is no selected production provider or scheduling host.
- Notifications contain opaque identifiers and type only; an authorized operator reviews records in the restricted database. SMTP delivery is at-least-once: stable Message-ID helps identify a repeated send, but SMTP cannot promise exactly-once inbox delivery.
- Retention durations mirror proposals in the product plan and require owner/jurisdiction confirmation before live data is collected.

## Verification gates

Tasks remain in progress until commands and review evidence are recorded. SQLite contract tests do not establish PostgreSQL RLS/grant behavior. PostgreSQL and live SMTP remain staging-only. See `tasks.md` and `release-checklist.md`.
