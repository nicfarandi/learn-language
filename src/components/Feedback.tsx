import { StyleSheet, Text, View } from 'react-native';
import type { Note } from '../content/types';
import type { Explain } from '../utils/exercises';
import type { Verdict } from '../utils/text';
import { radius, spacing, typography, useStyles, type Palette } from '../theme';
import { Button } from './Button';
import { RichText } from './RichText';
import { SpeakButton } from './SpeakButton';

const HEADINGS: Record<Verdict, string> = {
  right: 'Correct!',
  almost: 'Almost — check the spelling',
  wrong: 'Not quite',
};

/** After every answer: the right French, the English, and the why. */
export function Feedback({ verdict, explain, note, onContinue }: { verdict: Verdict; explain?: Explain; note?: Note; onContinue: () => void }) {
  const s = useStyles(makeStyles);
  const tone = verdict === 'right' ? s.right : verdict === 'almost' ? s.almost : s.wrong;
  return (
    <View style={[s.panel, tone]}>
      <Text style={s.heading}>{HEADINGS[verdict]}</Text>
      {explain && (
        <View style={s.row}>
          <View style={s.flex}>
            <Text style={s.fr}>{explain.fr}</Text>
            <Text style={s.en}>{explain.en}</Text>
          </View>
          <SpeakButton text={explain.fr} />
        </View>
      )}
      {explain?.tip && <Text style={s.tip}>{explain.tip}</Text>}
      {note && verdict !== 'right' && (
        <View style={s.note}>
          <Text style={s.noteTitle}>Why: {note.title}</Text>
          <RichText text={note.body} style={s.noteBody} />
        </View>
      )}
      <Button label="Continue" onPress={onContinue} />
    </View>
  );
}

const makeStyles = (p: Palette) =>
  StyleSheet.create({
    panel: { borderRadius: radius.lg, padding: spacing.lg, gap: spacing.md, borderWidth: 2 },
    right: { backgroundColor: p.successMuted, borderColor: p.success },
    almost: { backgroundColor: p.warningMuted, borderColor: p.warning },
    wrong: { backgroundColor: p.dangerMuted, borderColor: p.danger },
    heading: { fontSize: typography.large, fontWeight: '800', color: p.text },
    row: { flexDirection: 'row', alignItems: 'center', gap: spacing.md },
    flex: { flex: 1 },
    fr: { fontSize: typography.large, fontWeight: '700', color: p.text },
    en: { fontSize: typography.body, color: p.textMuted },
    tip: { fontSize: typography.body, color: p.text },
    note: { gap: spacing.xs },
    noteTitle: { fontSize: typography.body, fontWeight: '700', color: p.text },
    noteBody: { fontSize: typography.body, color: p.text, lineHeight: typography.body * 1.4 },
  });
