import { useState } from 'react';
import { StyleSheet, Text, View } from 'react-native';
import type { Exercise } from '../../utils/exercises';
import type { Verdict } from '../../utils/text';
import { spacing, typography, useStyles, type Palette } from '../../theme';
import { OptionButton, type OptionState } from '../OptionButton';
import { SpeakButton } from '../SpeakButton';

type Choice = Extract<Exercise, { kind: 'pick' | 'listen' | 'gap' }>;

/** Pick the meaning, listen and pick, and fill the gap: one right option among a few. */
export function ChoiceExercise({ exercise, locked, onAnswer }: { exercise: Choice; locked: boolean; onAnswer: (v: Verdict) => void }) {
  const s = useStyles(makeStyles);
  const [chosen, setChosen] = useState<string | null>(null);

  const stateOf = (option: string): OptionState => {
    if (!locked) return 'idle';
    if (option === exercise.answer) return 'right';
    if (option === chosen) return 'wrong';
    return 'faded';
  };

  return (
    <View style={s.wrap}>
      {exercise.kind === 'pick' && (
        <>
          <Text style={s.instruction}>{exercise.direction === 'fr-en' ? 'What does this mean?' : 'How do you say this in French?'}</Text>
          <View style={s.promptRow}>
            <Text style={s.prompt}>{exercise.prompt}</Text>
            {exercise.direction === 'fr-en' && <SpeakButton text={exercise.prompt} />}
          </View>
        </>
      )}
      {exercise.kind === 'listen' && (
        <>
          <Text style={s.instruction}>What do you hear?</Text>
          <View style={s.center}><SpeakButton text={exercise.audio} big /></View>
          <Text style={s.hint}>Tap to play again. Hold to hear it slowly.</Text>
        </>
      )}
      {exercise.kind === 'gap' && (
        <>
          <Text style={s.instruction}>Fill the gap</Text>
          <Text style={s.prompt}>{exercise.prompt}</Text>
          <Text style={s.hint}>{exercise.hint}</Text>
        </>
      )}
      <View style={s.options}>
        {exercise.options.map((o) => (
          <OptionButton
            key={o}
            label={o}
            state={stateOf(o)}
            disabled={locked}
            onPress={() => {
              setChosen(o);
              onAnswer(o === exercise.answer ? 'right' : 'wrong');
            }}
          />
        ))}
      </View>
    </View>
  );
}

const makeStyles = (p: Palette) =>
  StyleSheet.create({
    wrap: { gap: spacing.lg },
    instruction: { fontSize: typography.small, color: p.textMuted, fontWeight: '700', textTransform: 'uppercase', letterSpacing: 0.5 },
    promptRow: { flexDirection: 'row', alignItems: 'center', gap: spacing.md },
    prompt: { fontSize: typography.title, color: p.text, fontWeight: '700', flexShrink: 1 },
    hint: { fontSize: typography.body, color: p.textMuted },
    center: { alignItems: 'center', paddingVertical: spacing.md },
    options: { gap: spacing.sm },
  });
