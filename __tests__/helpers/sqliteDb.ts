// Real SQL in tests, no dependency (Node >= 22.5).
// eslint-disable-next-line @typescript-eslint/no-require-imports
const { DatabaseSync } = require('node:sqlite');
type Param = string | number | null;
const flatten = (p: unknown[]) => (p.length === 1 && Array.isArray(p[0]) ? p[0] : p) as Param[];

export function createTestDb() {
  const mem = new DatabaseSync(':memory:');
  mem.exec('PRAGMA foreign_keys = ON');
  const plain = <T>(row: unknown): T => (row == null ? row : { ...(row as object) }) as T;
  return {
    raw: mem,
    async execAsync(sql: string) { mem.exec(sql); },
    async runAsync(sql: string, ...params: unknown[]) {
      const r = mem.prepare(sql).run(...flatten(params));
      return { lastInsertRowId: Number(r.lastInsertRowid), changes: Number(r.changes) };
    },
    async getAllAsync<T>(sql: string, ...params: unknown[]): Promise<T[]> {
      return mem.prepare(sql).all(...flatten(params)).map((r: unknown) => plain<T>(r));
    },
    async getFirstAsync<T>(sql: string, ...params: unknown[]): Promise<T | null> {
      return plain<T>(mem.prepare(sql).get(...flatten(params)) ?? null);
    },
    async withTransactionAsync(task: () => Promise<void>) {
      mem.exec('BEGIN');
      try { await task(); mem.exec('COMMIT'); } catch (e) { mem.exec('ROLLBACK'); throw e; }
    },
  };
}
