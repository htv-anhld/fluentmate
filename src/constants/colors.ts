export const Colors = {
  light: {
    background: '#FFFFFF',
    text: '#0B0B0F',
    primary: '#3B5BFF',
    accent: '#FF6B6B',
    muted: '#8E8E93',
    surface: '#F4F4F7',
  },
  dark: {
    background: '#0B0B0F',
    text: '#F2F2F7',
    primary: '#7A8FFF',
    accent: '#FF8585',
    muted: '#9A9AA0',
    surface: '#1C1C20',
  },
} as const;

export type ColorScheme = keyof typeof Colors;
