export type Release = { version: string; released: string; title: string; notes: string[] };

/** Patch notes, newest first. The first entry's version must match app.json and package.json. */
export const RELEASES: readonly Release[] = [
  {
    version: '0.1.0',
    released: '2026-11-27 16:00',
    title: 'First build',
    notes: [
      'Units 0–3: the sounds of French, hello, who I am (être), things and articles.',
      'Each lesson starts with Learn cards: new words with audio and the rule explained.',
      'Exercises: pick the meaning, match pairs, listen and pick, fill the gap, build the sentence, type it.',
      'Every answer explains why, and each lesson ends with your score and your mistakes.',
      'Progress is saved on the phone. Lessons unlock in order.',
      'Audio uses the phone’s French voice for now; recorded voices come later.',
    ],
  },
];

export const CURRENT_RELEASE = RELEASES[0];
