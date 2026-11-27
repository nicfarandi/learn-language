import { Pressable, StyleSheet, Text } from 'react-native';
import { sayFrench } from '../services/audio';
import { radius, sz, touchTarget, useStyles, type Palette } from '../theme';

/** A round 🔊 button that says the French text; long-press says it slowly. */
export function SpeakButton({ text, big }: { text: string; big?: boolean }) {
  const s = useStyles(makeStyles);
  const size = big ? sz(72) : touchTarget;
  return (
    <Pressable
      accessibilityRole="button"
      accessibilityLabel="Listen"
      onPress={() => sayFrench(text)}
      onLongPress={() => sayFrench(text, { slow: true })}
      style={({ pressed }) => [s.button, { width: size, height: size }, pressed && s.pressed]}
    >
      <Text style={{ fontSize: big ? sz(30) : sz(20) }}>🔊</Text>
    </Pressable>
  );
}

const makeStyles = (p: Palette) =>
  StyleSheet.create({
    button: { borderRadius: radius.pill, backgroundColor: p.primaryMuted, alignItems: 'center', justifyContent: 'center' },
    pressed: { opacity: 0.7 },
  });
