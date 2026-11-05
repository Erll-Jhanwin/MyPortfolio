CREATE TABLE IF NOT EXISTS projects (
  id uuid PRIMARY KEY,
  slug text NOT NULL UNIQUE CHECK(char_length(slug) BETWEEN 2 AND 90),
  title text NOT NULL CHECK(char_length(title) BETWEEN 2 AND 120),
  summary text NOT NULL CHECK(char_length(summary) BETWEEN 1 AND 240),
  description text NOT NULL CHECK(char_length(description) BETWEEN 1 AND 8000),
  project_type text NOT NULL CHECK(project_type IN ('academic','personal','team','paid','volunteer')),
  status text NOT NULL CHECK(status IN ('prototype','in-development','complete','archived')),
  role text NOT NULL DEFAULT '',
  context text NOT NULL DEFAULT '',
  constraints_json jsonb NOT NULL DEFAULT '[]'::jsonb,
  solution text NOT NULL DEFAULT '',
  decisions_json jsonb NOT NULL DEFAULT '[]'::jsonb,
  technologies_json jsonb NOT NULL DEFAULT '[]'::jsonb,
  evidence_json jsonb NOT NULL DEFAULT '[]'::jsonb,
  results text NOT NULL DEFAULT '',
  limitations_json jsonb NOT NULL DEFAULT '[]'::jsonb,
  lessons_json jsonb NOT NULL DEFAULT '[]'::jsonb,
  demo_url text,
  github_url text,
  published boolean NOT NULL DEFAULT false,
  created_at timestamptz NOT NULL,
  updated_at timestamptz NOT NULL
);

CREATE TABLE IF NOT EXISTS project_images (
  id uuid PRIMARY KEY,
  project_id uuid NOT NULL REFERENCES projects(id) ON DELETE CASCADE,
  alt_text text NOT NULL CHECK(char_length(alt_text) BETWEEN 5 AND 160),
  width integer NOT NULL CHECK(width BETWEEN 1 AND 1920),
  height integer NOT NULL CHECK(height BETWEEN 1 AND 1920),
  mime_type text NOT NULL CHECK(mime_type = 'image/webp'),
  data bytea NOT NULL CHECK(octet_length(data) BETWEEN 1 AND 2097152),
  created_at timestamptz NOT NULL
);

CREATE INDEX IF NOT EXISTS project_published_updated_idx ON projects(published, updated_at DESC);
CREATE INDEX IF NOT EXISTS project_images_project_idx ON project_images(project_id, created_at);

REVOKE ALL ON projects, project_images FROM PUBLIC;
DO $$ BEGIN
  IF EXISTS (SELECT 1 FROM pg_roles WHERE rolname = 'anon') THEN
    REVOKE ALL ON projects, project_images FROM anon;
  END IF;
  IF EXISTS (SELECT 1 FROM pg_roles WHERE rolname = 'authenticated') THEN
    REVOKE ALL ON projects, project_images FROM authenticated;
  END IF;
  IF EXISTS (SELECT 1 FROM pg_roles WHERE rolname = 'portfolio_runtime') THEN
    GRANT USAGE ON SCHEMA public TO portfolio_runtime;
    GRANT SELECT, INSERT, UPDATE, DELETE ON projects, project_images TO portfolio_runtime;
  END IF;
END $$;

ALTER TABLE projects ENABLE ROW LEVEL SECURITY;
ALTER TABLE project_images ENABLE ROW LEVEL SECURITY;
DO $$ BEGIN
  IF EXISTS (SELECT 1 FROM pg_roles WHERE rolname = 'portfolio_runtime' AND NOT rolbypassrls) THEN
    CREATE POLICY projects_runtime_access ON projects TO portfolio_runtime USING (true) WITH CHECK (true);
    CREATE POLICY project_images_runtime_access ON project_images TO portfolio_runtime USING (true) WITH CHECK (true);
  END IF;
END $$;
