import { StyleSheet, Text, View } from 'react-native';
import type { Note, Word } from '../content/types';
import { radius, spacing, typography, useStyles, type Palette } from '../theme';
import { RichText } from './RichText';
import { SpeakButton } from './SpeakButton';

export type Card = { kind: 'words'; words: Word[] } | { kind: 'note'; note: Note };

/** One Learn card: the lesson's new words, or a rule with examples. */
export function LearnCard({ card }: { card: Card }) {
  const s = useStyles(makeStyles);
  if (card.kind === 'words') {
    return (
      <View style={s.card}>
        <Text style={s.title}>New words</Text>
        <Text style={s.hint}>Tap 🔊 to listen. Hold it to hear the word slowly.</Text>
        {card.words.map((w) => (
          <View key={w.id} style={s.wordRow}>
            <SpeakButton text={w.fr} />
            <View style={s.flex}>
              <Text style={s.fr}>{w.fr}</Text>
              <Text style={s.en}>{w.en}</Text>
              {w.tip && <Text style={s.tip}>{w.tip}</Text>}
            </View>
          </View>
        ))}
      </View>
    );
  }
  const { note } = card;
  return (
    <View style={s.card}>
      <Text style={s.title}>{note.title}</Text>
      <RichText text={note.body} style={s.body} />
      <View style={s.examples}>
        {note.examples.map((e, i) => (
          <View key={i} style={s.wordRow}>
            <SpeakButton text={e.fr} />
            <View style={s.flex}>
              <Text style={s.fr}>{e.fr}</Text>
              <Text style={s.en}>{e.en}</Text>
            </View>
          </View>
        ))}
      </View>
      {note.more && <RichText text={note.more} style={s.tip} />}
    </View>
  );
}

const makeStyles = (p: Palette) =>
  StyleSheet.create({
    card: { backgroundColor: p.card, borderRadius: radius.lg, padding: spacing.lg, gap: spacing.md, borderWidth: 1, borderColor: p.border },
    title: { fontSize: typography.title, fontWeight: '800', color: p.text },
    hint: { fontSize: typography.small, color: p.textMuted },
    body: { fontSize: typography.body, color: p.text, lineHeight: typography.body * 1.45 },
    examples: { gap: spacing.md, paddingTop: spacing.xs },
    wordRow: { flexDirection: 'row', gap: spacing.md, alignItems: 'center' },
    flex: { flex: 1 },
    fr: { fontSize: typography.large, fontWeight: '700', color: p.text },
    en: { fontSize: typography.body, color: p.textMuted },
    tip: { fontSize: typography.small, color: p.textMuted, lineHeight: typography.small * 1.4 },
  });
