import { useMemo, useRef, useState } from 'react';
import { Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import { Stack, router, useLocalSearchParams } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';
import { LESSONS, findLesson } from '../../content/fr';
import type { Note } from '../../src/content/types';
import { Button } from '../../src/components/Button';
import { Feedback } from '../../src/components/Feedback';
import { LearnCard, type Card } from '../../src/components/LearnCard';
import { BuildExercise } from '../../src/components/exercises/BuildExercise';
import { ChoiceExercise } from '../../src/components/exercises/ChoiceExercise';
import { MatchExercise } from '../../src/components/exercises/MatchExercise';
import { TypeExercise } from '../../src/components/exercises/TypeExercise';
import { saveLessonResult } from '../../src/services/progress';
import { stopAudio } from '../../src/services/audio';
import { buildExercises, type Exercise } from '../../src/utils/exercises';
import type { Verdict } from '../../src/utils/text';
import { radius, spacing, sz, touchTarget, typography, useStyles, type Palette } from '../../src/theme';

/** `missed`: for match pairs, the word ids that had a wrong tap. */
type Answer = { exercise: Exercise; verdict: Verdict; missed?: string[] };
type Phase = 'learn' | 'practice' | 'result';

export default function LessonScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const ref = findLesson(id ?? '');
  const s = useStyles(makeStyles);

  if (!ref) {
    return (
      <SafeAreaView style={s.screen}>
        <Text style={s.title}>Lesson not found</Text>
        <Button label="Back" onPress={() => router.back()} />
      </SafeAreaView>
    );
  }
  return <Lesson key={ref.lesson.id} lessonId={ref.lesson.id} />;
}

function Lesson({ lessonId }: { lessonId: string }) {
  const s = useStyles(makeStyles);
  const { lesson, unit, index } = findLesson(lessonId)!;

  const cards: Card[] = useMemo(
    () => [{ kind: 'words', words: lesson.words }, ...lesson.notes.map((note) => ({ kind: 'note' as const, note }))],
    [lesson],
  );
  const notesById = useMemo(() => new Map<string, Note>(lesson.notes.map((n) => [n.id, n])), [lesson]);

  const [phase, setPhase] = useState<Phase>('learn');
  const [card, setCard] = useState(0);
  // A fresh order every time the lesson is opened; built once, in the state initialiser.
  const [queue, setQueue] = useState<Exercise[]>(() => {
    const earlier = LESSONS.slice(0, index).flatMap((l) => l.lesson.words);
    return buildExercises(lesson, earlier, Date.now() % 2147483647);
  });
  const [retrying, setRetrying] = useState(false);
  const [step, setStep] = useState(0);
  const [verdict, setVerdict] = useState<Verdict | null>(null);
  const [answers, setAnswers] = useState<Answer[]>([]);
  const [saveError, setSaveError] = useState<string | null>(null);

  const current = queue[step];
  const score = answers.filter((a) => a.verdict !== 'wrong').length;
  const mistakes = answers.filter((a) => a.verdict === 'wrong');

  // Guards against a fast double tap recording two answers before the buttons lock on re-render.
  const answered = useRef(false);
  const answer = (v: Verdict, missed?: string[]) => {
    if (answered.current) return;
    answered.current = true;
    setVerdict(v);
    setAnswers((a) => [...a, { exercise: current, verdict: v, missed }]);
  };

  const next = () => {
    stopAudio();
    answered.current = false;
    setVerdict(null);
    if (step + 1 < queue.length) {
      setStep(step + 1);
      return;
    }
    setPhase('result');
    // Only the first full run counts as the lesson's score; "Retry mistakes" is extra practice.
    if (!retrying) {
      const all = [...answers];
      const right = all.filter((a) => a.verdict !== 'wrong').length;
      const wrong = all
        .filter((a) => a.verdict === 'wrong')
        .flatMap((a) =>
          a.exercise.kind === 'match'
            ? (a.missed ?? []).map((itemId) => ({ itemId, kind: 'match' }))
            : [{ itemId: a.exercise.itemId, kind: a.exercise.kind }],
        );
      saveLessonResult(lesson.id, right, all.length, wrong).catch((e: unknown) =>
        setSaveError(e instanceof Error ? e.message : String(e)),
      );
    }
  };

  const retryMistakes = () => {
    setQueue(mistakes.map((m) => m.exercise));
    setAnswers([]);
    setStep(0);
    answered.current = false;
    setRetrying(true);
    setPhase('practice');
  };

  const explainNote = (x: Exercise): Note | undefined =>
    x.kind === 'match' ? undefined : x.explain.noteId ? notesById.get(x.explain.noteId) : undefined;

  return (
    <SafeAreaView style={s.screen} edges={['top', 'bottom']}>
      <Stack.Screen options={{ headerShown: false }} />
      <View style={s.header}>
        <Pressable onPress={() => router.back()} accessibilityRole="button" accessibilityLabel="Close lesson" style={s.close}>
          <Text style={s.closeLabel}>✕</Text>
        </Pressable>
        <View style={s.flex}>
          <Text style={s.kicker}>Unit {unit.number} · {lesson.title}</Text>
          {phase !== 'result' && (
            <View style={s.track}>
              <View
                style={[
                  s.fill,
                  { width: `${phase === 'learn' ? ((card + 1) / cards.length) * 100 : (step / queue.length) * 100}%` },
                ]}
              />
            </View>
          )}
        </View>
      </View>

      <ScrollView contentContainerStyle={s.body} keyboardShouldPersistTaps="handled">
        {phase === 'learn' && (
          <>
            <Text style={s.kicker}>Learn · {card + 1} of {cards.length}</Text>
            {card === 0 && <Text style={s.goal}>{lesson.goal}</Text>}
            <LearnCard card={cards[card]} />
            <View style={s.buttons}>
              {card > 0 && <Button label="Back" kind="secondary" onPress={() => setCard(card - 1)} />}
              {card + 1 < cards.length ? (
                <Button label="Next" onPress={() => setCard(card + 1)} />
              ) : (
                <Button label="Start practice" onPress={() => setPhase('practice')} />
              )}
            </View>
          </>
        )}

        {phase === 'practice' && current && (
          <>
            <Text style={s.kicker}>
              {retrying ? 'Retry mistakes' : 'Practice'} · {step + 1} of {queue.length}
            </Text>
            <ExerciseView key={`${current.id}-${retrying}`} exercise={current} locked={verdict !== null} onAnswer={answer} />
            {verdict && (
              <Feedback
                verdict={verdict}
                explain={current.kind === 'match' ? undefined : current.explain}
                note={explainNote(current)}
                onContinue={next}
              />
            )}
          </>
        )}

        {phase === 'result' && (
          <>
            <Text style={s.title}>{retrying ? 'Practice done' : 'Lesson done'}</Text>
            <View style={s.scoreBox}>
              <Text style={s.score}>{score}/{answers.length}</Text>
              <Text style={s.muted}>{retrying ? 'on your mistakes' : 'your score'}</Text>
            </View>
            {saveError && <Text style={s.error}>Could not save your progress: {saveError}</Text>}
            {mistakes.length > 0 && (
              <View style={s.mistakes}>
                <Text style={s.subtitle}>To look at again</Text>
                {mistakes.map(({ exercise: x }) => (
                  <View key={x.id} style={s.mistake}>
                    {x.kind === 'match' ? (
                      <Text style={s.fr}>Match the pairs</Text>
                    ) : (
                      <>
                        <Text style={s.fr}>{x.explain.fr}</Text>
                        <Text style={s.muted}>{x.explain.en}</Text>
                        {explainNote(x) && <Text style={s.muted}>Why: {explainNote(x)!.title}</Text>}
                      </>
                    )}
                  </View>
                ))}
              </View>
            )}
            <View style={s.buttons}>
              {mistakes.length > 0 && <Button label="Retry mistakes" kind="secondary" onPress={retryMistakes} />}
              <Button label="Done" onPress={() => router.back()} />
            </View>
          </>
        )}
      </ScrollView>
    </SafeAreaView>
  );
}

function ExerciseView({ exercise, locked, onAnswer }: { exercise: Exercise; locked: boolean; onAnswer: (v: Verdict, missed?: string[]) => void }) {
  switch (exercise.kind) {
    case 'pick':
    case 'listen':
    case 'gap':
      return <ChoiceExercise exercise={exercise} locked={locked} onAnswer={onAnswer} />;
    case 'match':
      return <MatchExercise exercise={exercise} locked={locked} onAnswer={onAnswer} />;
    case 'build':
      return <BuildExercise exercise={exercise} locked={locked} onAnswer={onAnswer} />;
    case 'type':
      return <TypeExercise exercise={exercise} locked={locked} onAnswer={onAnswer} />;
  }
}

const makeStyles = (p: Palette) =>
  StyleSheet.create({
    screen: { flex: 1, backgroundColor: p.background },
    header: { flexDirection: 'row', alignItems: 'center', gap: spacing.md, paddingHorizontal: spacing.lg, paddingVertical: spacing.sm },
    close: { minWidth: touchTarget, minHeight: touchTarget, alignItems: 'center', justifyContent: 'center' },
    closeLabel: { fontSize: typography.title, color: p.textMuted },
    flex: { flex: 1, gap: spacing.xs },
    track: { height: sz(8), borderRadius: radius.pill, backgroundColor: p.border, overflow: 'hidden' },
    fill: { height: '100%', backgroundColor: p.primary },
    body: { padding: spacing.lg, gap: spacing.lg, paddingBottom: spacing.xxl },
    kicker: { fontSize: typography.small, color: p.textMuted, fontWeight: '700' },
    goal: { fontSize: typography.body, color: p.text },
    title: { fontSize: typography.hero, fontWeight: '800', color: p.text },
    subtitle: { fontSize: typography.large, fontWeight: '700', color: p.text },
    buttons: { gap: spacing.sm },
    scoreBox: { alignItems: 'center', backgroundColor: p.card, borderRadius: radius.lg, padding: spacing.xl, borderWidth: 1, borderColor: p.border },
    score: { fontSize: typography.hero * 1.6, fontWeight: '800', color: p.primary },
    muted: { fontSize: typography.body, color: p.textMuted },
    error: { fontSize: typography.body, color: p.danger },
    mistakes: { gap: spacing.sm },
    mistake: { backgroundColor: p.card, borderRadius: radius.md, padding: spacing.md, borderWidth: 1, borderColor: p.border, gap: spacing.xs },
    fr: { fontSize: typography.large, fontWeight: '700', color: p.text },
  });
