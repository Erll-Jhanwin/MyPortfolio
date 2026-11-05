CREATE TABLE IF NOT EXISTS inquiries (
  id uuid PRIMARY KEY,
  idempotency_key text NOT NULL UNIQUE,
  name text NOT NULL CHECK(char_length(name) BETWEEN 1 AND 100),
  email text NOT NULL CHECK(char_length(email) BETWEEN 3 AND 254),
  inquiry_type text NOT NULL CHECK(inquiry_type IN ('project','job','other')),
  message text NOT NULL CHECK(char_length(message) BETWEEN 20 AND 3000),
  budget text,
  timeline text,
  consent_wording_version text NOT NULL,
  consented_at timestamptz NOT NULL,
  status text NOT NULL DEFAULT 'new' CHECK(status IN ('new','in_progress','closed','spam')),
  created_at timestamptz NOT NULL,
  updated_at timestamptz NOT NULL,
  last_meaningful_exchange_at timestamptz NOT NULL
);

CREATE TABLE IF NOT EXISTS privacy_requests (
  id uuid PRIMARY KEY,
  idempotency_key text NOT NULL UNIQUE,
  email text NOT NULL CHECK(char_length(email) BETWEEN 3 AND 254),
  request_type text NOT NULL CHECK(request_type IN ('access','correction','deletion')),
  details text CHECK(details IS NULL OR char_length(details) <= 500),
  verification_state text NOT NULL DEFAULT 'pending' CHECK(verification_state IN ('pending','verified','rejected')),
  status text NOT NULL DEFAULT 'new' CHECK(status IN ('new','in_progress','resolved')),
  created_at timestamptz NOT NULL,
  resolved_at timestamptz
);

CREATE TABLE IF NOT EXISTS notification_jobs (
  id uuid PRIMARY KEY,
  inquiry_id uuid UNIQUE REFERENCES inquiries(id) ON DELETE CASCADE,
  privacy_request_id uuid UNIQUE REFERENCES privacy_requests(id) ON DELETE CASCADE,
  status text NOT NULL DEFAULT 'pending' CHECK(status IN ('pending','processing','sent','failed')),
  attempts integer NOT NULL DEFAULT 0 CHECK(attempts >= 0),
  next_attempt_at timestamptz NOT NULL,
  lease_until timestamptz,
  failure_code text,
  created_at timestamptz NOT NULL,
  sent_at timestamptz,
  CHECK((inquiry_id IS NOT NULL) <> (privacy_request_id IS NOT NULL))
);

CREATE TABLE IF NOT EXISTS rate_limits (
  bucket_key text PRIMARY KEY,
  window_started_at timestamptz NOT NULL,
  count integer NOT NULL CHECK(count >= 0),
  updated_at timestamptz NOT NULL
);

CREATE INDEX IF NOT EXISTS notification_due_idx ON notification_jobs(status, next_attempt_at);
CREATE INDEX IF NOT EXISTS inquiry_retention_idx ON inquiries(status, last_meaningful_exchange_at);
CREATE TABLE IF NOT EXISTS schema_migrations (name text PRIMARY KEY, applied_at timestamptz NOT NULL);

-- Private by default. Use a dedicated least-privilege runtime role without BYPASSRLS.
REVOKE ALL ON inquiries, privacy_requests, notification_jobs, rate_limits, schema_migrations FROM PUBLIC;
DO $$ BEGIN
  IF EXISTS (SELECT 1 FROM pg_roles WHERE rolname = 'anon') THEN
    REVOKE ALL ON inquiries, privacy_requests, notification_jobs, rate_limits, schema_migrations FROM anon;
  END IF;
  IF EXISTS (SELECT 1 FROM pg_roles WHERE rolname = 'authenticated') THEN
    REVOKE ALL ON inquiries, privacy_requests, notification_jobs, rate_limits, schema_migrations FROM authenticated;
  END IF;
  IF EXISTS (SELECT 1 FROM pg_roles WHERE rolname = 'portfolio_runtime') THEN
    GRANT USAGE ON SCHEMA public TO portfolio_runtime;
    GRANT SELECT, INSERT, UPDATE, DELETE ON inquiries, privacy_requests, notification_jobs, rate_limits TO portfolio_runtime;
    GRANT SELECT, INSERT ON schema_migrations TO portfolio_runtime;
  END IF;
END $$;

ALTER TABLE inquiries ENABLE ROW LEVEL SECURITY;
ALTER TABLE privacy_requests ENABLE ROW LEVEL SECURITY;
ALTER TABLE notification_jobs ENABLE ROW LEVEL SECURITY;
ALTER TABLE rate_limits ENABLE ROW LEVEL SECURITY;
ALTER TABLE schema_migrations ENABLE ROW LEVEL SECURITY;
DO $$ BEGIN
  IF EXISTS (SELECT 1 FROM pg_roles WHERE rolname = 'portfolio_runtime' AND NOT rolbypassrls) THEN
    CREATE POLICY inquiry_runtime_access ON inquiries TO portfolio_runtime USING (true) WITH CHECK (true);
    CREATE POLICY privacy_runtime_access ON privacy_requests TO portfolio_runtime USING (true) WITH CHECK (true);
    CREATE POLICY notification_runtime_access ON notification_jobs TO portfolio_runtime USING (true) WITH CHECK (true);
    CREATE POLICY rate_runtime_access ON rate_limits TO portfolio_runtime USING (true) WITH CHECK (true);
    CREATE POLICY migrations_runtime_read ON schema_migrations TO portfolio_runtime USING (true);
  END IF;
END $$;
