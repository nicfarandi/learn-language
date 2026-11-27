import * as Speech from 'expo-speech';

/**
 * Says a French text aloud. For now this uses the phone's French voice; recorded audio files replace it
 * later (planning/PROPOSAL.md, Audio), behind this same function.
 */
export function sayFrench(text: string, options: { slow?: boolean } = {}): void {
  Speech.stop();
  Speech.speak(speakable(text), { language: 'fr-FR', rate: options.slow ? 0.6 : 0.9 });
}

export function stopAudio(): void {
  Speech.stop();
}

/** Word-list notation read as speech: "il / elle parle" → "il, elle parle"; "j'ai … ans" → "j'ai ans". */
export function speakable(text: string): string {
  return text.replace(/\s*\/\s*/g, ', ').replace(/\s*…\s*/g, ' ').replace(/\s+/g, ' ').trim();
}
