import * as SQLite from 'expo-sqlite';
import { PROGRESS_SCHEMA } from './progressSchema';
import { runMigrations } from './migrations';

export const db = SQLite.openDatabaseSync('learn-language.db');

const CORE_SCHEMA = `
  CREATE TABLE IF NOT EXISTS settings (key TEXT PRIMARY KEY, value TEXT NOT NULL);
`;

/** Columns added after a table first shipped: [table, column, definition]. Added once if missing. */
const ADDED_COLUMNS: [string, string, string][] = [];

let initPromise: Promise<void> | null = null;

export function initDb(): Promise<void> {
  initPromise ??= (async () => {
    await db.execAsync('PRAGMA journal_mode = WAL; PRAGMA foreign_keys = ON;');
    await db.execAsync(CORE_SCHEMA + PROGRESS_SCHEMA);
    for (const [table, column, definition] of ADDED_COLUMNS) {
      const cols = await db.getAllAsync<{ name: string }>(`PRAGMA table_info(${table})`);
      if (!cols.some((c) => c.name === column)) {
        await db.execAsync(`ALTER TABLE ${table} ADD COLUMN ${column} ${definition}`);
      }
    }
    await runMigrations(db);
  })();
  // Let a failed start be retried instead of caching the failure forever.
  initPromise.catch(() => { initPromise = null; });
  return initPromise;
}
