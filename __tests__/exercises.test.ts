import { LESSONS } from '../content/fr';
import { buildExercises, TARGET_EXERCISES } from '../src/utils/exercises';
import { normalize } from '../src/utils/text';

describe.each(LESSONS.map((l) => [l.lesson.id, l] as const))('%s', (_, { lesson, index }) => {
  const earlier = LESSONS.slice(0, index).flatMap((l) => l.lesson.words);
  const exercises = buildExercises(lesson, earlier, 42);

  it('has about ten exercises, each with a right answer among its options', () => {
    expect(exercises.length).toBeGreaterThanOrEqual(TARGET_EXERCISES);
    expect(exercises.length).toBeLessThanOrEqual(TARGET_EXERCISES + 2);
    for (const x of exercises) {
      if (x.kind === 'pick' || x.kind === 'listen' || x.kind === 'gap') {
        expect(x.options).toContain(x.answer);
        expect(new Set(x.options).size).toBe(x.options.length);
        expect(x.options.length).toBeGreaterThanOrEqual(2);
      }
      if (x.kind === 'build') {
        expect(normalize(x.tiles.join(' ')).split(' ').sort()).toEqual(normalize(x.answer).split(' ').sort());
      }
      if (x.kind === 'match') expect(x.pairs.length).toBeGreaterThanOrEqual(4);
      if (x.kind === 'type') expect(x.accepted.length).toBeGreaterThanOrEqual(1);
    }
  });

  it('goes from recognising to producing', () => {
    const rank = { pick: 0, listen: 0, match: 0, gap: 1, build: 2, type: 2 };
    const ranks = exercises.map((x) => rank[x.kind]);
    expect(ranks).toEqual([...ranks].sort((a, b) => a - b));
  });

  it('builds the same practice from the same seed', () => {
    expect(buildExercises(lesson, earlier, 42)).toEqual(exercises);
  });
});

it('never offers a second right answer, even when a word is taught again with another gloss', () => {
  const all = LESSONS.flatMap((l) => l.lesson.words);
  for (const { lesson, index } of LESSONS) {
    const earlier = LESSONS.slice(0, index).flatMap((l) => l.lesson.words);
    for (let seed = 1; seed <= 20; seed++) {
      for (const x of buildExercises(lesson, earlier, seed)) {
        if (x.kind !== 'pick' && x.kind !== 'listen') continue;
        const target = all.find((w) => w.id === x.itemId)!;
        for (const o of x.options) {
          if (o === x.answer) continue;
          const sameWord = all.filter((w) => normalize(w.fr) === normalize(target.fr) || normalize(w.en) === normalize(target.en));
          expect(sameWord.map((w) => normalize(x.kind === 'pick' && x.direction === 'fr-en' ? w.en : w.fr))).not.toContain(normalize(o));
        }
      }
    }
  }
});
