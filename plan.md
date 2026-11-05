# Implementation Plan: Erll’s Developer Portfolio

**Proposed branch:** `001-erll-portfolio`  
**Date:** 2026-11-05 
**Owner:** Erll  
**Status:** Product plan; implementation draft in progress, verification and owner launch decisions remain outstanding.
**Input:** Erll’s portfolio brief in this conversation. The derived feature specification is in `specs/001-erll-portfolio/spec.md`.
**Method:** Adapted from GitHub Spec Kit’s implementation-plan structure, with product requirements included so this document can stand alone. Feature artifacts and implementation evidence are tracked in `specs/001-erll-portfolio/`. This plan remains the primary scope; its existence does not certify a completed implementation or release.

## Summary

Build a credible, accessible portfolio that helps Erll win suitable freelance clients and remote developer interviews. Erll is a fourth-year graduating student pursuing a Bachelor of Science in Information Technology, majoring in Service Management, and develops web and app projects.

Position Erll around understanding business problems, building usable software, and communicating clearly. Demonstrate capability through honest case studies, working demonstrations, code, and documented decisions. Do not imply graduation, professional seniority, paid client experience, or results that have not been verified.

Use React through Next.js, Tailwind CSS, and the Node.js runtime. Use SQLite for everyday local development and Supabase PostgreSQL for staging and production. Keep the public experience fast and mostly static; use server-side operations for inquiries and data requests.

The portfolio supports trust and repeat engagement but cannot guarantee jobs, customers, revenue, or retention improvements.

## 1. Product specification

### Audiences and journeys

| Audience | Main question | Intended journey | Success action |
| --- | --- | --- | --- |
| Business owner | Can Erll understand and solve my problem? | Home → relevant case study → services/process → contact | Send a useful project inquiry |
| Recruiter or hiring manager | Can Erll contribute to our team? | Home → projects/code → skills/about → résumé | Download résumé or request an interview |
| Returning prospect | Has Erll done work relevant to my needs? | Direct case-study link → recent update → contact | Resume a conversation |
| Existing client | How can I get continued support? | Services → maintenance/support details → contact | Request a follow-up engagement |

### Scope

**MVP:** Home, project index, detailed case studies, about/skills, services/process, contact, résumé download, policy pages, cookie preferences, privacy-request flow, responsive navigation, SEO metadata, inquiry persistence and email notification, accessibility and security checks.

**After launch:** Additional case studies, technical articles, optional consent-based analytics, opt-in updates, and genuine permission-backed testimonials. Add a private lead dashboard only if managing inquiries through a restricted operational workflow becomes burdensome.

**Excluded from MVP:** Visitor accounts, payments, checkout, chatbots, client portals, uploaded inquiry attachments, newsletter automation, session replay, advertising pixels, and a bespoke CMS. No login should obstruct viewing projects or making an inquiry.

### User stories and acceptance scenarios

| ID | Priority | Story and acceptance scenario |
| --- | --- | --- |
| US-01 | P1 | As a client, I can understand Erll’s offering. Within a short home-page scan, I can identify the services, see real work, and find “Discuss your project.” |
| US-02 | P1 | As a recruiter, I can assess competence. Each published case study identifies Erll’s contribution, stack, project status, and available code/demo evidence; résumé download works without an account. |
| US-03 | P1 | As a prospect, I can contact Erll. Valid consented submissions are saved once and acknowledged; invalid fields receive accessible errors; a failed save never displays success. |
| US-04 | P1 | As a privacy-conscious visitor, I can reject optional tracking and still use every essential feature. Changing preferences prevents future optional requests. |
| US-05 | P1 | As a keyboard or screen-reader user, I can navigate projects, preferences, and forms without traps or unlabeled controls. |
| US-06 | P1 | As an inquirer, I can request access, correction, or deletion through a working process that verifies identity proportionately and explains any retained records. |
| US-07 | P2 | As a returning visitor, I can find useful new project evidence, related work, and a relevant next step without intrusive popups. |

## 2. Positioning, content, and design

### Suggested messaging

- Hero: **“Web and app projects built around real business needs.”**
- Introduction: **“I’m Erll, a graduating BSIT student majoring in Service Management. I build web and app projects with a focus on usability, clear workflows, and practical solutions.”**
- Primary CTA: **“Discuss your project.”**
- Secondary CTA: **“View my work.”**
- Recruiter link: **“View résumé.”**

Describe skills through evidence rather than percentage bars or unsupported “expert” labels. Service Management can support a credible emphasis on requirements, communication, handover, and ongoing support when demonstrated in actual work.

### Pages and content

| Route | Content and behavior |
| --- | --- |
| `/` | Short introduction, 2–3 strongest projects, services summary, working process, brief about section, contact CTA |
| `/projects` | Clear project cards showing problem, contribution, category, and status; filters only when enough projects justify them |
| `/projects/[slug]` | Full case study, accessible screenshots, code/demo links when permitted, related project, contextual contact CTA |
| `/about` | Accurate education status, development interests, collaboration approach, skills tied to project evidence, verified GitHub/LinkedIn links |
| `/services` | Websites, web applications, app development only where supported by work, and optional maintenance; scope, exclusions, process, quote approach |
| `/contact` | Short inquiry form, working business email, actual availability, expected next step; separate project and job-opportunity inquiry types |
| `/privacy`, `/terms`, `/refunds`, `/cookies` | Versioned, plain-language policies matching the actual implementation and service model |
| `/privacy-request` | Minimal request form for access, correction, or deletion; neutral confirmation without exposing whether a record exists |

**Case-study structure:** business/user problem; project type (academic, personal, volunteer, or paid); individual/team ownership; Erll’s specific contribution; constraints; solution and rationale; stack; screenshots; tests; results with evidence; limitations; lessons; next steps; safe demo/code access.

Prepare two or three substantial case studies before launch. A booking/POS system or budget app is a candidate only if Erll confirms ownership, actual implementation, and publication rights. Never display private client data, secrets, internal dashboards, or other team members’ work as Erll’s own. Label sample datasets and simulated outcomes. If no measured result exists, explain verified functionality instead of inventing percentages.

**Visual direction:** modern, restrained, readable, and project-led. Use a neutral background, one accessible accent color, consistent type sizes, clear section spacing, and real project screenshots. Design for mobile first and test 320–1440px layouts. Avoid scroll hijacking, excessive animation, skill-cloud clutter, and autoplay video. Respect reduced-motion preferences. Use readable line lengths and enough whitespace for comprehension.

## 3. Trust, conversion, and retention

1. Show evidence before asking for commitment: case studies, demonstrations, source code where permitted, and a transparent process.
2. Explain the service journey: inquiry → discovery → written scope and quote → milestones → review → handover → optional maintenance.
3. Keep inquiries short. Ask about the business problem rather than requiring a technical specification.
4. Set an honest response expectation based on Erll’s real schedule; do not publish a response-time promise until confirmed.
5. Describe revisions, ownership, support boundaries, recurring costs, and change requests before a paid engagement.
6. Add related case studies and dated project updates that give visitors a reason to return. Keep durable URLs that are easy to share in applications and proposals.
7. Offer maintenance only with clear scope, pricing, and cancellation terms. Obtain separate permission for marketing follow-ups.
8. Request genuine feedback after completed work; publish only with permission and accurate attribution. Launch without testimonials if none are available.

### Measurement plan

Establish a baseline during the first 30 days after launch, then review monthly. All figures below are proposed evaluation methods, not promised business outcomes.

| Metric | Definition | Collection approach |
| --- | --- | --- |
| Inquiry quality | Qualified project inquiries ÷ all non-spam project inquiries | Manual classification; define qualified as a relevant, actionable problem with reachable contact details |
| Inquiry conversion | Successful inquiries ÷ eligible measured visits | Only if permitted analytics is enabled; state consent-related coverage limits |
| Recruiter engagement | Genuine recruiter inquiries and interview invitations per month | Manual record; separate from freelance leads |
| Case-study engagement | Case-study views and related CTA actions | Optional aggregate events, with no form content or email addresses |
| Returning visits | Returning visitors ÷ measured visitors | Optional consented identifier only; report as unknown when unavailable, never fingerprint |
| Client retention | Clients commissioning another engagement ÷ completed clients eligible for follow-up in a defined period | Private operational records; do not confuse this with website return visits |
| Reliability | Successful saves, delivery failures, and response times | Redacted operational monitoring |

Suggested analytics events: `project_view`, `demo_click`, `resume_download`, `contact_start`, `contact_success`. Do not send names, email addresses, messages, precise locations, or arbitrary URL query strings. Improve one meaningful element at a time; avoid declaring statistical success from a small sample.

## 4. Technical context

| Area | Planned decision |
| --- | --- |
| Language/runtime | JavaScript with TypeScript recommended for maintainability; supported Node.js LTS compatible with selected dependencies |
| Frontend | Next.js App Router using React and Tailwind CSS; select compatible stable releases and pin the lockfile during setup |
| Backend | Next.js server route handlers on Node.js; no separate Express service needed for MVP |
| Rendering | Static/pre-rendered public content; client components only for interactions that need them |
| Content | Version-controlled typed content or trusted local MDX; no execution of visitor-supplied MDX |
| Local data | SQLite with synthetic development data |
| Deployed data | Supabase PostgreSQL, separate staging and production environments |
| Persistence | Small repository interface with SQLite and PostgreSQL adapters; parameterized queries and explicit migrations per dialect |
| Email | Server-side SMTP or a selected transactional provider behind an adapter; credentials remain server-only |
| Tests | Unit and integration tests for forms/data rules; Playwright for critical browser flows; accessibility automation plus manual review |
| Hosting | A Node.js-compatible Next.js host; provider, region, domain, and budget decided before deployment |
| Initial scale | One portfolio owner, a small curated project collection, and modest inquiry traffic; no speculative microservices |

### Architecture and security boundaries

Public pages use versioned content and optimized static assets. The browser sends inquiries to same-origin server endpoints. The server validates input, checks consent and abuse controls, writes a database transaction, and enqueues an email notification. A scheduled worker retries delivery. The browser never connects directly to inquiry tables.

Use a restricted database role for runtime inquiry operations. Keep private tables outside exposed API schemas where practical. Where Supabase tables are exposed, enable RLS and verify policies; deny anonymous reads and writes to private records. Privileged service credentials must never appear in browser bundles. RLS is not a substitute for server authorization, and privileged roles may bypass it. See source [4].

No public admin registration. For MVP, Erll can inspect records through a tightly controlled operator account with MFA. A later dashboard requires independent authorization and audit coverage.

### SQLite → Supabase compatibility

SQLite is not an equivalent test environment for PostgreSQL permissions, concurrency, or data types. Maintain one logical data contract and separate dialect migrations. Generate identifiers in application code; normalize timestamps to UTC; explicitly map booleans, constraints, and status values. Enable SQLite foreign keys. Avoid relying on implicit coercion or PostgreSQL-only features in shared business logic.

Run the same repository contract tests against SQLite and staging PostgreSQL. Test PostgreSQL grants/RLS, unique constraints, transactions, and duplicate-submission handling before launch. Seed both with synthetic data. Do not upload local test inquiries to production. Apply migrations through a controlled deployment step, not on every request.

### Proposed project structure

```text
.specify/memory/constitution.md
specs/001-erll-portfolio/
  spec.md
  plan.md
  research.md
  data-model.md
  contracts/
  quickstart.md
  tasks.md
src/
  app/
  components/
  content/projects/
  lib/validation/
  lib/server/repositories/
  lib/server/email/
  lib/server/consent/
db/
  sqlite/migrations/
  postgres/migrations/
public/projects/
tests/unit/
tests/integration/
tests/e2e/
```

These paths are the implementation structure; project artifacts, source files, and migration files have been created in this repository. See `specs/001-erll-portfolio/tasks.md` and `release-checklist.md` for current completion and verification state.

## 5. Data model and endpoint contracts

### Minimal data model

| Entity | Fields and constraints | Access/retention |
| --- | --- | --- |
| Project content | Unique slug, title, summary, problem, role, type/status, stack, evidence, assets/alt text, links, publication/update dates | Public; version-controlled, permission-reviewed |
| Inquiry | ID, name, email, type, message, optional budget/timeline, consent wording version/time, status, created time, idempotency key | Private; server write/operator read only |
| Notification job | ID, inquiry ID, status, attempts, next attempt, sanitized failure code | Private; no duplicate full message copy; delete with parent where applicable |
| Privacy request | ID, contact email, request type, verification state, status, received/resolved dates | Private; store minimal verification evidence, not identity-document copies by default |
| Cookie preference | Essential=true, optional categories, policy version, saved time | Local preference storage; no identity or advertising identifier |

Proposed operating defaults, subject to policy review: erase unconverted inquiries 90 days after the last meaningful exchange; retain sanitized delivery diagnostics for 30 days; keep minimal resolved privacy-request evidence for 12 months. Contract/accounting records require a separately confirmed schedule. Document backup expiry and ensure restoration reapplies deletions. These are design defaults, not statutory retention periods.

### Endpoint behavior

| Endpoint | Input | Required behavior |
| --- | --- | --- |
| `POST /api/inquiries` | Name (1–100 characters), email (max 254), type, message (20–3000), optional budget/timeline, explicit contact consent, idempotency key | Validate server-side; save inquiry and notification job atomically; return 201 and a non-sensitive receipt only after commit |
| `POST /api/privacy-requests` | Email, request type, limited optional detail | Rate-limit; return neutral 202; verify ownership separately before disclosure/deletion |
| Internal delivery worker | Authorized scheduled trigger | Send to Erll’s configured address; retry with backoff; prevent duplicate deliveries where possible; expose no public job listing |

Use 400 for invalid input, 429 with retry guidance for abuse limits, and generic 5xx responses for unexpected failures. Keep form values on recoverable errors. Disable accidental double clicks and enforce idempotency in the database. Saving successfully but failing to notify is a delivery issue: retain the inquiry, retry notification, and alert the operator. Do not tell visitors email was delivered unless confirmed.

Reject unexpected fields and oversized bodies; normalize safely without changing the substance of a message. Do not use user input as an email sender/header, SQL fragment, or HTML markup. Use server validation, origin checks, parameterized queries, output escaping, shared deployment-compatible rate limiting, and a honeypot before adding an external CAPTCHA.

## 6. Privacy, policies, accessibility, and ethical design

This is an implementation checklist, not a legal certification. Confirm Erll’s operating jurisdiction and intended customer markets before finalizing policy language. If operating in the Philippines, review the Data Privacy Act and NPC guidance; international targeting may introduce additional obligations. Sources [2–3] inform the privacy and accessibility design.

| Requirement | Implementation and acceptance evidence |
| --- | --- |
| Privacy Policy | Explain operator identity/contact, collected data, purposes and applicable processing basis, processors, transfers, retention, rights, request process, and effective date. Compare every statement with an actual data-flow inventory. |
| Terms of Service | Explain site use, intellectual property, service engagement process, limitations, and dispute/contact route. Paid work requires a written agreement; merely sending an inquiry creates no payment obligation. |
| Refund Policy | Publish the actual cancellation/refund approach before taking paid work: deposits, completed milestones, unperformed work, third-party costs, and request process. No invented percentages or blanket waiver of mandatory rights. No checkout in MVP. |
| Cookie Policy | Inventory cookies and local storage by name, provider, purpose, category, and duration. Cover preference storage and any later analytics. |
| Cookie consent banner | Build accessible Accept optional / Reject optional / Preferences controls with comparable prominence. Optional categories default off; nothing optional loads before consent. Preferences remain reachable in the footer. If the deployed site uses essentials only, show a truthful notice rather than implying nonexistent tracking. |
| Check form consent | Use an unchecked, specific checkbox: “I agree that Erll may use these details to respond to my inquiry,” linked to the privacy notice. Validate it server-side. Keep any future marketing choice separate, optional, and unchecked. Confirm the appropriate processing basis in the final policy. |
| Collect only needed data | Require name, email, inquiry type, and message. Budget and timeline optional. No mandatory phone, address, birth date, ID, company, or attachments. Warn users not to include sensitive information. |
| Audit third-party SDKs | Maintain vendor/purpose/data/cookies/retention/consent/license register. Check network traffic before and after consent. Prefer self-hosted fonts and plain external links over embeds. Remove unused SDKs. |
| Remove dark patterns | No forced subscription, fake countdown, scarcity claims, obstructive cancellation, disguised ads, guilt-based refusal text, or prechecked optional choices. |
| No hidden fees | Disclose hosting, domain, maintenance, licenses, taxes where applicable, revisions, and scope-change costs in the quote before agreement. No invented public rates. |
| No fake reviews | Only publish feedback from real people with permission; identify the project context and material relationships. Otherwise omit the section. |
| No unsupported claims | Maintain an evidence record for quantified outcomes, awards, availability, credentials, and client logos. Label prototypes and synthetic data. |
| Add alt text | Meaningful alt text for informative imagery; empty alt for decoration. Explain important screenshot content in nearby text; no essential text available only as an image. |
| Fix color contrast | Target WCAG 2.2 AA: 4.5:1 for normal text, 3:1 for large text, and applicable 3:1 non-text contrast. Verify all states, including errors and focus. |
| Keyboard navigation | Semantic structure, skip link, visible focus, logical order, accessible menus/dialogs, Escape handling, focus restoration, and no keyboard traps. Test every route and form manually. |
| Business details | Publish verified professional/operator name, working contact, general location/time zone, and applicable business disclosures. Do not invent company registration or expose a residential address unnecessarily. |
| Age consent for kids | Public reading does not require an age gate. Default inquiry/service audience to adults with a simple 18+ attestation, not birth-date collection. Direct minors to have a parent/guardian contact Erll. This is a service design choice, not a universal legal age rule; deliberate child-facing services require jurisdiction-specific consent design before launch. |
| Unsubscribe links | If promotional email is later enabled, require separate opt-in and a working no-login unsubscribe link in each message; honor withdrawal and maintain a minimal suppression record. Do not insert marketing into transactional inquiry replies. |
| License stock images | Prefer Erll’s own project assets. Track source, author, license, permitted use, attribution, and consent/release where relevant for every external asset, including fonts and icons. |
| Data deletion option | Provide a visible privacy-request link and email alternative; verify request ownership proportionately, remove relevant live data and processor copies where applicable, document exceptions and backup expiry, and communicate the result. |

Also test screen-reader announcements, form labels/error associations, zoom/reflow, reduced motion, mobile target sizes, and consent-dialog usability. Automated accessibility scores alone do not establish compliance.

## 7. Constitution Check

Proposed project principles to place in the Spec Kit constitution:

1. Evidence before claims: no invented results, clients, reviews, qualifications, or project ownership.
2. Privacy by default: minimum data, no optional tracking before permission, and working deletion processes.
3. Accessibility is a release gate, not a later cosmetic task.
4. Preserve the specified stack while documenting SQLite/PostgreSQL differences.
5. Keep business rules server-side and secrets out of public artifacts.
6. Build the smallest useful product; add dependencies only for a justified need.
7. Verify critical user journeys and production data boundaries before launch.

**Pre-research gate:** Principles are represented in this plan; owner-specific content, vendor choices, and policy decisions remain open.  
**Post-design gate:** Recheck after data contracts and vendor selection.  
**Release gate:** Requires passing evidence; nothing in this document certifies an implementation has passed.

### Complexity tracking

| Deliberate complexity | Why it is needed | Simpler alternative and decision |
| --- | --- | --- |
| Two database adapters and migration sets | Erll explicitly requested SQLite development and Supabase deployment | One PostgreSQL environment would reduce mismatch, but does not satisfy the requested local setup |
| Notification outbox and retry worker | Prevent an email outage from losing a saved lead | Synchronous send alone is simpler but makes inquiry handling less reliable |

## 8. Spec Kit execution workflow and delivery phases

Use the installed Spec Kit integration’s supported command syntax; names can differ by agent/version. Follow constitution → specification → clarification → plan → tasks → implementation → verification/convergence. Preserve reviewed decisions when generating artifacts; do not overwrite this plan with generic boilerplate.

### Phase 0 — Research and decisions

Create `research.md`: confirm deployment/runtime compatibility, database adapter libraries, SMTP/provider choice, job scheduler, shared rate limiting, target audience/jurisdiction, analytics choice, and asset rights. Pin compatible versions and record rationale and alternatives. Resolve infrastructure questions before dependent code; content gaps may remain clearly marked in private drafts but must not reach production.

### Phase 1 — Specification and design

Create `spec.md` from Section 1 and map requirements to acceptance scenarios. Create `data-model.md`, endpoint contracts, `quickstart.md`, and responsive wireframes. Document local setup, environment keys without secrets, migrations, seeds, tests, and production differences. Complete the data-flow/vendor inventory and rerun Constitution Check.

### Phase 2 — Foundation and public experience

Create `tasks.md` with IDs, requirement references, dependencies, acceptance checks, and completion evidence. Set up Next.js, Tailwind, content models, shared layout, project pages, about, services, résumé, policy routes, semantic navigation, metadata, sitemap, robots rules, and error pages. Use truthful draft content; preview deployments should not be indexed.

### Phase 3 — Inquiries and privacy controls

Implement validation, database adapters/migrations, inquiry persistence, idempotency, abuse prevention, notification jobs, consent preferences, and privacy-request workflow. Make rejected optional tracking behave correctly. Verify restricted data access on staging PostgreSQL.

### Phase 4 — Content, testing, and launch

Replace every placeholder with approved content, confirm all ownership/license evidence, and validate case studies and links. Test critical flows, accessibility, small-screen layouts, slow-network behavior, permissions, failures, and delivery retries. Deploy to staging first; run production migrations with a backup/rollback plan, then release only after the checklist passes.

### Phase 5 — Operate and improve

Review inquiries and delivery failures regularly, refresh availability and work samples, run scheduled retention cleanup, patch dependencies, and inspect links. Use the first month as baseline; make subsequent improvements based on observed friction and actual lead quality. Record each new feature through the same specification/task process.

## 9. Verification and definition of done

**Functional:** All public routes, résumé downloads, project links, inquiry types, consent preferences, and privacy requests work. Missing/invalid inputs, unchecked consent, duplicate requests, database outages, email outages, and rate limiting produce appropriate behavior.

**Security/privacy:** Anonymous users cannot retrieve inquiries or privacy requests. Runtime grants are restricted. PostgreSQL RLS/grants are tested with the actual roles. No secrets in bundles or logs. Logs exclude message bodies and unnecessary personal data. Optional SDKs make no requests before consent or after rejection. Deletion and backup-restoration procedures have a documented test.

**Accessibility:** Keyboard-only and screen-reader smoke tests cover navigation, forms, errors, and dialogs. Verify contrast, alt text, headings, zoom, reflow, focus, and reduced motion. No unresolved critical accessibility defects.

**Performance targets:** Aim for LCP ≤2.5 seconds, INP ≤200 milliseconds, and CLS ≤0.1 at the 75th percentile when sufficient real-user data exists. Before traffic exists, use repeatable mobile lab tests and interaction checks; do not report lab scores as field results. Optimize images, reserve dimensions, defer below-fold assets, minimize browser JavaScript, and avoid unnecessary third-party requests.

**Operational:** Save inquiries even during email failure; retry notifications without creating duplicate leads. Verify backup recovery, retention cleanup, error monitoring, and rollback. Measure endpoint behavior under a small realistic staging load; do not claim untested concurrency capacity.

**Content/business:** At least two honest, complete case studies; verified résumé and contacts; no placeholder text, fake social proof, broken demos, or unsupported outcome claims. Policies match actual vendors and practices. No service is advertised with undisclosed mandatory charges.

**Release evidence:** Record tested environment, date, scenarios, results, known limitations, and owner review in a release checklist. Mark unfinished items as unfinished. A successful build alone is insufficient.

## 10. Owner decisions needed before public launch

These do not prevent building the foundation:

- Professional display/full name, business contact, GitHub/LinkedIn URLs, public location/time zone, and domain.
- Accurate résumé, education dates/status, availability, and realistic response window.
- Two or three projects with screenshots, ownership/contribution details, demo/repository permissions, and actual evidence.
- Service boundaries, quote currency, revisions, maintenance terms, cancellation/refund decisions, and business disclosures.
- Hosting budget/provider, email sender/provider, deployed region, and intended customer jurisdictions.
- Whether analytics or promotional updates are wanted; default is no optional tracking and no newsletter.

## Sources and adaptation notes

Reviewed 2026-11-05. The product strategy, architecture choices, operating defaults, and acceptance criteria are tailored proposals for Erll. Spec Kit provides the planning workflow and template structure; it does not prescribe this portfolio design.

1. GitHub Spec Kit: https://github.com/github/spec-kit — planning template: https://github.com/github/spec-kit/blob/main/templates/plan-template.md
2. Philippine National Privacy Commission, Data Privacy Act: https://privacy.gov.ph/data%20-privacy-act/
3. W3C, WCAG 2.2: https://www.w3.org/TR/WCAG22/
4. Supabase, Row Level Security: https://supabase.com/docs/guides/database/postgres/row-level-security
