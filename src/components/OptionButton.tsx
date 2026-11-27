import { Pressable, StyleSheet, Text } from 'react-native';
import { radius, spacing, touchTarget, typography, useStyles, type Palette } from '../theme';

export type OptionState = 'idle' | 'selected' | 'right' | 'wrong' | 'faded';

export function OptionButton({ label, state, onPress, disabled }: { label: string; state: OptionState; onPress: () => void; disabled?: boolean }) {
  const s = useStyles(makeStyles);
  return (
    <Pressable
      accessibilityRole="button"
      accessibilityState={{ selected: state === 'selected', disabled }}
      onPress={onPress}
      disabled={disabled}
      style={({ pressed }) => [s.base, s[state], pressed && !disabled && s.pressed]}
    >
      <Text style={[s.label, state === 'faded' && s.fadedLabel]}>{label}</Text>
    </Pressable>
  );
}

const makeStyles = (p: Palette) =>
  StyleSheet.create({
    base: {
      minHeight: touchTarget,
      borderRadius: radius.md,
      borderWidth: 2,
      paddingHorizontal: spacing.md,
      paddingVertical: spacing.sm,
      justifyContent: 'center',
      backgroundColor: p.card,
      borderColor: p.border,
    },
    idle: {},
    selected: { borderColor: p.primary, backgroundColor: p.primaryMuted },
    right: { borderColor: p.success, backgroundColor: p.successMuted },
    wrong: { borderColor: p.danger, backgroundColor: p.dangerMuted },
    faded: { opacity: 0.35 },
    pressed: { opacity: 0.8 },
    label: { fontSize: typography.body, color: p.text },
    fadedLabel: {},
  });
