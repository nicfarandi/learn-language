import { acceptedForms, checkTyped, normalize, sentenceTiles } from '../src/utils/text';

it('normalizes case, accents and punctuation', () => {
  expect(normalize('  Ça va bien, merci ! ')).toBe('ca va bien merci');
  expect(normalize('Je m’appelle Léa.')).toBe("je m'appelle lea");
});

it('expands word-list entries into accepted forms', () => {
  expect(acceptedForms('enchanté(e)')).toEqual(['enchanté', 'enchantée']);
  expect(acceptedForms('hi / bye')).toEqual(['hi', 'bye']);
  expect(acceptedForms('et toi ?')).toEqual(['et toi ?']);
});

it('marks typed answers right, almost or wrong', () => {
  expect(checkTyped('Merci!', ['merci'])).toBe('right');
  expect(checkTyped('tres', ['très'])).toBe('almost');
  expect(checkTyped('au revior', ['au revoir'])).toBe('almost');
  expect(checkTyped('bonsoir', ['bonjour'])).toBe('wrong');
  expect(checkTyped('', ['merci'])).toBe('wrong');
  // Short words get no typo allowance: "bin" is not "bien".
  expect(checkTyped('bin', ['bien'])).toBe('wrong');
  expect(checkTyped('enchantee', acceptedForms('enchanté(e)'))).toBe('almost');
  // Wrong article or gender/plural ending is a real mistake, never a typo.
  expect(checkTyped('la livre', ['le livre'])).toBe('wrong');
  expect(checkTyped('une ami', ['un ami'])).toBe('wrong');
  expect(checkTyped('contente', ['content'])).toBe('wrong');
  expect(checkTyped('des stylo', ['des stylos'])).toBe('wrong');
  expect(checkTyped('le telephnoe', ['le téléphone'])).toBe('almost');
});

it('splits a sentence into word tiles without punctuation', () => {
  expect(sentenceTiles('Bonjour, je m’appelle Marc, et vous ?')).toEqual(['Bonjour', 'je', 'm’appelle', 'Marc', 'et', 'vous']);
  expect(sentenceTiles('Salut !')).toEqual(['Salut']);
});

it('reads word-list notation sensibly aloud', () => {
  // eslint-disable-next-line @typescript-eslint/no-require-imports
  const { speakable } = require('../src/services/audio') as typeof import('../src/services/audio');
  expect(speakable('il / elle parle')).toBe('il, elle parle');
  expect(speakable("j'ai … ans")).toBe("j'ai ans");
});
