import { isLessonOpen, nextLesson } from '../src/utils/unlock';

const ids = ['a', 'b', 'c'];

it('opens lessons in order', () => {
  expect(isLessonOpen(ids, 'a', new Set())).toBe(true);
  expect(isLessonOpen(ids, 'b', new Set())).toBe(false);
  expect(isLessonOpen(ids, 'b', new Set(['a']))).toBe(true);
  expect(isLessonOpen(ids, 'zzz', new Set(['a']))).toBe(false);
});

it('continues at the first unfinished lesson', () => {
  expect(nextLesson(ids, new Set(['a']))).toBe('b');
  expect(nextLesson(ids, new Set(ids))).toBeNull();
});
