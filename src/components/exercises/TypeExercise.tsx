import { useState } from 'react';
import { StyleSheet, Text, TextInput, View } from 'react-native';
import type { Exercise } from '../../utils/exercises';
import { checkTyped, type Verdict } from '../../utils/text';
import { radius, spacing, touchTarget, typography, useStyles, usePalette, type Palette } from '../../theme';
import { Button } from '../Button';

type TypeIt = Extract<Exercise, { kind: 'type' }>;

/** Type the French. Accents and small typos count as "almost right". */
export function TypeExercise({ exercise, locked, onAnswer }: { exercise: TypeIt; locked: boolean; onAnswer: (v: Verdict) => void }) {
  const s = useStyles(makeStyles);
  const palette = usePalette();
  const [text, setText] = useState('');
  const check = () => onAnswer(checkTyped(text, exercise.accepted));

  return (
    <View style={s.wrap}>
      <Text style={s.instruction}>Type it in French</Text>
      <Text style={s.prompt}>{exercise.en}</Text>
      <TextInput
        style={s.input}
        value={text}
        onChangeText={setText}
        editable={!locked}
        autoCapitalize="none"
        autoCorrect={false}
        placeholder="Type here"
        placeholderTextColor={palette.textMuted}
        onSubmitEditing={() => text.trim() && !locked && check()}
        returnKeyType="done"
      />
      {!locked && <Button label="Check" onPress={check} disabled={!text.trim()} />}
    </View>
  );
}

const makeStyles = (p: Palette) =>
  StyleSheet.create({
    wrap: { gap: spacing.lg },
    instruction: { fontSize: typography.small, color: p.textMuted, fontWeight: '700', textTransform: 'uppercase', letterSpacing: 0.5 },
    prompt: { fontSize: typography.title, color: p.text, fontWeight: '700' },
    input: {
      minHeight: touchTarget, borderRadius: radius.md, borderWidth: 2, borderColor: p.border, backgroundColor: p.card,
      paddingHorizontal: spacing.md, fontSize: typography.large, color: p.text,
    },
  });
