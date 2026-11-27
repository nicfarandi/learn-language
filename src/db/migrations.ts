type Db = {
  getFirstAsync<T>(sql: string, ...params: (string | number)[]): Promise<T | null>;
  runAsync(sql: string, ...params: (string | number)[]): Promise<unknown>;
};

/** One-off data moves, each guarded by a flag row in `settings` so it runs once. None yet. */
const MIGRATIONS: { flag: string; run: (db: Db) => Promise<void> }[] = [];

export async function runMigrations(db: Db): Promise<void> {
  for (const m of MIGRATIONS) {
    const done = await db.getFirstAsync<{ value: string }>('SELECT value FROM settings WHERE key = ?', m.flag);
    if (done) continue;
    await m.run(db);
    await db.runAsync('INSERT INTO settings (key, value) VALUES (?, ?)', m.flag, '1');
  }
}
