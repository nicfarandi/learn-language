/**
 * Shape of a course unit file: content/fr/uNN.json.
 * Written by the content-writer agent, checked by __tests__/content.test.ts.
 *
 * Ids: unit "u01", lesson "u01-l1", and inside a lesson short ids unique across the whole course,
 * prefixed with the lesson id: word "u01-l1-w1", note "u01-l1-n1", sentence "u01-l1-s1", gap "u01-l1-g1".
 */

export type Example = { fr: string; en: string };

/** A rule card shown in the Learn phase, and the "why" shown on a wrong answer. */
export type Note = {
  id: string;
  title: string;
  /** Plain English, 2–5 short sentences. May use **bold** and *italic*. */
  body: string;
  /** 2–3 examples. */
  examples: Example[];
  /** Optional deeper detail (exceptions, full tables), shown collapsed. */
  more?: string;
};

export type Word = {
  id: string;
  /** French, with article for nouns ("le pain"), feminine as "content(e)" only when both forms are taught. */
  fr: string;
  en: string;
  /** Short pronunciation or usage tip. */
  tip?: string;
};

export type Sentence = {
  id: string;
  fr: string;
  en: string;
  /** Id of the Note that explains it, if any. */
  note?: string;
};

/** Fill-the-gap: `prompt` contains exactly one "___". */
export type Gap = {
  id: string;
  prompt: string;
  /** English meaning of the full sentence, or a context hint ("It's 9 pm."). */
  en: string;
  answer: string;
  /** 2–4 options, including the answer. */
  options: string[];
  /** Id of the Note that explains the answer. */
  why: string;
};

export type Lesson = {
  id: string;
  title: string;
  /** One line: what you can do after this lesson. */
  goal: string;
  notes: Note[];
  words: Word[];
  sentences: Sentence[];
  gaps: Gap[];
};

export type Unit = {
  id: string;
  number: number;
  title: string;
  /** One or two sentences shown on the unit card. */
  summary: string;
  /** 3–4 "I can…" statements. */
  canDo: string[];
  lessons: Lesson[];
};
