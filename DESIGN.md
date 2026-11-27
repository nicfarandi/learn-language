# Design direction: Learn Language

> **Status: proposed by Claude, not yet approved.** You asked me to propose a direction. Honest warning
> from the antislop rules: a style chosen by an AI tends toward generic "AI taste". Change anything here
> that doesn't feel like yours.

## Identity

A French **exercise book** (*cahier*): calm paper, ink and one red correction pencil. It should feel like
studying with a good notebook, not like a game or a tech product.

- **Who it's for:** one adult learner, studying 15–30 minutes a day, aiming for the DELF A2.
- **Personality:** patient, precise, quietly encouraging. No confetti, no mascots, no streak pressure.

## Palette (2 core + 1 accent)

| Role | Light | Dark | Why |
| --- | --- | --- | --- |
| Paper (background) | warm off-white `#F6F3EC` | deep ink-black `#14161B` | Paper, not screen-white: easier on the eyes for daily reading |
| Ink (text, primary) | navy ink `#1F2A44` | chalk `#ECE8DF` | The colour of a fountain-pen notebook |
| Accent | *bleu de France* `#2B4FD6`, used only for the **one** next action | `#7C97FF` | One deliberate accent, at the key moment (Continue / Check) |
| Correction (feedback only) | red pencil `#B3261E` | `#F2867E` | Wrong answers look like a teacher's correction |
| Right (feedback only) | green ink `#1B6E45` | `#6BCB98` | Calm "correct", not neon |

## Typography: the identity motif

**French is set in a serif, English in a sans.** This is the motif, and it serves learning: on every screen,
the eye can tell the language being learnt from the explanation at a glance.

- French: *Literata* (a book serif made for long reading on screens).
- English and UI: *Inter*, chosen for clarity at small sizes on Android.
- No all-caps labels with wide letter spacing. Small labels are sentence case, muted.

## Layout

- One focal point per screen: on Home, the next lesson; in a lesson, the question.
- Home is a course path: the current unit is open, finished units fold into one line, future units are
  quiet.
- Radius: small (6) for inputs and tiles, medium (12) for cards. Nothing pill-shaped except the
  progress bar.
- Whitespace separates sections; few borders.

## Icons and sound

Simple drawn line icons, made for this app (speaker, lock, check, close), not emoji.

## Dials

`Dial: ENERGY 1 / RHYTHM 2 / MOTION 1`. Calm, mostly consistent with a few deliberate breaks (the result
screen, the unit headers), motion only for feedback (answer colour change, progress bar).
