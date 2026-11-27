import { Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import { router } from 'expo-router';
import Constants from 'expo-constants';
import { SafeAreaView } from 'react-native-safe-area-context';
import { RELEASES } from '../src/releases';
import { radius, spacing, touchTarget, typography, useStyles, type Palette } from '../src/theme';

export default function Releases() {
  const s = useStyles(makeStyles);
  const builtAt = Constants.expoConfig?.extra?.builtAt as string | undefined;
  return (
    <SafeAreaView style={s.screen} edges={['top']}>
      <ScrollView contentContainerStyle={s.body}>
        <Pressable onPress={() => router.back()} accessibilityRole="button" style={s.backButton}>
          <Text style={s.back}>‹ Back</Text>
        </Pressable>
        <Text style={s.title}>What’s new</Text>
        <Text style={s.muted}>
          Installed: v{Constants.expoConfig?.version}
          {builtAt ? `, built ${builtAt.slice(0, 16).replace('T', ' ')} UTC` : ''}
        </Text>
        {RELEASES.map((r) => (
          <View key={r.version} style={s.card}>
            <Text style={s.version}>v{r.version} · {r.released}</Text>
            <Text style={s.cardTitle}>{r.title}</Text>
            {r.notes.map((n, i) => (
              <Text key={i} style={s.note}>• {n}</Text>
            ))}
          </View>
        ))}
      </ScrollView>
    </SafeAreaView>
  );
}

const makeStyles = (p: Palette) =>
  StyleSheet.create({
    screen: { flex: 1, backgroundColor: p.background },
    body: { padding: spacing.lg, gap: spacing.lg, paddingBottom: spacing.xxl },
    backButton: { minHeight: touchTarget, justifyContent: 'center', alignSelf: 'flex-start' },
    back: { fontSize: typography.body, color: p.primary, fontWeight: '700' },
    title: { fontSize: typography.hero, fontWeight: '800', color: p.text },
    muted: { fontSize: typography.body, color: p.textMuted },
    card: { backgroundColor: p.card, borderRadius: radius.lg, padding: spacing.lg, gap: spacing.sm, borderWidth: 1, borderColor: p.border },
    version: { fontSize: typography.small, color: p.textMuted, fontWeight: '700' },
    cardTitle: { fontSize: typography.large, fontWeight: '800', color: p.text },
    note: { fontSize: typography.body, color: p.text, lineHeight: typography.body * 1.4 },
  });
