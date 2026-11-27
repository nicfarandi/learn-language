import type { Lesson, Word } from '../content/types';
import { acceptedForms, normalize, sentenceTiles } from './text';
import { sample, seededRandom, shuffle } from './random';

/** What the feedback panel shows after an answer. */
export type Explain = { fr: string; en: string; tip?: string; noteId?: string };

export type Exercise =
  | { kind: 'pick'; id: string; itemId: string; direction: 'fr-en' | 'en-fr'; prompt: string; options: string[]; answer: string; explain: Explain }
  | { kind: 'listen'; id: string; itemId: string; audio: string; options: string[]; answer: string; explain: Explain }
  | { kind: 'match'; id: string; pairs: { itemId: string; fr: string; en: string }[] }
  | { kind: 'gap'; id: string; itemId: string; prompt: string; hint: string; options: string[]; answer: string; explain: Explain }
  | { kind: 'build'; id: string; itemId: string; en: string; tiles: string[]; answer: string; explain: Explain }
  | { kind: 'type'; id: string; itemId: string; en: string; accepted: string[]; explain: Explain };

export const TARGET_EXERCISES = 10;

const wordExplain = (w: Word): Explain => ({ fr: w.fr, en: w.en, tip: w.tip });

/**
 * Entries like "il / elle parle" or "j'ai … ans" are word-list patterns, not one thing to hear or type: they
 * are fine to read in pick and match, but never used for listen or type questions.
 */
export const isPattern = (w: Word) => /[/…]/.test(w.fr);

/**
 * `count` wrong options for `target`, preferring the lesson's own words, then earlier ones. A word that shares
 * the target's French or English (the same word taught again with a different gloss) is never offered, so
 * there is only one right answer.
 */
function distractors(target: Word, field: 'fr' | 'en', own: readonly Word[], earlier: readonly Word[], count: number, rand: () => number): string[] {
  const same = (w: Word) => normalize(w.fr) === normalize(target.fr) || normalize(w.en) === normalize(target.en);
  const seen = new Set([normalize(target[field])]);
  const out: string[] = [];
  for (const pool of [shuffle(own, rand), shuffle(earlier, rand)]) {
    for (const w of pool) {
      if (out.length >= count) return out;
      const key = normalize(w[field]);
      if (same(w) || seen.has(key)) continue;
      seen.add(key);
      out.push(w[field]);
    }
  }
  return out;
}

/**
 * Builds a lesson's practice, easy to hard: recognise (pick, listen, match), then apply (gap), then produce
 * (build, type). `earlierWords` are words taught before this lesson, used only as wrong options.
 */
export function buildExercises(lesson: Lesson, earlierWords: readonly Word[], seed: number): Exercise[] {
  const rand = seededRandom(seed);
  const words = shuffle(lesson.words, rand);
  let n = 0;
  const id = () => `${lesson.id}-x${++n}`;
  const at = (i: number) => words[i % words.length];

  const pick = (w: Word, direction: 'fr-en' | 'en-fr'): Exercise => {
    const answer = direction === 'fr-en' ? w.en : w.fr;
    const wrong = distractors(w, direction === 'fr-en' ? 'en' : 'fr', lesson.words, earlierWords, 3, rand);
    return {
      kind: 'pick', id: id(), itemId: w.id, direction, answer,
      prompt: direction === 'fr-en' ? w.fr : w.en,
      options: shuffle([answer, ...wrong], rand),
      explain: wordExplain(w),
    };
  };
  const plainOwn = lesson.words.filter((w) => !isPattern(w));
  const plainEarlier = earlierWords.filter((w) => !isPattern(w));
  const plain = words.filter((w) => !isPattern(w));
  const listenWord = (i: number) => (plain.length ? plain[i % plain.length] : at(i));
  const listen = (w: Word): Exercise => ({
    kind: 'listen', id: id(), itemId: w.id, audio: w.fr, answer: w.fr,
    options: shuffle([w.fr, ...distractors(w, 'fr', plainOwn, plainEarlier, 2, rand)], rand),
    explain: wordExplain(w),
  });

  const recognise: Exercise[] = [];
  const apply: Exercise[] = [];
  const produce: Exercise[] = [];

  if (words.length === 0) return [];
  recognise.push(pick(at(0), 'fr-en'), listen(listenWord(1)), pick(at(2), 'fr-en'), listen(listenWord(3)));
  if (words.length >= 4) {
    recognise.push({
      kind: 'match', id: id(),
      pairs: sample(lesson.words, 5, rand).map((w) => ({ itemId: w.id, fr: w.fr, en: w.en })),
    });
  }
  recognise.push(pick(at(4), 'en-fr'));

  for (const g of sample(lesson.gaps, 2, rand)) {
    apply.push({
      kind: 'gap', id: id(), itemId: g.id, prompt: g.prompt, hint: g.en, answer: g.answer,
      options: shuffle(g.options, rand),
      explain: { fr: g.prompt.replace('___', g.answer), en: g.en, noteId: g.why },
    });
  }

  const buildable = lesson.sentences.filter((s) => {
    const t = sentenceTiles(s.fr).length;
    return t >= 2 && t <= 8;
  });
  for (const s of sample(buildable, 2, rand)) {
    produce.push({
      kind: 'build', id: id(), itemId: s.id, en: s.en, answer: s.fr,
      tiles: shuffle(sentenceTiles(s.fr), rand),
      explain: { fr: s.fr, en: s.en, noteId: s.note },
    });
  }
  // Never ask to type a pattern ("j'ai … ans", "il / elle parle"); a lesson made only of patterns gets no type question.
  const typeable = plain.find((w) => w.fr.length <= 20) ?? plain[0];
  if (typeable) {
    produce.push({ kind: 'type', id: id(), itemId: typeable.id, en: typeable.en, accepted: acceptedForms(typeable.fr), explain: wordExplain(typeable) });
  }

  // Lessons without gaps or sentences (the sounds unit): top up with more recognition.
  let k = 5;
  while (recognise.length + apply.length + produce.length < TARGET_EXERCISES) {
    recognise.push(k % 2 ? listen(listenWord(k)) : pick(at(k), 'fr-en'));
    k++;
  }
  return [...recognise, ...apply, ...produce];
}
