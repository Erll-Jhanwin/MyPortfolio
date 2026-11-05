# Feature Specification: Erll Developer Portfolio

**Status:** Draft implementation specification; owner content and launch choices remain open.  
**Source of truth:** Repository `plan.md`, dated 2026-11-05.

## Goal and audiences

Help prospective clients understand how Erll approaches business problems and help recruiters assess suitability for remote developer roles. Erll is a fourth-year graduating Bachelor of Science in Information Technology student majoring in Service Management and builds web and app projects. The portfolio supports trust but does not promise employment, revenue, or results.

Audience journeys: owner → relevant case study → services/process → project inquiry; recruiter → projects/code → skills/about → résumé; existing prospect/client → relevant work/support → follow-up.

## Scope

MVP includes home, projects index, individual case-study route, about/skills, services/process, contact, résumé download, privacy, terms, refunds, cookies, privacy request, responsive navigation, metadata/robots/sitemap, accessible preference controls, inquiry and privacy-request endpoints, and persistent outbox notification retry. No accounts, checkout, chat, attachments, CMS, advertising, or analytics SDK.

## Functional requirements

- **FR-01 (US-01):** Home scan presents services, evidence, process, and “Discuss your project.”
- **FR-02 (US-02):** Project cards and case studies disclose type, status, Erll’s specific contribution, stack, evidence, limitations, and authorized code/demo links.
- **FR-03 (US-02):** About/skills and résumé are reachable without authentication. Missing résumé is reported transparently, never replaced with a fake file.
- **FR-04 (US-01):** Services explain scope, exclusions, discovery, quote, milestones, review, handover, support, and variable costs without invented public rates.
- **FR-05 (US-03):** Inquiry accepts name (1–100), email (≤254), type, message (20–3000), optional budget/timeline, unchecked explicit consent, honeypot, and idempotency key. Server validates and rejects unknown fields/oversized bodies. It stores lead and outbox job atomically, applies database-backed rate limits, and returns success only after commit.
- **FR-06 (US-03):** Email notification runs separately through a retryable job. Delivery errors are sanitized, never lose a committed inquiry, and are not represented as visitor-facing email success.
- **FR-07 (US-04):** Essential functionality works without optional tracking; optional categories default off. Preference control is keyboard accessible and reachable in footer. Current app makes no optional tracking requests.
- **FR-08 (US-06):** Privacy requests accept minimal details, return neutral confirmation, rate-limit, and require proportionate identity verification before disclosure/deletion.
- **FR-09 (US-05):** All routes/forms support keyboard flow, clear focus, labels, associated errors, reduced motion, reflow, and usable targets.
- **FR-10:** Plain-language policies cover actual collection, processing, vendors, retention, rights, service conditions, cancellations, and data requests. Unconfirmed operator/jurisdiction/service terms stay identified as owner-review items.
- **FR-11:** Unknown routes, failures, loading, and empty project/resume states are designed and informative.
- **FR-12 (US-07):** Durable case-study URLs and related-project paths support return visits without popups.

## Acceptance scenarios

1. A client finds a relevant published case study and contact CTA within the home/projects flow.
2. A recruiter can see ownership, status, stack, code/demo evidence, skills, and a real résumé if provided.
3. Invalid input/unchecked consent gets accessible feedback; valid consented input is saved exactly once; database failure never returns success.
4. Repeating a request with the same idempotency key returns the same non-sensitive receipt and creates no extra inquiry/job.
5. Mail outage leaves the inquiry saved and notification retryable; sanitized status is available to operator only.
6. Rejecting optional cookies is equivalent in prominence to accepting; no optional SDK or request loads before permission.
7. Anonymous requests cannot list/read leads or privacy requests.
8. Keyboard and screen-reader users can use navigation, preferences, validation, and all forms without traps.
9. Unknown case study returns a genuine not-found page; empty project collection has a clear state.
10. Policy text matches code/environment and identifies draft review prerequisites.

## Explicit launch blockers

Owner must approve verified name/contact/social links, location disclosure, availability and response expectation, résumé, real project evidence and rights, service and refund terms, business disclosures, jurisdiction/customer markets, host/region/budget, production sender, and retention/legal basis. No fictitious project is included to satisfy a target count.
