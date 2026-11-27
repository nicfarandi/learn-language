/** A lesson is open when it is the first one, or the lesson before it has been finished. */
export function isLessonOpen(orderedIds: readonly string[], lessonId: string, finished: ReadonlySet<string>): boolean {
  const i = orderedIds.indexOf(lessonId);
  if (i < 0) return false;
  return i === 0 || finished.has(orderedIds[i - 1]);
}

/** The first open lesson not yet finished: where "Continue" goes. Null when everything is done. */
export function nextLesson(orderedIds: readonly string[], finished: ReadonlySet<string>): string | null {
  return orderedIds.find((id) => !finished.has(id)) ?? null;
}
