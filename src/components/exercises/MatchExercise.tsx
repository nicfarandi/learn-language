import { useEffect, useRef, useState } from 'react';
import { StyleSheet, Text, View } from 'react-native';
import type { Exercise } from '../../utils/exercises';
import type { Verdict } from '../../utils/text';
import { shuffle } from '../../utils/random';
import { sayFrench } from '../../services/audio';
import { spacing, typography, useStyles, type Palette } from '../../theme';
import { OptionButton, type OptionState } from '../OptionButton';

type Match = Extract<Exercise, { kind: 'match' }>;

/**
 * Tap a French word, then its meaning. Counts as right when every pair is found with no wrong tap; otherwise
 * reports the words that had a wrong tap.
 */
export function MatchExercise({ exercise, locked, onAnswer }: { exercise: Match; locked: boolean; onAnswer: (v: Verdict, missed?: string[]) => void }) {
  const s = useStyles(makeStyles);
  const [left] = useState(() => shuffle(exercise.pairs, Math.random));
  const [right] = useState(() => shuffle(exercise.pairs, Math.random));
  const [picked, setPicked] = useState<string | null>(null);
  const [done, setDone] = useState<Set<string>>(new Set());
  const [wrongFlash, setWrongFlash] = useState<string | null>(null);
  const [missed, setMissed] = useState<Set<string>>(new Set());
  const [mistakes, setMistakes] = useState(0);
  const flashTimer = useRef<ReturnType<typeof setTimeout> | null>(null);
  useEffect(() => () => { if (flashTimer.current) clearTimeout(flashTimer.current); }, []);

  const tapRight = (itemId: string) => {
    if (!picked) return;
    if (picked === itemId) {
      const next = new Set(done).add(itemId);
      setDone(next);
      setPicked(null);
      if (next.size === exercise.pairs.length) onAnswer(missed.size === 0 ? 'right' : 'wrong', [...missed]);
    } else {
      setMistakes((m) => m + 1);
      setMissed(new Set(missed).add(picked));
      setWrongFlash(itemId);
      if (flashTimer.current) clearTimeout(flashTimer.current);
      flashTimer.current = setTimeout(() => setWrongFlash(null), 500);
    }
  };

  const leftState = (id: string): OptionState => (done.has(id) ? 'right' : picked === id ? 'selected' : 'idle');
  const rightState = (id: string): OptionState => (done.has(id) ? 'right' : wrongFlash === id ? 'wrong' : 'idle');

  return (
    <View style={s.wrap}>
      <Text style={s.instruction}>Match the pairs</Text>
      <Text style={s.hint}>Tap a French word, then its meaning.</Text>
      <View style={s.columns}>
        <View style={s.column}>
          {left.map((p) => (
            <OptionButton
              key={p.itemId}
              label={p.fr}
              state={leftState(p.itemId)}
              disabled={locked || done.has(p.itemId)}
              onPress={() => {
                setPicked(p.itemId);
                sayFrench(p.fr);
              }}
            />
          ))}
        </View>
        <View style={s.column}>
          {right.map((p) => (
            <OptionButton
              key={p.itemId}
              label={p.en}
              state={rightState(p.itemId)}
              disabled={locked || done.has(p.itemId) || !picked}
              onPress={() => tapRight(p.itemId)}
            />
          ))}
        </View>
      </View>
      {mistakes > 0 && <Text style={s.hint}>Wrong taps: {mistakes}</Text>}
    </View>
  );
}

const makeStyles = (p: Palette) =>
  StyleSheet.create({
    wrap: { gap: spacing.md },
    instruction: { fontSize: typography.small, color: p.textMuted, fontWeight: '700', textTransform: 'uppercase', letterSpacing: 0.5 },
    hint: { fontSize: typography.body, color: p.textMuted },
    columns: { flexDirection: 'row', gap: spacing.sm },
    column: { flex: 1, gap: spacing.sm },
  });
