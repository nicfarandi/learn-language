import { useState } from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';
import type { Exercise } from '../../utils/exercises';
import { normalize, type Verdict } from '../../utils/text';
import { radius, spacing, touchTarget, typography, useStyles, type Palette } from '../../theme';
import { Button } from '../Button';

type Build = Extract<Exercise, { kind: 'build' }>;

/** Tap the word tiles in order to make the French sentence. */
export function BuildExercise({ exercise, locked, onAnswer }: { exercise: Build; locked: boolean; onAnswer: (v: Verdict) => void }) {
  const s = useStyles(makeStyles);
  // Tiles are tracked by position, because a sentence can use the same word twice.
  const [chosen, setChosen] = useState<number[]>([]);
  const remaining = exercise.tiles.map((t, i) => ({ t, i })).filter(({ i }) => !chosen.includes(i));

  const check = () => {
    const built = chosen.map((i) => exercise.tiles[i]).join(' ');
    onAnswer(normalize(built) === normalize(exercise.answer) ? 'right' : 'wrong');
  };

  return (
    <View style={s.wrap}>
      <Text style={s.instruction}>Build the sentence</Text>
      <Text style={s.prompt}>{exercise.en}</Text>
      <View style={[s.answerRow]}>
        {chosen.map((i) => (
          <Tile key={i} label={exercise.tiles[i]} disabled={locked} onPress={() => setChosen(chosen.filter((c) => c !== i))} />
        ))}
      </View>
      <View style={s.pool}>
        {remaining.map(({ t, i }) => (
          <Tile key={i} label={t} disabled={locked} onPress={() => setChosen([...chosen, i])} />
        ))}
      </View>
      {!locked && <Button label="Check" onPress={check} disabled={chosen.length === 0} />}
    </View>
  );
}

function Tile({ label, onPress, disabled }: { label: string; onPress: () => void; disabled: boolean }) {
  const s = useStyles(makeStyles);
  return (
    <Pressable accessibilityRole="button" onPress={onPress} disabled={disabled} style={({ pressed }) => [s.tile, pressed && s.pressed]}>
      <Text style={s.tileLabel}>{label}</Text>
    </Pressable>
  );
}

const makeStyles = (p: Palette) =>
  StyleSheet.create({
    wrap: { gap: spacing.lg },
    instruction: { fontSize: typography.small, color: p.textMuted, fontWeight: '700', textTransform: 'uppercase', letterSpacing: 0.5 },
    prompt: { fontSize: typography.large, color: p.text, fontWeight: '700' },
    answerRow: {
      flexDirection: 'row', flexWrap: 'wrap', gap: spacing.sm, minHeight: touchTarget + spacing.md,
      borderBottomWidth: 2, borderColor: p.border, paddingBottom: spacing.sm,
    },
    pool: { flexDirection: 'row', flexWrap: 'wrap', gap: spacing.sm, justifyContent: 'center' },
    tile: {
      minHeight: touchTarget, paddingHorizontal: spacing.md, justifyContent: 'center',
      borderRadius: radius.sm, borderWidth: 2, borderColor: p.border, backgroundColor: p.card,
    },
    pressed: { opacity: 0.7 },
    tileLabel: { fontSize: typography.body, color: p.text },
  });
