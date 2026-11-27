# Proposal: a simple French learning app

A small, offline, phone-only app for learning French from zero, in short daily lessons. It works like the
popular bite-size language apps, cut down to the parts that actually teach.

## 1. Goals

- **One language:** French, for an English speaker, starting at absolute beginner (roughly CEFR A1).
- **5 minutes a day:** a lesson is about 10 quick exercises.
- **Offline:** all lessons ship inside the app, and progress stays on the phone. No accounts, no server.
- **Simple:** no leagues, gems, shop, hearts, ads or social features.

## 2. How it works

```
Home (path of units)
 └─ Unit  e.g. "Greetings"
     └─ Lesson 1..4   (~10 exercises each)
          └─ Result screen: XP earned, mistakes to review
Review   (words due today, from all finished lessons)
Stats    (streak, XP, words learned)
```

- Units unlock in order. Finishing all lessons in a unit unlocks the next one.
- Each word you meet joins your **review deck**. The app brings it back after 1, 3, 7, 14 and 30 days, and a
  wrong answer sends it back to day 1 (a simple Leitner box system).
- A **streak** counts the days in a row you did at least one lesson or review.

## 3. Exercise types (MVP)

| Type | Example |
| --- | --- |
| **Pick the meaning** | "le pain" → bread / water / cheese / apple |
| **Build the sentence** | Tap word tiles to make "Je mange une pomme" from "I eat an apple" |
| **Match pairs** | Five French words ↔ five English words |
| **Listen and pick** | Phone speaks "bonjour", you pick what you heard |
| **Type it** | "Thank you" → type `merci` (accents optional, "almost right" accepted) |

Audio uses the phone's built-in French voice (`expo-speech`), so there are no sound files and it works offline.
Speaking practice with the microphone is left out of the MVP.

## 4. Content

- Lessons are JSON files in `content/fr/` (one per unit), bundled with the app and loaded into SQLite on first
  launch and on each update.
- Claude writes the curriculum and you review it. Starter path, 10 units:
  1. Greetings & basics 2. Me & you (être, pronouns) 3. Food & drink 4. Numbers 1–20 5. Family
  6. Around the house 7. Time & days 8. Verbs in -er (present) 9. Places & directions 10. Avoir & describing
- Each exercise is generated from a unit's **word list + example sentences**, so writing a unit means writing
  data, not code.

```json
{
  "id": "u01-greetings",
  "title": "Greetings",
  "words": [{ "fr": "bonjour", "en": "hello", "gender": null }],
  "sentences": [{ "fr": "Bonjour, je m'appelle Léa.", "en": "Hello, my name is Léa." }]
}
```

## 5. Data (SQLite, on the phone)

| Table | Holds |
| --- | --- |
| `units`, `lessons`, `words`, `sentences` | Course content, reloaded from JSON |
| `lesson_progress` | Lesson done, best score, date |
| `word_reviews` | Per word: box (1–5), next review date, times right/wrong |
| `activity` | One row per day: XP, lessons, reviews (drives the streak and stats) |
| `settings` | Daily goal, reminder time, sound on/off |

## 6. Build plan

| Version | What you get |
| --- | --- |
| **0.1** | Setup from `CLAUDE.md`, units 1–3, pick-the-meaning + build-the-sentence + match pairs, progress saved |
| **0.2** | Listen-and-pick and type-it, result screen with mistakes, XP and streak |
| **0.3** | Review deck (spaced repetition), stats screen |
| **0.4** | Units 4–10, daily reminder notification, dark mode polish |

Each version is pushed and builds an APK you install on the phone.

## 7. Decisions for you

1. **Base language:** English, or Bahasa Indonesia?
2. **Level:** start from absolute zero?
3. **Name:** keep "Learn Language", or something else?
4. **Mistakes:** use hearts/lives, or no penalty (proposed: no penalty)?
5. **Daily reminder:** yes or no, and at what time?
