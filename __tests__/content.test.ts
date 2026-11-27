import fs from 'fs';
import path from 'path';
import { UNITS } from '../content/fr';
import type { Unit } from '../src/content/types';

const dir = path.join(__dirname, '..', 'content', 'fr');
const files = fs.readdirSync(dir).filter((f) => /^u\d\d\.json$/.test(f)).sort();

const nonEmpty = (s: unknown) => typeof s === 'string' && s.trim().length > 0;

it('every unit file is registered, in order', () => {
  expect(UNITS.map((u) => `${u.id}.json`)).toEqual(files);
  UNITS.forEach((u, i) => expect(u.number).toBe(i));
});

it('ids are unique across the whole course', () => {
  const ids: string[] = [];
  for (const u of UNITS) {
    ids.push(u.id);
    for (const l of u.lessons) {
      ids.push(l.id);
      for (const k of ['notes', 'words', 'sentences', 'gaps'] as const) ids.push(...l[k].map((x) => x.id));
    }
  }
  expect(ids.filter((id, i) => ids.indexOf(id) !== i)).toEqual([]);
});

describe.each(UNITS.map((u) => [u.id, u] as [string, Unit]))('%s', (_, unit) => {
  it('has a title, summary, I-can statements and lessons', () => {
    expect(unit.id).toMatch(/^u\d\d$/);
    expect(nonEmpty(unit.title) && nonEmpty(unit.summary)).toBe(true);
    expect(unit.canDo.length).toBeGreaterThanOrEqual(3);
    expect(unit.lessons.length).toBe(4);
  });

  it.each(unit.lessons.map((l) => [l.id, l]))('lesson %s is well formed', (_id, lesson) => {
    expect(lesson.id).toMatch(new RegExp(`^${unit.id}-l\\d$`));
    expect(nonEmpty(lesson.title) && nonEmpty(lesson.goal)).toBe(true);
    const prefix = `${lesson.id}-`;
    const all = [...lesson.notes, ...lesson.words, ...lesson.sentences, ...lesson.gaps];
    for (const x of all) expect(x.id.startsWith(prefix)).toBe(true);

    expect(lesson.notes.length).toBeGreaterThanOrEqual(1);
    for (const n of lesson.notes) {
      expect(nonEmpty(n.title) && nonEmpty(n.body)).toBe(true);
      expect(n.examples.length).toBeGreaterThanOrEqual(2);
      for (const e of n.examples) expect(nonEmpty(e.fr) && nonEmpty(e.en)).toBe(true);
    }

    expect(lesson.words.length).toBeGreaterThanOrEqual(5);
    for (const w of lesson.words) expect(nonEmpty(w.fr) && nonEmpty(w.en)).toBe(true);
    expect(new Set(lesson.words.map((w) => w.fr)).size).toBe(lesson.words.length);
    expect(new Set(lesson.words.map((w) => w.en)).size).toBe(lesson.words.length);

    const noteIds = new Set(lesson.notes.map((n) => n.id));
    for (const s of lesson.sentences) {
      expect(nonEmpty(s.fr) && nonEmpty(s.en)).toBe(true);
      if (s.note) expect(noteIds).toContain(s.note);
      expect(s.fr).not.toMatch(/ [,.]/);
    }
    for (const g of lesson.gaps) {
      expect(g.prompt.split('___').length).toBe(2);
      expect(g.prompt).not.toMatch(/ [,.]/);
      expect(g.prompt).not.toMatch(/\p{L}___|___\p{L}/u);
      expect(g.options).toContain(g.answer);
      expect(new Set(g.options).size).toBe(g.options.length);
      expect(g.options.length).toBeGreaterThanOrEqual(2);
      expect(g.options.length).toBeLessThanOrEqual(4);
      expect(noteIds).toContain(g.why);
    }
  });
});
