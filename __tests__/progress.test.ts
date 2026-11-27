import { createTestDb } from './helpers/sqliteDb';
import { PROGRESS_SCHEMA } from '../src/db/progressSchema';

const mockDb = createTestDb();
// A getter, because imports are hoisted above mockDb's definition.
jest.mock('../src/db/client', () => ({ get db() { return mockDb; } }));
// eslint-disable-next-line import/first
import { getAllProgress, saveLessonResult } from '../src/services/progress';

beforeAll(() => mockDb.execAsync(PROGRESS_SCHEMA));

it('keeps the best score and the latest mistakes', async () => {
  await saveLessonResult('u01-l1', 7, 10, [{ itemId: 'w1', kind: 'pick' }, { itemId: 'w2', kind: 'type' }]);
  await saveLessonResult('u01-l1', 5, 10, [{ itemId: 'w3', kind: 'gap' }]);
  const p = (await getAllProgress())['u01-l1'];
  expect(p).toMatchObject({ best_score: 7, last_score: 5, total: 10, attempts: 2 });
  const mistakes = await mockDb.getAllAsync<{ item_id: string }>('SELECT item_id FROM mistakes');
  expect(mistakes.map((m) => m.item_id)).toEqual(['w3']);
});
