import { useCallback, useRef, useState } from 'react';
import { useFocusEffect } from 'expo-router';

/** Loads data whenever the screen comes into focus, ignoring answers to older loads. */
export function useFocusQuery<T>(load: () => Promise<T>, initial: T) {
  const [data, setData] = useState<T>(initial);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const latest = useRef(0);

  const reload = useCallback(async () => {
    const ticket = ++latest.current;
    setLoading(true);
    setError(null);
    try {
      const result = await load();
      if (ticket === latest.current) setData(result);
    } catch (reason) {
      if (ticket === latest.current) setError(reason instanceof Error ? reason.message : String(reason));
    } finally {
      if (ticket === latest.current) setLoading(false);
    }
  }, [load]);

  useFocusEffect(useCallback(() => { void reload(); }, [reload]));
  return { data, loading, error, reload };
}
