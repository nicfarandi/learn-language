import { useCallback, useMemo } from 'react';
import { Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import { router } from 'expo-router';
import Constants from 'expo-constants';
import { SafeAreaView } from 'react-native-safe-area-context';
import { LESSONS, UNITS } from '../content/fr';
import { Button } from '../src/components/Button';
import { useFocusQuery } from '../src/hooks/useFocusQuery';
import { getAllProgress, type LessonProgress } from '../src/services/progress';
import { isLessonOpen, nextLesson } from '../src/utils/unlock';
import { radius, spacing, sz, touchTarget, typography, useStyles, type Palette } from '../src/theme';

const ORDER = LESSONS.map((l) => l.lesson.id);

export default function Home() {
  const s = useStyles(makeStyles);
  const load = useCallback(() => getAllProgress(), []);
  const { data: progress, error } = useFocusQuery<Record<string, LessonProgress>>(load, {});
  // Only lessons still in the course count, in case an old lesson id stays in the database.
  const finished = useMemo(() => new Set(ORDER.filter((id) => progress[id])), [progress]);
  const next = nextLesson(ORDER, finished);
  const nextRef = LESSONS.find((l) => l.lesson.id === next);

  return (
    <SafeAreaView style={s.screen} edges={['top']}>
      <ScrollView contentContainerStyle={s.body}>
        <View style={s.titleRow}>
          <Text style={s.title}>French</Text>
          <Pressable onPress={() => router.push('/releases')} accessibilityRole="button" style={s.version}>
            <Text style={s.versionText}>v{Constants.expoConfig?.version}</Text>
          </Pressable>
        </View>
        <Text style={s.muted}>
          {finished.size} of {ORDER.length} lessons done
        </Text>
        {error && <Text style={s.error}>Could not load your progress: {error}</Text>}

        {nextRef ? (
          <View style={s.continueCard}>
            <Text style={s.kicker}>Up next · Unit {nextRef.unit.number}</Text>
            <Text style={s.continueTitle}>{nextRef.lesson.title}</Text>
            <Text style={s.muted}>{nextRef.lesson.goal}</Text>
            <Button label={finished.size === 0 ? 'Start' : 'Continue'} onPress={() => router.push(`/lesson/${nextRef.lesson.id}`)} />
          </View>
        ) : (
          <View style={s.continueCard}>
            <Text style={s.continueTitle}>All lessons done!</Text>
            <Text style={s.muted}>More units are on the way. Redo any lesson to beat your score.</Text>
          </View>
        )}

        {UNITS.map((unit) => (
          <View key={unit.id} style={s.unit}>
            <Text style={s.kicker}>Unit {unit.number}</Text>
            <Text style={s.unitTitle}>{unit.title}</Text>
            <Text style={s.muted}>{unit.summary}</Text>
            <View style={s.lessons}>
              {unit.lessons.map((lesson, i) => {
                const open = isLessonOpen(ORDER, lesson.id, finished);
                const p = progress[lesson.id];
                return (
                  <Pressable
                    key={lesson.id}
                    disabled={!open}
                    accessibilityRole="button"
                    accessibilityState={{ disabled: !open }}
                    onPress={() => router.push(`/lesson/${lesson.id}`)}
                    style={({ pressed }) => [s.lesson, !open && s.locked, pressed && s.pressed]}
                  >
                    <Text style={[s.badge, p ? s.badgeDone : open ? s.badgeOpen : s.badgeLocked]}>
                      {p ? '✓' : open ? String(i + 1) : '🔒'}
                    </Text>
                    <View style={s.flex}>
                      <Text style={[s.lessonTitle, !open && s.lockedText]}>{lesson.title}</Text>
                      {p && <Text style={s.muted}>Best {p.best_score}/{p.total}</Text>}
                    </View>
                  </Pressable>
                );
              })}
            </View>
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
    titleRow: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' },
    title: { fontSize: typography.hero, fontWeight: '800', color: p.text },
    version: { minHeight: touchTarget, justifyContent: 'center', paddingHorizontal: spacing.sm },
    versionText: { fontSize: typography.small, color: p.primary, fontWeight: '700' },
    muted: { fontSize: typography.body, color: p.textMuted },
    error: { fontSize: typography.body, color: p.danger },
    kicker: { fontSize: typography.small, color: p.textMuted, fontWeight: '700', textTransform: 'uppercase', letterSpacing: 0.5 },
    continueCard: { backgroundColor: p.primaryMuted, borderRadius: radius.lg, padding: spacing.lg, gap: spacing.sm },
    continueTitle: { fontSize: typography.title, fontWeight: '800', color: p.text },
    unit: { gap: spacing.xs },
    unitTitle: { fontSize: typography.large, fontWeight: '800', color: p.text },
    lessons: { gap: spacing.sm, marginTop: spacing.sm },
    lesson: {
      flexDirection: 'row', alignItems: 'center', gap: spacing.md, minHeight: touchTarget + spacing.sm,
      backgroundColor: p.card, borderRadius: radius.md, paddingHorizontal: spacing.md, borderWidth: 1, borderColor: p.border,
    },
    locked: { opacity: 0.6 },
    pressed: { opacity: 0.8 },
    badge: {
      width: sz(32), height: sz(32), borderRadius: radius.pill, textAlign: 'center', textAlignVertical: 'center',
      lineHeight: sz(32), fontWeight: '800', overflow: 'hidden', fontSize: typography.small,
    },
    badgeDone: { backgroundColor: p.success, color: p.primaryText },
    badgeOpen: { backgroundColor: p.primary, color: p.primaryText },
    badgeLocked: { backgroundColor: p.border, color: p.textMuted },
    flex: { flex: 1, paddingVertical: spacing.sm },
    lessonTitle: { fontSize: typography.body, fontWeight: '700', color: p.text },
    lockedText: { color: p.textMuted },
  });
