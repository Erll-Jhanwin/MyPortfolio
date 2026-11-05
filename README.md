# Erll Portfolio

Next.js App Router application for Erll’s developer portfolio. Public content is static/version-controlled; inquiry and privacy operations run in Node.js route handlers and private repositories.

## Current content state

The repository currently has no owner-approved project case studies, verified public social links, project screenshots, service prices, public availability, or launch details. The supplied résumé is presented as a responsive webpage; a downloadable PDF has not been supplied. All policies identify required owner review. Global metadata and `robots.txt` default to no-index; set `INDEX_PUBLIC_SITE=true` and `LAUNCH_CONTENT_APPROVED=true` only after the launch checklist is signed off.

Review `specs/001-erll-portfolio/content-checklist.md` before adding public material. Do not publish private data, unsupported results, team work as individual work, or assets without rights.

## Local setup

Requires Node.js 20.9+ and npm. Copy `.env.example` to `.env.local`; do not commit local values. Use Node.js server runtime.

```powershell
npm install
Copy-Item .env.example .env.local
npm run db:migrate
npm run db:seed
npm run dev
```

The direct dependency versions are pinned in `package.json`. DM Sans loads from Google Fonts in the browser using the requested variable weights, italics, and optical sizing. Local default is SQLite at `./data/portfolio.sqlite`. Database migration scripts load `.env.local`. The seed script only permits non-production SQLite and inserts one clearly synthetic local inquiry (`example.invalid`). Do not set a hosted PostgreSQL URL and run the local seed. Once the dependency lock has been generated, use `npm ci` for clean installs.

## Project administration

`/admin` is a private, server-rendered dashboard for project drafts, publishing, and images. It has no registration route. To configure an admin, run `npm run admin:hash-password` in an interactive terminal; it prompts without echoing the password and prints a scrypt password hash plus a random session secret. Put those values and a private username in `.env.local` (or the host’s server-only environment), then restart/redeploy. Never commit them or use `NEXT_PUBLIC_*` variables. Sessions are signed, HTTP-only, same-site cookies that expire after eight hours. Login attempts are rate-limited.

Run `npm run db:migrate` after adding or changing migrations. Admin API routes require the signed session and same-origin requests. Images are limited to 5 MB per upload and six per project, decoded and resized to WebP, then stored as database blobs (2 MB maximum each) so they persist with SQLite locally and the configured PostgreSQL database in deployment. Draft images require admin authorization; public image URLs only serve images while their project is published. Project edits and uploads use the same server-side validation in both database adapters. Configure regular database backups before production use.

## Development email

Run Mailpit locally (or another local SMTP sink) with SMTP on `127.0.0.1:1025` and its review UI on port `8025`. Keep SMTP credentials blank for Mailpit. Set a random `WORKER_SECRET`, a 32+ character `RATE_LIMIT_SECRET`, `INQUIRY_TO_EMAIL`, and fixed `INQUIRY_FROM_EMAIL`. After submitting the form, invoke one worker batch:

```powershell
Invoke-WebRequest -Method Post -Uri http://localhost:3000/api/internal/notifications -Headers @{ Authorization = "Bearer $env:WORKER_SECRET" }
```

The request handler saves an inquiry and an outbox notification atomically; this worker sends later. SMTP messages contain only an opaque record reference and category, not the visitor’s email or message. An SMTP outage leaves the saved inquiry and retries with exponential backoff, bounded to eight attempts. Operational logs contain no message or email body. The repository does not create a public inbox or admin dashboard.

## Staging / production

Use distinct Supabase staging and production projects/regions. Configure `DATA_PROVIDER=postgres`, server-only `DATABASE_URL` for an application runtime role, and `MIGRATION_DATABASE_URL` for a separately controlled schema owner. Create the `portfolio_runtime` role as a non-superuser and `NOBYPASSRLS`; apply migration as the owner. The migration revokes table access from `PUBLIC`, `anon`, and `authenticated`; it grants/policies only for the dedicated role if present. Inspect actual grants and RLS with anonymous, authenticated, and runtime credentials in staging. Never place a service role, database URL, SMTP password, or worker key in `NEXT_PUBLIC_*` variables.

Create the non-superuser `portfolio_runtime` role before the initial migration. Run `npm run db:migrate` in a release step after backup and before deploying application code. For production Postgres migration, set `ALLOW_PRODUCTION_MIGRATIONS=true` only on that controlled migration process. Configure a scheduler to call the internal notification route with the bearer secret and `db:cleanup` with `ALLOW_PRODUCTION_CLEANUP=true`. The provider/region/schedule and secret rotation are still owner decisions.

`APP_URL` must equal the site's externally visible origin for same-origin form checks. Configure the host to overwrite `x-real-ip` or `x-forwarded-for`; rate limiting uses an HMAC digest of the first available address and stores no raw IP. Confirm proxy behavior so clients cannot choose their own forwarded address. Set both `INDEX_PUBLIC_SITE=true` and `LAUNCH_CONTENT_APPROVED=true` only for an approved public launch.

## Verification

```powershell
npm run typecheck
npm run lint
npm test
npm run build
npm run test:e2e
```

The SQLite contract tests are not evidence of PostgreSQL grants/RLS, SMTP delivery, deployment proxy identity, or legal policy adequacy. Staging PostgreSQL role tests and real provider delivery are separate release tasks. Record results in `specs/001-erll-portfolio/release-checklist.md`.

## Data handling

No analytics, advertising, embeds, marketing emails, or visitor accounts are included. The site requests DM Sans from Google Fonts; Google receives normal request metadata needed to deliver the font. Contact form asks only name, email, inquiry type, message, optional budget/timing, response consent, and adult attestation. Privacy requests return neutral confirmation. Proposed retention windows in the privacy draft require owner/jurisdiction review and an actual cleanup/backup process before launch. Never place production inquiries in local development or logs.
