CREATE TABLE IF NOT EXISTS inquiries (
  id TEXT PRIMARY KEY,
  idempotency_key TEXT NOT NULL UNIQUE,
  name TEXT NOT NULL CHECK(length(name) BETWEEN 1 AND 100),
  email TEXT NOT NULL CHECK(length(email) BETWEEN 3 AND 254),
  inquiry_type TEXT NOT NULL CHECK(inquiry_type IN ('project','job','other')),
  message TEXT NOT NULL CHECK(length(message) BETWEEN 20 AND 3000),
  budget TEXT,
  timeline TEXT,
  consent_wording_version TEXT NOT NULL,
  consented_at TEXT NOT NULL,
  status TEXT NOT NULL DEFAULT 'new' CHECK(status IN ('new','in_progress','closed','spam')),
  created_at TEXT NOT NULL,
  updated_at TEXT NOT NULL,
  last_meaningful_exchange_at TEXT NOT NULL
);

CREATE TABLE IF NOT EXISTS privacy_requests (
  id TEXT PRIMARY KEY,
  idempotency_key TEXT NOT NULL UNIQUE,
  email TEXT NOT NULL CHECK(length(email) BETWEEN 3 AND 254),
  request_type TEXT NOT NULL CHECK(request_type IN ('access','correction','deletion')),
  details TEXT CHECK(details IS NULL OR length(details) <= 500),
  verification_state TEXT NOT NULL DEFAULT 'pending' CHECK(verification_state IN ('pending','verified','rejected')),
  status TEXT NOT NULL DEFAULT 'new' CHECK(status IN ('new','in_progress','resolved')),
  created_at TEXT NOT NULL,
  resolved_at TEXT
);

CREATE TABLE IF NOT EXISTS notification_jobs (
  id TEXT PRIMARY KEY,
  inquiry_id TEXT UNIQUE REFERENCES inquiries(id) ON DELETE CASCADE,
  privacy_request_id TEXT UNIQUE REFERENCES privacy_requests(id) ON DELETE CASCADE,
  status TEXT NOT NULL DEFAULT 'pending' CHECK(status IN ('pending','processing','sent','failed')),
  attempts INTEGER NOT NULL DEFAULT 0 CHECK(attempts >= 0),
  next_attempt_at TEXT NOT NULL,
  lease_until TEXT,
  failure_code TEXT,
  created_at TEXT NOT NULL,
  sent_at TEXT,
  CHECK((inquiry_id IS NOT NULL) <> (privacy_request_id IS NOT NULL))
);

CREATE TABLE IF NOT EXISTS rate_limits (
  bucket_key TEXT PRIMARY KEY,
  window_started_at TEXT NOT NULL,
  count INTEGER NOT NULL CHECK(count >= 0),
  updated_at TEXT NOT NULL
);

CREATE INDEX IF NOT EXISTS notification_due_idx ON notification_jobs(status, next_attempt_at);
CREATE INDEX IF NOT EXISTS inquiry_retention_idx ON inquiries(status, last_meaningful_exchange_at);
CREATE TABLE IF NOT EXISTS schema_migrations (name TEXT PRIMARY KEY, applied_at TEXT NOT NULL);
