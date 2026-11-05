# Release Checklist

No release is approved by this initial implementation. Fill in environment, date, evidence, and limitations for each item. SQLite does not prove PostgreSQL access control.

## Build and behavior

- [ ] Clean `npm ci`, typecheck, lint, unit/integration suite, production build.
- [ ] Public routes, metadata, empty project/case-study, résumé missing/present, error, loading, and not-found behavior.
- [ ] Inquiry valid/invalid/unchecked consent/adult confirmation/oversized/unknown fields/honeypot/origin mismatch/retry/idempotency/rate limit/database failure.
- [ ] Saved lead while email unavailable; retry backoff and duplicate delivery behavior; sanitize failures and inspect logs.
- [ ] Privacy request neutral response, verification workflow, duplicates, limit, DB failure, correction/deletion communication.
- [ ] SQLite repository contract. PostgreSQL contract under staging runtime role. Verify anon/authenticated deny, RLS enabled, runtime least privilege, transaction/idempotency and concurrent claims.
- [ ] Test 320, 360, 390, 768, 1024, 1440px; keyboard, focus, skip link, native dialog Escape/focus restoration, screen-reader labels/errors/status, zoom/reflow, target sizes and reduced motion.
- [ ] Contrast (text 4.5:1, large text/non-text as applicable 3:1), alt text and no horizontal overflow.
- [ ] Inspect third-party network calls before/after cookie preferences; optional requests remain absent.
- [ ] Configure unique admin credentials/session secret per environment; verify anonymous API denial, rate-limited login, draft privacy, publish/unpublish, image upload limits, delete confirmation, and database backup/restore.
- [ ] Mobile lab performance evidence; label lab metrics, do not report as real user data.

## Content, legal, privacy and operations

- [ ] Verified identity, business contact, profiles, availability, résumé and education dates.
- [ ] At least two accurate case studies or owner-approved explanation of available public evidence; ownership and rights confirmed.
- [ ] Policies match actual providers/data flows and have jurisdiction/business/consumer-law review.
- [ ] Confirm response processing basis, privacy email, retention schedule, data deletion, backup expiry and restore cleanup.
- [ ] Confirm business quote terms, cancellation/refund, scope changes, support, taxes, licenses, and disclosures before payment is accepted.
- [ ] Staging PostgreSQL migration and rollback plan, backups, restoration, monitoring, worker scheduler, sender/domain authentication, secret rotation and alert routing.
- [ ] Final owner review; set `INDEX_PUBLIC_SITE=true` only on approved production deployment.

## Evidence record

| Environment / date | Scenario | Result and artifact/link | Limitation / follow-up |
| --- | --- | --- | --- |
| Windows dev · Node 24.15.0 / npm 11.12.1 · 2026-11-05 | Package JSON and JS config parse; Node TypeScript syntax check on 27 `.ts` files; `npm install --package-lock-only --offline`; `npm run typecheck`, `lint`, `test`, `build` | Package JSON and `.mjs` syntax checks passed; Node stripped-TypeScript syntax checks passed (27 files, TSX excluded). Offline lock generation failed because npm registry metadata for `@next/env` was not cached (`ENOTCACHED`). Typecheck/lint/test/build could not start because dependencies are not installed (`tsc`, `eslint`, `vitest`, `next` missing). | No lockfile was produced. Re-run with registry access, commit the generated lock, then run all commands. TSX, SQL, browser flows and Axe scans remain unverified. PostgreSQL and SMTP credentials were not provided. Owner content and legal decisions remain open. |
