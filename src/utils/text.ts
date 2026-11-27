/** Lower case, no accents, no punctuation, single spaces, one kind of apostrophe. */
export function normalize(text: string): string {
  return text
    .normalize('NFD')
    .replace(/[̀-ͯ]/g, '')
    .toLowerCase()
    .replace(/[’`]/g, "'")
    .replace(/[.,!?;:«»"()—–\-]/g, ' ')
    .replace(/\s+/g, ' ')
    .trim();
}

/** Same as normalize, but keeps accents: used to tell "right" from "almost right". */
export function normalizeKeepAccents(text: string): string {
  return text
    .toLowerCase()
    .replace(/[’`]/g, "'")
    .replace(/[.,!?;:«»"()—–\-]/g, ' ')
    .replace(/\s+/g, ' ')
    .trim();
}

/** Edit distance where swapping two neighbouring letters counts as one typo (optimal string alignment). */
export function editDistance(a: string, b: string): number {
  const d: number[][] = Array.from({ length: a.length + 1 }, (_, i) =>
    Array.from({ length: b.length + 1 }, (_, j) => (i === 0 ? j : j === 0 ? i : 0)));
  for (let i = 1; i <= a.length; i++) {
    for (let j = 1; j <= b.length; j++) {
      const cost = a[i - 1] === b[j - 1] ? 0 : 1;
      d[i][j] = Math.min(d[i - 1][j] + 1, d[i][j - 1] + 1, d[i - 1][j - 1] + cost);
      if (i > 1 && j > 1 && a[i - 1] === b[j - 2] && a[i - 2] === b[j - 1]) {
        d[i][j] = Math.min(d[i][j], d[i - 2][j - 2] + 1);
      }
    }
  }
  return d[a.length][b.length];
}

/**
 * The accepted spellings of a word-list entry: "enchanté(e)" → enchanté, enchantée;
 * "et toi ?" → et toi; "hi / bye" → hi, bye.
 */
export function acceptedForms(entry: string): string[] {
  const forms = new Set<string>();
  for (const part of entry.split('/')) {
    const p = part.trim();
    if (!p) continue;
    const m = p.match(/^(.*?)\(([^)]+)\)(.*)$/);
    if (m) {
      forms.add((m[1] + m[3]).trim());
      forms.add((m[1] + m[2] + m[3]).trim());
    } else {
      forms.add(p);
    }
  }
  return [...forms];
}

export type Verdict = 'right' | 'almost' | 'wrong';

/** True when two words differ only by a gender or plural ending (-e, -s, -es): a real mistake, not a typo. */
function endingOnly(a: string, b: string): boolean {
  const [short, long] = a.length <= b.length ? [a, b] : [b, a];
  return long.startsWith(short) && ['e', 's', 'es'].includes(long.slice(short.length));
}

/** A typed word that is close enough to count as a typo: long words only, one slip, not a grammar ending. */
function isTypo(typed: string, expected: string): boolean {
  return typed.length >= 5 && expected.length >= 5 && editDistance(typed, expected) <= 1 && !endingOnly(typed, expected);
}

/**
 * Checks a typed answer. Capitals and punctuation never matter. A missing or wrong accent, or one small
 * typo in one longer word, is "almost": counted as right, but the exact spelling is shown. Articles and
 * short words must be exact, and a wrong gender or plural ending is always wrong: those are what the
 * course teaches.
 */
export function checkTyped(typed: string, accepted: string[]): Verdict {
  const t = normalizeKeepAccents(typed);
  if (!t) return 'wrong';
  if (accepted.some((a) => normalizeKeepAccents(a) === t)) return 'right';
  const tWords = normalize(typed).split(' ');
  for (const a of accepted) {
    const aWords = normalize(a).split(' ');
    if (aWords.length !== tWords.length) continue;
    let typos = 0;
    let ok = true;
    for (let i = 0; i < aWords.length && ok; i++) {
      if (aWords[i] === tWords[i]) continue;
      if (isTypo(tWords[i], aWords[i])) typos++;
      else ok = false;
    }
    if (ok && typos <= 1) return 'almost';
  }
  return 'wrong';
}

/** Word tiles for "build the sentence": split on spaces, drop punctuation-only pieces and edge punctuation. */
export function sentenceTiles(sentence: string): string[] {
  return sentence
    .split(/\s+/)
    .map((w) => w.replace(/^[«"(—–-]+|[.,!?;:»")]+$/g, ''))
    .filter((w) => /[\p{L}\d]/u.test(w));
}
