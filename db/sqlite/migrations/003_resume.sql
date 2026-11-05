CREATE TABLE IF NOT EXISTS resume_documents (
  id INTEGER PRIMARY KEY CHECK(id = 1),
  draft_json TEXT NOT NULL,
  published_json TEXT NOT NULL,
  updated_at TEXT NOT NULL,
  published_at TEXT
);
