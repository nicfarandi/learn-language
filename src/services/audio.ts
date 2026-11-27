import * as Speech from 'expo-speech';

/**
 * Says a French text aloud. For now this uses the phone's French voice; recorded audio files replace it
 * later (planning/PROPOSAL.md, Audio), behind this same function.
 */
export function sayFrench(text: string, options: { slow?: boolean } = {}): void {
  Speech.stop();
  Speech.speak(text, { language: 'fr-FR', rate: options.slow ? 0.6 : 0.9 });
}

export function stopAudio(): void {
  Speech.stop();
}
