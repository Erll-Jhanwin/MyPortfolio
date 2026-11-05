CREATE TABLE IF NOT EXISTS projects (
  id TEXT PRIMARY KEY,
  slug TEXT NOT NULL UNIQUE CHECK(length(slug) BETWEEN 2 AND 90),
  title TEXT NOT NULL CHECK(length(title) BETWEEN 2 AND 120),
  summary TEXT NOT NULL CHECK(length(summary) BETWEEN 1 AND 240),
  description TEXT NOT NULL CHECK(length(description) BETWEEN 1 AND 8000),
  project_type TEXT NOT NULL CHECK(project_type IN ('academic','personal','team','paid','volunteer')),
  status TEXT NOT NULL CHECK(status IN ('prototype','in-development','complete','archived')),
  role TEXT NOT NULL DEFAULT '',
  context TEXT NOT NULL DEFAULT '',
  constraints_json TEXT NOT NULL DEFAULT '[]',
  solution TEXT NOT NULL DEFAULT '',
  decisions_json TEXT NOT NULL DEFAULT '[]',
  technologies_json TEXT NOT NULL DEFAULT '[]',
  evidence_json TEXT NOT NULL DEFAULT '[]',
  results TEXT NOT NULL DEFAULT '',
  limitations_json TEXT NOT NULL DEFAULT '[]',
  lessons_json TEXT NOT NULL DEFAULT '[]',
  demo_url TEXT,
  github_url TEXT,
  published INTEGER NOT NULL DEFAULT 0 CHECK(published IN (0,1)),
  created_at TEXT NOT NULL,
  updated_at TEXT NOT NULL
);

CREATE TABLE IF NOT EXISTS project_images (
  id TEXT PRIMARY KEY,
  project_id TEXT NOT NULL REFERENCES projects(id) ON DELETE CASCADE,
  alt_text TEXT NOT NULL CHECK(length(alt_text) BETWEEN 5 AND 160),
  width INTEGER NOT NULL CHECK(width BETWEEN 1 AND 1920),
  height INTEGER NOT NULL CHECK(height BETWEEN 1 AND 1920),
  mime_type TEXT NOT NULL CHECK(mime_type = 'image/webp'),
  data BLOB NOT NULL CHECK(length(data) BETWEEN 1 AND 2097152),
  created_at TEXT NOT NULL
);

CREATE INDEX IF NOT EXISTS project_published_updated_idx ON projects(published, updated_at DESC);
CREATE INDEX IF NOT EXISTS project_images_project_idx ON project_images(project_id, created_at);
