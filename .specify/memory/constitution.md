# Erll Portfolio Constitution

## Principles

1. **Evidence before claims.** Never invent clients, outcomes, credentials, testimonials, project ownership, or work history. Label prototypes, team contributions, draft content, and synthetic data accurately.
2. **Privacy by default.** Collect the minimum needed, keep optional tracking off, avoid third-party SDKs, and provide a usable data request path.
3. **Accessibility is a release requirement.** Semantic HTML, keyboard access, visible focus, readable contrast, responsive reflow, meaningful alternatives, and reduced-motion support are part of implementation.
4. **Server owns sensitive work.** Validation, persistence, email, abuse controls, privacy requests, and secrets remain server-side.
5. **One logical contract, explicit database differences.** SQLite supports local development; PostgreSQL is the deployment target. Separate adapters/migrations and verify both dialects.
6. **Smallest useful system.** No CMS, accounts, payments, advertising, or major dependency without a demonstrated need.
7. **Verification before release.** Critical journeys, failure cases, security boundaries, content rights, policies, and launch readiness need recorded evidence.

## Quality gates

- Public content has an owner approval and evidence source; missing material stays clearly marked as a draft and is excluded from indexing.
- Inquiry success follows a committed database transaction. Duplicate idempotency keys cannot create duplicate inquiries.
- Public requests cannot read private lead or privacy-request records. Staging PostgreSQL authorization and RLS/grants need separate tests; SQLite is not evidence of those properties.
- Policy statements match actual data flows, providers, retention, and service terms. Jurisdiction-specific language requires owner review.
- Responsive, keyboard, and screen-reader review is documented before launch.
- Each task is marked complete only when its acceptance criteria have been verified and evidence recorded.

## Governance

This constitution governs implementation and supersedes convenience when the two conflict. Amendments require documenting the reason and rechecking affected specification, data contracts, tasks, and release evidence. Draft implementation status is not release approval.
