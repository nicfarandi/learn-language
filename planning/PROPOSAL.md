# Proposal: a simple French course app

A small, phone-only app that teaches French from zero to **acing the DELF A2 exam (90+/100, every time)**,
**step by step, explaining every new thing before practising it**.

- Goal: how good you will be at the end: [GOAL.md](GOAL.md)
- Course plan, unit by unit: [COURSE.md](COURSE.md)
- One unit written out in full, to show what a lesson looks like: [sample-unit-01.md](sample-unit-01.md)

## Decisions

| Question | Answer |
| --- | --- |
| Taught in | English |
| Starting level | Absolute zero |
| Goal | **90+/100 on the DELF A2, every time**, 22+/25 in every part; ~16–18 months at 30 min/day ([GOAL.md](GOAL.md)) |
| Writing and speaking marking | AI marking against the A2 grid (to confirm) |
| Name | "Learn Language" for now |
| Mistakes | No lives or penalty, just a **score** per lesson |
| Daily reminder | Not now |
| Audio | Pre-recorded natural AI voices for everything French, bundled with the app (see §5) |
| Content writing | Haiku sub-agents write the units, checked before shipping (see §6) |
| Learned so far | A **Library** screen with everything learned (see §4) |

## 1. Principles

1. **Explain, then practise.** Every lesson opens with short *Learn* cards: the new words (with audio) and at
   most one new rule, in plain English with examples.
2. **One small step at a time.** About 5–7 new words and one idea per lesson. Nothing appears in an exercise
   before it has been taught.
3. **Easy to hard inside each lesson.** Recognise first, then produce: pick → match → listen → build → type.
4. **Every answer teaches.** Right or wrong, the feedback shows the correct French, the English, and a
   one-line *why* when there is a rule behind it.
5. **Old words come back.** A review deck brings learned words back after 1, 3, 7, 14 and 30 days.
6. **Mastery, not just progress.** A checkpoint needs 90 % to unlock the next unit; grammar rules come back
   for review, not only words.
7. **Offline and private.** All content ships with the app; progress stays on the phone. Only writing and
   speaking marking goes online.

## 2. How a lesson runs

```
Learn cards (2–5)          new words with audio, then the rule with examples
   ↓
Practice (~10 exercises)   easy → hard, only using what has been taught
   ↓                       after each answer: correct / almost / wrong + the why
Result                     score (e.g. 8/10), list of mistakes with explanations, "Retry mistakes"
```

At the end of each unit, a **checkpoint** (15 mixed exercises) unlocks the next unit. All Learn cards seen so
far are kept in the **Library**, so any rule can be looked up again.

## 3. Exercise types

| Type | Example | Skill |
| --- | --- | --- |
| **Pick the meaning** | "le pain" → bread / water / cheese / apple | Recognise |
| **Match pairs** | 5 French ↔ 5 English | Recognise |
| **Listen and pick** | Phone says "bonjour", pick what you heard | Hear |
| **Fill the gap** | "Je ___ français." → suis / es / est | Apply a rule |
| **Build the sentence** | Tap tiles to make "Je m'appelle Léa" | Produce |
| **Type it** | "Thank you" → `merci` | Produce |
| **Dictation** | Hear a sentence, type it | Hear + spell |
| **Read a document** | An email or ad, then questions | Read (exam style) |
| **Write a text** | 60–80 words: "Tell a friend about your weekend" → marked with corrections | Write (exam style) |
| **Speak** | Record a 1–2 min answer → transcribed, marked, model answer | Speak (exam style) |

- Audio is pre-recorded (see §5), so it works offline.
- **Type it** accepts a missing accent or a small typo as *almost right* (counts as correct, shows the exact
  spelling). Capitals and punctuation are ignored.
- *Write a text* and *Speak* are marked online by AI against the official A2 grid (see GOAL.md).

## 4. Library: everything you've learned

A screen that grows as you go, with everything you've met so far in one place, searchable and tappable for
audio.

| Tab | Shows |
| --- | --- |
| **Words** | Every word and phrase learned, French ↔ English, with audio, the unit it came from and how well you know it (5 levels from the review deck). Filter by unit, topic or "weak words"; tap one to practise it |
| **Grammar** | Every rule card, grouped by topic (verbs, articles, past tense…), with the verb tables met so far |
| **Phrases** | Ready-to-use sentences by situation: café, shop, station, doctor, meeting someone |
| **Stories** | Every story and dialogue finished, to read and listen again |
| **My writing** | Your marked texts and recordings, with scores and corrections, to see your progress over time |
| **I can…** | The can-do statements ticked so far, per unit |

The top of the Library shows totals: words learned, rules learned, stories read, and the latest practice-exam
score per part.

## 5. Audio

All French in the app is **pre-recorded**: generated once with natural-sounding AI voices when a unit is
written, saved as small audio files and bundled with the app. Nothing is spoken live, so it works offline.

- **Words and lesson sentences:** one clear voice, slow and normal speed.
- **Stories, dialogues and exam listening:** several voices (men, women, different ages), normal speed.
- **Size:** about 50–100 MB for the full course, downloaded one stage at a time if the app gets too big.
- **Needs:** an account with a voice service (chosen when we get there) and its key, used only when making
  content, never on the phone.
- **Extra practice in Stage 3:** links out to free slow-French news and shows for learners, made by real native
  speakers.

## 6. How the content is made

- **Haiku sub-agents write it.** One agent per unit, using the project's `content-writer` agent (Haiku
  model). It gets the unit's row in COURSE.md, the sample unit and the writing rules, and writes
  `content/fr/uNN.json`.
- **Checked before it ships:**
  1. Automatic tests: valid format; every exercise only uses words already taught; every `why` points at a
     real rule; no duplicate ids.
  2. A review pass by the main session for French accuracy: spelling, accents, gender, agreement, natural
     phrasing.
  3. You skim the unit before it goes into a release.
- **Then audio** is generated for every French line in the unit.

## 7. Content format

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

## 8. Data on the phone (SQLite)

Course content is read straight from the bundled JSON; the database holds only your progress.

| Table | Holds |
| --- | --- |
| `lesson_progress` | Done, best score, last score, date |
| `mistakes` | Exercises got wrong, for "Retry mistakes" and the review deck |
| `word_reviews` | Per word: box (1–5), next review date, right/wrong counts |
| `can_do` | "I can…" statements ticked |
| `writings` | Marked texts and recordings: task, answer, score per criterion, corrections |
| `settings` | Sound on/off, audio speed |

## 9. Build plan

Content first: every version adds units, and the app grows only as much as the content needs.

| Version | What you get |
| --- | --- |
| **0.1** | App set up; content pipeline (Haiku writer, checks, audio); Unit 0 (sounds) + Unit 1 (hello); Learn cards; pick, match, listen; score |
| **0.2** | Units 2–3; fill the gap, build the sentence, type it; result screen with mistakes and *why* |
| **0.3** | Units 4–6; checkpoints; **Library** (words, grammar, phrases, I can…) |
| **0.4** | Units 7–9; review deck (spaced repetition) |
| **0.5** | Units 10–12; Stage 1 test — **Foundations done** |
| **0.6–0.7** | Units 13–18; Stage 2 test — **A1 done** |
| **0.8** | Story lessons, documents, dictation, multi-voice audio, writing tasks with AI marking; Library adds Stories and My writing |
| **0.9** | Speaking tasks with recording, transcription and AI marking; grammar review |
| **0.10–0.20** | Units 19–34, a few units per version |
| **1.0** | Unit 35: exam prep and 10 practice exams — **exam-ready** |

Each version is pushed and builds an APK to install on the phone.
