import { useColorScheme as useRNColorScheme } from 'react-native';
import { Colors, type ColorScheme } from '@/constants/colors';

export function useColorScheme(): ColorScheme {
  return (useRNColorScheme() ?? 'light') as ColorScheme;
}

export function useThemeColors() {
  return Colors[useColorScheme()];
}
