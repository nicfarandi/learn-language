import { db } from '../db/client';

export type LessonProgress = {
  lesson_id: string;
  best_score: number;
  last_score: number;
  total: number;
  attempts: number;
  completed_at: string;
};

export type Mistake = { itemId: string; kind: string };

export async function getAllProgress(): Promise<Record<string, LessonProgress>> {
  const rows = await db.getAllAsync<LessonProgress>('SELECT * FROM lesson_progress');
  return Object.fromEntries(rows.map((r) => [r.lesson_id, r]));
}

/** Saves a finished lesson: keeps the best score, replaces the lesson's mistakes with this attempt's. */
export async function saveLessonResult(
  lessonId: string,
  score: number,
  total: number,
  mistakes: Mistake[],
  now: Date = new Date(),
): Promise<void> {
  const at = now.toISOString();
  await db.withTransactionAsync(async () => {
    await db.runAsync(
      `INSERT INTO lesson_progress (lesson_id, best_score, last_score, total, attempts, completed_at)
       VALUES (?, ?, ?, ?, 1, ?)
       ON CONFLICT (lesson_id) DO UPDATE SET
         best_score = MAX(best_score, excluded.best_score),
         last_score = excluded.last_score,
         total = excluded.total,
         attempts = attempts + 1,
         completed_at = excluded.completed_at`,
      lessonId, score, score, total, at,
    );
    await db.runAsync('DELETE FROM mistakes WHERE lesson_id = ?', lessonId);
    for (const m of mistakes) {
      await db.runAsync(
        'INSERT INTO mistakes (lesson_id, item_id, kind, made_at) VALUES (?, ?, ?, ?)',
        lessonId, m.itemId, m.kind, at,
      );
    }
  });
}
