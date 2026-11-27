import { Pressable, StyleSheet, Text } from 'react-native';
import { radius, spacing, touchTarget, typography, useStyles, type Palette } from '../theme';

type Props = {
  label: string;
  onPress: () => void;
  kind?: 'primary' | 'secondary';
  disabled?: boolean;
};

export function Button({ label, onPress, kind = 'primary', disabled }: Props) {
  const s = useStyles(makeStyles);
  return (
    <Pressable
      accessibilityRole="button"
      onPress={onPress}
      disabled={disabled}
      style={({ pressed }) => [s.base, kind === 'primary' ? s.primary : s.secondary, disabled && s.disabled, pressed && s.pressed]}
    >
      <Text style={[s.label, kind === 'primary' ? s.primaryLabel : s.secondaryLabel]}>{label}</Text>
    </Pressable>
  );
}

const makeStyles = (p: Palette) =>
  StyleSheet.create({
    base: {
      minHeight: touchTarget,
      borderRadius: radius.md,
      paddingHorizontal: spacing.lg,
      alignItems: 'center',
      justifyContent: 'center',
    },
    primary: { backgroundColor: p.primary },
    secondary: { backgroundColor: p.card, borderWidth: 1, borderColor: p.border },
    disabled: { opacity: 0.4 },
    pressed: { opacity: 0.8 },
    label: { fontSize: typography.body, fontWeight: '700' },
    primaryLabel: { color: p.primaryText },
    secondaryLabel: { color: p.text },
  });
