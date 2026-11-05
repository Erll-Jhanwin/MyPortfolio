CREATE TABLE IF NOT EXISTS resume_documents (
  id smallint PRIMARY KEY CHECK(id = 1),
  draft_json jsonb NOT NULL,
  published_json jsonb NOT NULL,
  updated_at timestamptz NOT NULL,
  published_at timestamptz
);

REVOKE ALL ON resume_documents FROM PUBLIC;
DO $$ BEGIN
  IF EXISTS (SELECT 1 FROM pg_roles WHERE rolname = 'anon') THEN REVOKE ALL ON resume_documents FROM anon; END IF;
  IF EXISTS (SELECT 1 FROM pg_roles WHERE rolname = 'authenticated') THEN REVOKE ALL ON resume_documents FROM authenticated; END IF;
  IF EXISTS (SELECT 1 FROM pg_roles WHERE rolname = 'portfolio_runtime') THEN
    GRANT USAGE ON SCHEMA public TO portfolio_runtime;
    GRANT SELECT, INSERT, UPDATE ON resume_documents TO portfolio_runtime;
  END IF;
END $$;

ALTER TABLE resume_documents ENABLE ROW LEVEL SECURITY;
DO $$ BEGIN
  IF EXISTS (SELECT 1 FROM pg_roles WHERE rolname = 'portfolio_runtime' AND NOT rolbypassrls) THEN
    CREATE POLICY resume_documents_runtime_access ON resume_documents TO portfolio_runtime USING (true) WITH CHECK (true);
  END IF;
END $$;
