# Server Contracts

All endpoints run on the Node.js runtime, same origin, JSON, bounded body (16 KiB), `Cache-Control: no-store`; generic errors never include driver, mail, or inquiry details.

## `POST /api/inquiries`

Required exact fields: `name`, `email`, `type`, `message`, `consent: true`, `idempotencyKey`; optional `budget`, `timeline`, `website` honeypot. Unknown properties rejected. Origin/host checked; originless requests are rejected outside local development. 400 field errors; 413 oversized body; 403 origin/consent; 409 invalid idempotency; 429 rate limit; 201 `{receiptId}` only after transaction commit. Replayed idempotency key returns same receipt with `replayed: true`. Mail is not sent in request path.

## `POST /api/privacy-requests`

`email`, `type`, optional bounded `details`; strict validation and same origin/rate controls. On accepted or repeated submissions return neutral 202 `{message}` without revealing record existence. No public read route.

## `POST /api/internal/notifications`

Bearer `WORKER_SECRET` compared in constant time; empty/missing secret disables worker. Claim a bounded batch transactionally, send SMTP, mark sent or schedule exponential retry with sanitized code. No body or private record in response/log. Return counts only. Worker invocation is internal and scheduler is deployment-specific.

## Response safety

Validation strings are plain text rendered as text; email uses fixed verified sender/recipient and escaped text-only content, never visitor-controlled headers or HTML. SQL values are bound parameters. Logs contain request correlation ID, status, opaque record ID only where needed, and error class/code; never body, email, name, IP, or secrets.
