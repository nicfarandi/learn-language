# Proposal: a simple French course app

A small, offline, phone-only app that teaches French from zero to **A2** (confident everyday French),
**step by step, explaining every new thing before practising it**.

- Goal: how good you will be at the end: [GOAL.md](GOAL.md)
- Course plan, unit by unit: [COURSE.md](COURSE.md)
- One unit written out in full, to show what a lesson looks like: [sample-unit-01.md](sample-unit-01.md)

## Decisions

| Question | Answer |
| --- | --- |
| Taught in | English |
| Starting level | Absolute zero |
| Goal | **A2** in about 12–18 months ([GOAL.md](GOAL.md)) |
| Name | "Learn Language" for now |
| Mistakes | No lives or penalty, just a **score** per lesson |
| Daily reminder | Not now |

## 1. Principles

1. **Explain, then practise.** Every lesson opens with short *Learn* cards: the new words (with audio) and at
   most one new rule, in plain English with examples.
2. **One small step at a time.** About 5–7 new words and one idea per lesson. Nothing appears in an exercise
   before it has been taught.
3. **Easy to hard inside each lesson.** Recognise first, then produce: pick → match → listen → build → type.
4. **Every answer teaches.** Right or wrong, the feedback shows the correct French, the English, and a
   one-line *why* when there is a rule behind it.
5. **Old words come back.** A review deck brings learned words back after 1, 3, 7, 14 and 30 days.
6. **Offline and private.** All content ships with the app; progress stays on the phone.

## 2. How a lesson runs

```
Learn cards (2–5)          new words with audio, then the rule with examples
   ↓
Practice (~10 exercises)   easy → hard, only using what has been taught
   ↓                       after each answer: correct / almost / wrong + the why
Result                     score (e.g. 8/10), list of mistakes with explanations, "Retry mistakes"
```

At the end of each unit, a **checkpoint** (15 mixed exercises) unlocks the next unit. All Learn cards seen so
far are kept in a **Notes** screen, so any rule can be looked up again.

## 3. Exercise types

| Type | Example | Skill |
| --- | --- | --- |
| **Pick the meaning** | "le pain" → bread / water / cheese / apple | Recognise |
| **Match pairs** | 5 French ↔ 5 English | Recognise |
| **Listen and pick** | Phone says "bonjour", pick what you heard | Hear |
| **Fill the gap** | "Je ___ français." → suis / es / est | Apply a rule |
| **Build the sentence** | Tap tiles to make "Je m'appelle Léa" | Produce |
| **Type it** | "Thank you" → `merci` | Produce |

- Audio comes from the phone's built-in French voice (`expo-speech`), so no sound files, works offline.
- **Type it** accepts a missing accent or a small typo as *almost right* (counts as correct, shows the exact
  spelling). Capitals and punctuation are ignored.
- Speaking with the microphone is left out for now.

## 4. Content format

One JSON file per unit in `content/fr/`, written by Claude and reviewed by you. Exercises are **generated**
from the lesson's words, sentences and gap-fills, so adding a unit means writing data, not code.

```json
{
  "id": "u01",
  "title": "Hello",
  "lessons": [
    {
      "id": "u01-l1",
      "title": "Greetings",
      "learn": [
        { "kind": "words" },
        { "kind": "note", "title": "Bonjour vs salut",
          "body": "Bonjour is polite and works with anyone. Salut is casual: friends and family only.",
          "examples": [{ "fr": "Bonjour, madame.", "en": "Hello, madam." }] }
      ],
      "words": [{ "fr": "bonjour", "en": "hello / good morning", "tip": "Literally 'good day'." }],
      "sentences": [{ "fr": "Bonjour, madame.", "en": "Hello, madam.", "note": 0 }],
      "gaps": [{ "fr": "___, madame.", "answer": "Bonjour", "options": ["Bonjour", "Salut"], "why": 0 }]
    }
  ]
}
```

`note` / `why` point at the Learn card that explains it, which is what the feedback shows on a wrong answer.

## 5. Data on the phone (SQLite)

| Table | Holds |
| --- | --- |
| `units`, `lessons`, `notes`, `words`, `sentences`, `gaps` | Course content, reloaded from JSON on each update |
| `lesson_progress` | Done, best score, last score, date |
| `mistakes` | Exercises got wrong, for "Retry mistakes" and the review deck |
| `word_reviews` | Per word: box (1–5), next review date, right/wrong counts |
| `settings` | Sound on/off, French voice speed |

## 6. Build plan

Content first: every version adds units, and the app grows only as much as the content needs.

| Version | What you get |
| --- | --- |
| **0.1** | App set up; Unit 0 (sounds) + Unit 1 (hello); Learn cards; pick, match, listen; score |
| **0.2** | Units 2–3; fill the gap, build the sentence, type it; result screen with mistakes and *why* |
| **0.3** | Units 4–6; checkpoints; Notes screen |
| **0.4** | Units 7–9; review deck (spaced repetition) |
| **0.5** | Units 10–12; Stage 1 test — **Foundations done** |
| **0.6–0.7** | Units 13–18; Stage 2 test — **A1 done** |
| **0.8** | Story lessons, dictation, say-it-aloud, normal-speed audio |
| **0.9–1.0** | Units 19–34, a few units per version; A2 test — **A2 done** |

Each version is pushed and builds an APK to install on the phone.
