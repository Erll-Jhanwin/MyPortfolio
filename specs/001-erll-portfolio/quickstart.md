# Quickstart

## Prerequisites

Node.js 20.9+ (repository environment observed Node 24.15.0), npm, and optionally Mailpit for local email preview. Copy `.env.example` to `.env.local`, replace placeholders locally, and never commit it.

```powershell
npm install
Copy-Item .env.example .env.local
npm run db:migrate
npm run db:seed
npm run dev
```

Set `DATA_PROVIDER=sqlite` and `SQLITE_PATH=./data/portfolio.sqlite` locally. Seed inserts one synthetic `example.invalid` fixture, never a project card or production lead. For a usable notification workflow run Mailpit locally and keep SMTP at 127.0.0.1:1025; Mailpit UI defaults to port 8025. `npm run email:work` runs one authenticated worker batch; local environment can call internal worker only with `WORKER_SECRET`. The repository network could not resolve packages or produce a lockfile; after an install with registry access, commit the generated `package-lock.json` and use `npm ci` thereafter.

## Staging/production

Use a dedicated Supabase project and `DATA_PROVIDER=postgres`; provide server-only runtime `DATABASE_URL`, separate schema-owner `MIGRATION_DATABASE_URL`, TLS, a non-superuser `portfolio_runtime` role with RLS policies, and `INQUIRY_TO_EMAIL`, fixed `INQUIRY_FROM_EMAIL`, SMTP values, `APP_URL`, and random `WORKER_SECRET`. Run `npm run db:migrate` as a controlled migration step before deploying. Do not use the Supabase service-role key in browser code. Test actual PostgreSQL grants/RLS and outbox behavior in staging. Configure private schedules for `/api/internal/notifications` and `npm run db:cleanup`; exact schedule/host remains an owner decision.

After the first install creates `package-lock.json`, `npm ci` is the reproducible install command. `npm run build`, `npm run typecheck`, `npm run lint`, `npm test`, and `npm run test:e2e` are verification commands. No command proves production sender delivery, jurisdiction/legal sufficiency, or PostgreSQL role policies without the corresponding staging setup.
