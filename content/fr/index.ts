import type { Lesson, Unit } from '../../src/content/types';
import u00 from './u00.json';
import u01 from './u01.json';
import u02 from './u02.json';
import u03 from './u03.json';
import u04 from './u04.json';
import u05 from './u05.json';
import u06 from './u06.json';
import u07 from './u07.json';
import u08 from './u08.json';
import u09 from './u09.json';
import u10 from './u10.json';
import u11 from './u11.json';
import u12 from './u12.json';

/** Every unit in course order. Add a new unit's JSON here once it has passed the content tests. */
export const UNITS: readonly Unit[] = [u00, u01, u02, u03, u04, u05, u06, u07, u08, u09, u10, u11, u12] as Unit[];

export type LessonRef = { unit: Unit; lesson: Lesson; index: number };

/** All lessons in course order, with their unit. */
export const LESSONS: readonly LessonRef[] = UNITS.flatMap((unit) => unit.lessons.map((lesson) => ({ unit, lesson })))
  .map((ref, index) => ({ ...ref, index }));

export function findLesson(id: string): LessonRef | undefined {
  return LESSONS.find((l) => l.lesson.id === id);
}
