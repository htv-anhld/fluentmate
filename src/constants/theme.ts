import type { TextStyle, ViewStyle } from 'react-native';

export const colors = {
  blue: '#4A9FFF',
  blueDark: '#3B7FD9',
  blueLight: 'rgba(74,159,255,0.1)',
  blueBorder: 'rgba(74,159,255,0.2)',

  orange: '#FF8C42',
  orangeSoft: '#FFF3EA',
  orangeBorder: 'rgba(255,140,66,0.2)',

  green: '#4FC978',
  greenSoft: '#EDFBF2',

  red: '#FF6B6B',
  redSoft: '#FFF0F0',

  purple: '#9B7DFF',
  purpleLight: 'rgba(155,125,255,0.1)',

  ink: '#2D3142',
  ink2: '#545871',
  muted: '#9CA3B8',
  line: '#EEEEF2',
  bg: '#F5F6FA',
  card: '#FFFFFF',
} as const;

export type ColorToken = keyof typeof colors;

export const spacing = {
  xs: 4,
  sm: 8,
  md: 12,
  lg: 16,
  xl: 20,
  xxl: 24,
  xxxl: 32,
} as const;

export type Spacing = keyof typeof spacing;

export const radius = {
  xs: 8,
  sm: 12,
  md: 14,
  lg: 18,
  xl: 22,
  pill: 50,
} as const;

export type Radius = keyof typeof radius;

export const shadows = {
  sm: {
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.04,
    shadowRadius: 4,
    elevation: 1,
  },
  md: {
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.06,
    shadowRadius: 12,
    elevation: 3,
  },
} as const satisfies Record<string, ViewStyle>;

export type Shadow = keyof typeof shadows;

// Matches @expo-google-fonts/roboto naming convention.
// Load these in app/_layout.tsx via useFonts() before rendering.
export const fontFamily = {
  medium: 'Roboto_500Medium',
  semibold: 'Roboto_600SemiBold',
  bold: 'Roboto_700Bold',
  extrabold: 'Roboto_800ExtraBold',
  black: 'Roboto_900Black',
} as const;

export type FontFamily = keyof typeof fontFamily;

export const typography = {
  display: {
    fontFamily: fontFamily.black,
    fontSize: 26,
    fontWeight: '900',
  },
  h1: {
    fontFamily: fontFamily.black,
    fontSize: 24,
    fontWeight: '900',
  },
  h2: {
    fontFamily: fontFamily.extrabold,
    fontSize: 16,
    fontWeight: '800',
  },
  h3: {
    fontFamily: fontFamily.bold,
    fontSize: 15,
    fontWeight: '700',
  },
  body: {
    fontFamily: fontFamily.medium,
    fontSize: 14,
    fontWeight: '500',
  },
  small: {
    fontFamily: fontFamily.medium,
    fontSize: 12,
    fontWeight: '500',
  },
  caption: {
    fontFamily: fontFamily.semibold,
    fontSize: 11,
    fontWeight: '600',
  },
  micro: {
    fontFamily: fontFamily.bold,
    fontSize: 10,
    fontWeight: '700',
    letterSpacing: 0.8,
    textTransform: 'uppercase',
  },
} as const satisfies Record<string, TextStyle>;

export type TypographyVariant = keyof typeof typography;

const colorBgMap = {
  blue: 'blueLight',
  orange: 'orangeSoft',
  green: 'greenSoft',
  red: 'redSoft',
  purple: 'purpleLight',
} as const satisfies Partial<Record<ColorToken, ColorToken>>;

type TintableColor = keyof typeof colorBgMap;

export function colorBg(color: ColorToken): string {
  if (color in colorBgMap) {
    return colors[colorBgMap[color as TintableColor]];
  }
  return colors[color];
}

export const theme = {
  colors,
  spacing,
  radius,
  shadows,
  fontFamily,
  typography,
} as const;

export type Theme = typeof theme;
