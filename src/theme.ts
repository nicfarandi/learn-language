import { useMemo } from 'react';
import { Dimensions, useColorScheme } from 'react-native';

const light = {
  background: '#F7F8FB',
  card: '#FFFFFF',
  border: '#E1E5EE',
  text: '#16202F',
  textMuted: '#5D6B82',
  primary: '#2F5BEA',
  primaryText: '#FFFFFF',
  primaryMuted: '#E4EBFF',
  success: '#1E9E5A',
  successMuted: '#DDF5E8',
  danger: '#D2413A',
  dangerMuted: '#FBE3E1',
  warning: '#C98A00',
  warningMuted: '#FFF2D1',
  locked: '#B9C1CF',
};

export type Palette = typeof light;

const dark: Palette = {
  background: '#0F141C',
  card: '#18202B',
  border: '#2A3443',
  text: '#EEF2F8',
  textMuted: '#9AA7BB',
  primary: '#6E8DFF',
  primaryText: '#0F141C',
  primaryMuted: '#22304F',
  success: '#45C985',
  successMuted: '#173A29',
  danger: '#F0736C',
  dangerMuted: '#43211F',
  warning: '#F0BC4C',
  warningMuted: '#3D3218',
  locked: '#4A5566',
};

/** Scales a size by the screen's shorter side, so the layout looks the same on every phone. */
export function sz(n: number): number {
  const { width, height } = Dimensions.get('window');
  const factor = Math.min(1.25, Math.max(0.85, Math.min(width, height) / 400));
  return Math.round(n * factor);
}

export const spacing = { xs: sz(4), sm: sz(8), md: sz(12), lg: sz(16), xl: sz(24), xxl: sz(32) };
export const radius = { sm: sz(8), md: sz(12), lg: sz(18), pill: 999 };
export const typography = {
  small: sz(13),
  body: sz(16),
  large: sz(19),
  title: sz(24),
  hero: sz(30),
};
export const touchTarget = Math.max(48, sz(48));

export function usePalette(): Palette {
  return useColorScheme() === 'dark' ? dark : light;
}

export function useStyles<T>(factory: (palette: Palette) => T): T {
  const palette = usePalette();
  // The factory is a module-level function in every caller, so the palette is the only real input.
  // eslint-disable-next-line react-hooks/exhaustive-deps
  return useMemo(() => factory(palette), [palette]);
}
