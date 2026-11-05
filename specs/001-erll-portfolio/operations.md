# Private Operator Runbook

The portfolio has no public admin route. Use the Supabase/dashboard or database operations interface with MFA, a named operator account, and access restricted to the owner. Do not put these queries or their results into public/client support logs. SMTP notifications contain only opaque record references and category; review the private database to read/respond. Do not grant the runtime credential to visitors or use a service key in the browser.

## Review an inquiry

Use the reference from the notice and a parameterized query:

```sql
SELECT id, name, email, inquiry_type, message, budget, timeline, consent_wording_version, consented_at, status, created_at, last_meaningful_exchange_at
FROM inquiries WHERE id = $1;
```

Change `status` only after review; update `last_meaningful_exchange_at` after a meaningful follow-up. Avoid exporting full inquiry tables. A response email should be a one-to-one service response, not a marketing subscription.

## Handle a privacy request

1. Locate the request using its opaque ID. Do not reveal whether a record exists in an unverified reply.
2. Verify control of the contact address using a proportionate out-of-band step. Do not collect identity document copies by default.
3. For access, query only records needed to answer the verified request and send securely. For correction, use parameterized updates. For deletion, remove in-scope inquiry and linked outbox rows (foreign-key cascade) after evaluating any documented legal obligation/contract exception; retain no extra data to prove deletion.
4. Mark the request `verification_state='verified'` only after the check. Record `status='resolved'`, `resolved_at=now()` after completion, then communicate the outcome and any specific lawful retention exception.
5. Remove the matching opaque-reference notification from the operator mailbox after handling or under the confirmed mailbox retention policy; it contains no visitor email/message but can be linked to a private record. The automated cleanup removes resolved request records after the proposed 12-month period. Confirm jurisdiction and this period before launch.

## Delivery worker

Inspect counts and sanitized failure codes only:

```sql
SELECT status, failure_code, count(*) FROM notification_jobs GROUP BY status, failure_code;
```

`sent` records mean the configured SMTP transport accepted the message; they do not prove inbox delivery. Delivery is at-least-once: a process failure after SMTP acceptance but before the database update can produce a repeat notice; retries reuse a stable Message-ID where providers support deduplication. Retried failures use backoff, up to eight attempts. Restore sender credentials or provider health, then schedule another worker invocation for still-pending jobs. Do not manually mark a job sent without transport confirmation.

## Retention and backups

Run the guarded `db:cleanup` task on a private schedule. It deletes `new` unconverted inquiries after 90 days from last meaningful exchange when no pending/processing notification remains; old sent/permanently failed job diagnostics after 30 days; resolved privacy requests after 365 days; and stale rate-limit hashes after one day. These periods are proposals requiring owner/jurisdiction review. Record cleanup counts, not identifiers or message contents. Ensure backup expiry is known; test restoring a backup and immediately reapplying deletion/retention before any restored environment is made available.
