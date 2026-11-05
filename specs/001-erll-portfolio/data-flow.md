# Data-flow and vendor inventory

No optional third-party visitor SDK is included. `@axe-core/playwright` is a development-only accessibility test tool and is not part of the browser runtime. The DM Sans stylesheet and font are loaded from Google Fonts in the visitor's browser. This inventory is based on repository code; confirm production host and providers before launch.

| Flow/vendor | Data | Purpose | Consent / retention | Status |
| --- | --- | --- | --- | --- |
| Browser → same-origin Next.js `/api/inquiries` | Name, email, type, message, optional budget/timeline, adult/response consent | Save inquiry and schedule response notification | Explicit unchecked response consent; owner retention schedule pending | Implemented |
| Browser → same-origin `/api/privacy-requests` | Email, request kind, optional bounded detail | Record access/correction/deletion request; verify separately | Neutral response; proposed minimal 12-month resolved record, review required | Implemented |
| Browser local storage `erll-cookie-preferences-v1` | Essential=true, optional=false, policy version, save time | Remember user's essential-only preference | No network transmission or identifier; until browser clears | Implemented |
| Admin browser → same-origin `/api/admin/*` | Project content, publication state, uploaded JPEG/PNG/WebP images | Manage public portfolio projects | Signed eight-hour HTTP-only session; same-origin mutations; server-side validation; no registration | Implemented; owner credentials must be configured |
| Admin upload → SQLite / Supabase Postgres | Resized WebP image bytes (max 2 MB each), alt text, dimensions | Persist project case-study media | Stored in private DB tables; public image route serves only when parent project is published; until project/image deletion | Adapter/migration implemented; production DB/RLS and backups unverified |
| Browser → Google Fonts (`fonts.googleapis.com`, `fonts.gstatic.com`) | Standard request metadata such as IP address and browser headers; font request | Render DM Sans typography | Loaded on page view; not controlled by cookie preference UI; Google provider terms apply | Implemented |
| Server → SQLite | Application inquiry/privacy records, outbox, HMAC rate bucket | Local development only | Synthetic seeds only; `.gitignore` excludes DB | Implemented |
| Server → Supabase Postgres | Private records/outbox/rate bucket/projects/project image blobs | Staging/production persistence | TLS, restricted runtime role, RLS/grants; actual role verification pending | Adapter/migration implemented; deployment unverified |
| Worker → SMTP provider/Mailpit | Fixed operator sender/recipient plus opaque inquiry/request reference and category; no visitor email, name, or message | Notify operator without copying form contents into email | Provider and its region/retention not yet selected; Mailpit is local-only development recommendation | Adapter implemented; delivery unverified |
| Hosting platform | IP/technical HTTP metadata as configured by host | Deliver pages, route abuse controls | Host and own logs/retention need owner review | Not selected |

Before launch inspect browser requests before and after preferences, inspect response headers, verify provider contracts and locations, and update this list for every added SDK or external image/font/embed. Current icons are inline React SVG; DM Sans is delivered by Google Fonts and no external imagery is fetched.
