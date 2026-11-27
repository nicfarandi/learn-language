import { useEffect, useState } from 'react';
import { ActivityIndicator, StyleSheet, Text, View } from 'react-native';
import { type ErrorBoundaryProps, Stack } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import { NavigationBar } from 'expo-navigation-bar';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { GestureHandlerRootView } from 'react-native-gesture-handler';
import { initDb } from '../src/db/client';
import { Button } from '../src/components/Button';
import { spacing, typography, usePalette } from '../src/theme';

export function ErrorBoundary({ error, retry }: ErrorBoundaryProps) {
  return (
    <View style={styles.center}>
      <Text style={styles.message}>Something went wrong: {error.message}</Text>
      <Button label="Try again" onPress={retry} />
    </View>
  );
}

export default function RootLayout() {
  const palette = usePalette();
  const [ready, setReady] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [attempt, setAttempt] = useState(0);

  useEffect(() => {
    initDb()
      .then(() => setReady(true))
      .catch((e: unknown) => setError(e instanceof Error ? e.message : String(e)));
  }, [attempt]);

  let body;
  if (error) {
    body = (
      <View style={[styles.center, { backgroundColor: palette.background }]}>
        <Text style={[styles.message, { color: palette.text }]}>Could not open the app’s storage: {error}</Text>
        <Button label="Try again" onPress={() => { setError(null); setAttempt((a) => a + 1); }} />
      </View>
    );
  } else if (!ready) {
    body = <ActivityIndicator style={[styles.fill, { backgroundColor: palette.background }]} color={palette.primary} />;
  } else {
    body = <Stack screenOptions={{ headerShown: false, contentStyle: { backgroundColor: palette.background } }} />;
  }

  return (
    <GestureHandlerRootView style={styles.fill}>
      <SafeAreaProvider>
        {/* Full screen by default: both system bars hidden; a swipe from the edge shows them briefly. */}
        <StatusBar style="auto" hidden />
        <NavigationBar hidden />
        {body}
      </SafeAreaProvider>
    </GestureHandlerRootView>
  );
}

const styles = StyleSheet.create({
  fill: { flex: 1 },
  center: { flex: 1, justifyContent: 'center', padding: spacing.xl, gap: spacing.lg },
  message: { fontSize: typography.body },
});
