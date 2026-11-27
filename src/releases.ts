export type Release = { version: string; released: string; title: string; notes: string[] };

/** Patch notes, newest first. The first entry's version must match app.json and package.json. */
export const RELEASES: readonly Release[] = [
  {
    version: '0.2.0',
    released: '2026-11-27 19:00',
    title: 'All of Stage 1',
    notes: [
      'Units 4–12: food and drink, numbers, family, everyday verbs, time and days, places, home, weather and free time, and real-life scenes to put it together. 52 lessons in total.',
      'Full screen: the phone’s top and bottom bars are hidden. Swipe from the edge to show them.',
      'A "type it" question never asks you to type a pattern with a blank in it.',
    ],
  },
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
