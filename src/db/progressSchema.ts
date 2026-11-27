export const PROGRESS_SCHEMA = `
  CREATE TABLE IF NOT EXISTS lesson_progress (
    lesson_id TEXT PRIMARY KEY,
    best_score INTEGER NOT NULL,
    last_score INTEGER NOT NULL,
    total INTEGER NOT NULL,
    attempts INTEGER NOT NULL DEFAULT 1,
    completed_at TEXT NOT NULL
  );
  CREATE TABLE IF NOT EXISTS mistakes (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    lesson_id TEXT NOT NULL,
    item_id TEXT NOT NULL,
    kind TEXT NOT NULL,
    made_at TEXT NOT NULL
  );
  CREATE INDEX IF NOT EXISTS mistakes_lesson ON mistakes (lesson_id);
`;
export const PROGRESS_TABLES: readonly string[] = ['lesson_progress', 'mistakes'];
