# Implementation Tasks and Evidence

Status is conservative: complete means acceptance evidence was observed. No task is complete until verification runs.

| ID | Refs | Task | Acceptance / verification | Status |
| --- | --- | --- | --- | --- |
| T-00 | Plan §7–8 | Create the constitution, specification, research, data model, API contract, implementation plan, quickstart, data-flow, content, operations, and task artifacts | Files exist under `.specify/` and `specs/001-erll-portfolio/`; retain root `plan.md` as scope source; document that no Spec Kit CLI/integration command was executed | Complete (manual equivalent artifacts) |
| T-01 | FR-01..12 | Bootstrap Next/React/Tailwind/Node with locked dependencies | npm ci, typecheck, lint, build | In progress |
| T-02 | US-01,02,07 | Shared responsive visual system, nav/footer, home/projects/case studies/about/services | Route and 320–1440px browser review; no invented claims | In progress |
| T-03 | FR-10 | Contact, policies, privacy request, preferences, résumé empty state | Verify truthful empty states and policy data-flow alignment | In progress |
| T-04 | FR-05,06 | SQLite/Postgres adapters and migrations, outbox worker, idempotency, limits | Contract tests both dialects; PG grant/RLS test on staging | In progress |
| T-05 | FR-08 | Privacy request submit and neutral receipt | Validation/rate/neutral-response flow | In progress |
| T-06 | FR-09 | Semantic controls and accessibility states | Keyboard/zoom/screen-reader manual smoke plus automated browser check | In progress |
| T-07 | FR-11 | Loading, error, empty, not-found, robots/sitemap metadata | Route checks and response behavior | In progress |
| T-08 | Release | Content/legal/operations approval and staging launch evidence | Owner supplies launch inputs; release checklist | Blocked on owner inputs |

## Requirement coverage checklist

| Requirement | Implementation location | Verification |
| --- | --- | --- |
| Home and clear business/recruiter paths | `src/app/page.tsx`, shared components | Build + route/manual scan |
| Projects/case study evidence, ownership and limitations | `src/content/projects.ts`, dynamic route | Empty-state + approved-content audit |
| About, services/process and résumé | `/about`, `/services`, `/resume` | Route and real file/link audit |
| Contact and consent | `/contact`, `/api/inquiries` | Validation + persistence flow |
| Policies and privacy request | policy routes, `/privacy-request`, API | Owner jurisdiction/term review + data inventory |
| SQLite/PostgreSQL contracts | `db/**`, `src/lib/server/repositories/**` | Both dialect contract tests; separate PG auth tests |
| Email retry | server email/outbox worker | Mailpit workflow, failure/retry test |
| Preferences/no optional SDK | cookie components, no vendor dependencies | Inspect network and stored preference behavior |
| A11y/responsive | shared CSS/semantic markup; `tests/e2e/accessibility.spec.ts` | Axe WCAG scans plus keyboard, screen reader, zoom and mobile review |
