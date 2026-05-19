import { useColorScheme } from 'react-native';
import { Colors } from '../constants/colors';
import { useAppStore } from '../store/useAppStore';

type ThemeColors = typeof Colors.light;

export function useTheme(): {
  colors: ThemeColors;
  isDark: boolean;
  scheme: 'light' | 'dark';
} {
  const systemScheme = useColorScheme();
  const user = useAppStore((s) => s.user);

  const theme = user?.theme ?? 'system';
  const systemResolved: 'light' | 'dark' =
    systemScheme === 'dark' ? 'dark' : 'light';
  const resolved: 'light' | 'dark' =
    theme === 'system' ? systemResolved : theme;

  return {
    colors: Colors[resolved] as ThemeColors,
    isDark: resolved === 'dark',
    scheme: resolved,
  };
}
