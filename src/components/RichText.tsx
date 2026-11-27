import { Text, type TextStyle } from 'react-native';

/** Renders **bold** and *italic* from content text. */
export function RichText({ text, style }: { text: string; style?: TextStyle | TextStyle[] }) {
  const parts = text.split(/(\*\*[^*]+\*\*|\*[^*]+\*)/g).filter(Boolean);
  return (
    <Text style={style}>
      {parts.map((p, i) =>
        p.startsWith('**') ? (
          <Text key={i} style={{ fontWeight: '700' }}>{p.slice(2, -2)}</Text>
        ) : p.startsWith('*') && p.length > 1 ? (
          <Text key={i} style={{ fontStyle: 'italic' }}>{p.slice(1, -1)}</Text>
        ) : (
          p
        ),
      )}
    </Text>
  );
}
