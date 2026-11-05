# Research and Decisions

**Date:** 2026-11-05. Decisions reflect repository inspection; deployment and owner facts remain unverified.

| Topic | Decision | Reason / alternative | Status |
| --- | --- | --- | --- |
| Spec Kit | No `specify` executable or agent integration is exposed in this environment. Follow equivalent artifacts manually. Official Spec Kit docs describe `specify` for init/version/system checks and agent-side `/speckit.*` process commands. | Do not claim unsupported commands were run or use a guessed syntax. | Confirmed environment inspection |
| Framework | Next.js App Router, React, Node runtime, TypeScript, Tailwind 4. | Fits planned static public pages/server route handlers and avoids standalone API. | Implemented; npm install/build verification pending |
| Runtime | Node 20.9+ supported per Next installation documentation; current shell reports Node 24.15.0. | Keep compatible with supported LTS deployments; actual host must be selected. | Host open |
| Local database | SQLite via `better-sqlite3`, foreign keys and WAL, server-only adapter. | Lightweight local setup. | Implemented |
| Staging/production database | PostgreSQL via `pg`, Supabase connection string, explicit parameterized SQL and grants/RLS migration. | Use same logical repository contract with separate dialect SQL. SQLite cannot validate PostgreSQL authorization. | Implemented; staging credentials/role test pending |
| Identifiers/time | UUID generated in application, UTC ISO timestamps. | Consistent cross-dialect type behavior. | Implemented |
| Idempotency/abuse | DB unique idempotency key plus persistent per-IP hash rate limit, origin checks, bounded request body, honeypot. | Avoid in-memory limits that fail on multi-instance deploy. HMAC IP using server secret; no raw IP retained. | Implemented |
| Email | Nodemailer SMTP adapter. Local workflow documented with Mailpit; production sender and credentials not provided. | Provider-neutral adapter; no external provider commitment. | Integration boundary implemented; delivery unverified |
| Worker | Authenticated `POST /api/internal/notifications` drains due outbox batch; scheduler is deployment-specific. | Outbox survives mail outage; hosting cron/region not selected. | Implemented; schedule open |
| Analytics/SDKs | None in MVP. | Consent and data inventory are simpler; no metric requests until owner opts in. | Implemented |
| Typography | DM Sans variable font via the supplied Google Fonts stylesheet (weights 100–1000, normal/italic, `opsz`). | Uses the exact supplied font URL and avoids a build-time font fetch; visitors' browsers request the stylesheet/font from Google Fonts. The font is SIL Open Font License. | Implemented; build verification pending |
| Accessibility automation | `@axe-core/playwright` 4.14.0 as dev-only test dependency; WCAG 2.0/2.1/2.2 A/AA scans in critical route flows. | Required accessible launch checks justify a small testing-only package; it is not shipped as a browser SDK. Package is MPL-2.0. | Added; execution pending dependency install |
| Content | Version-controlled typed TS data; currently no approved projects/links/assets. | Avoid CMS and fabricated content; project collection begins empty. | Drafts/inputs tracked |
| Privacy | Cookie preference is functional UI/local storage only; no browser cookie or optional tracker presently. Retention defaults: inquiry 90 days after last meaningful exchange; delivery diagnostics 30 days; resolved privacy requests 12 months. | Design proposals in plan, not legal advice or confirmed statutory durations. Need owner and jurisdiction review. | Requires owner/legal review |
| Dependencies | Next 16.4.5 / eslint-config-next 16.4.5, React 19.2.0 and pinned direct major/minor ranges in package.json. | Based on official npm listing for current Next release and official Next docs; package-lock to freeze transitive resolution. | Lockfile and install verification pending |
