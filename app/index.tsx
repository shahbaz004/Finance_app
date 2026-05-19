import { useEffect } from 'react';
import { View, ActivityIndicator } from 'react-native';
import { router } from 'expo-router';
import { useAppStore } from '../store/useAppStore';
import { useTheme } from '../hooks/useTheme';

export default function Entry() {
  const { user, isLoading, dbReady } = useAppStore();
  const { colors } = useTheme();

  useEffect(() => {
    if (!dbReady || isLoading) return;

    if (!user || !user.onboardingComplete) {
      router.replace('/(auth)/onboarding');
    } else if (user.pinHash || user.biometricsEnabled) {
      router.replace('/lock');
    } else {
      router.replace('/(tabs)');
    }
  }, [dbReady, isLoading, user]);

  return (
    <View style={{ flex: 1, alignItems: 'center', justifyContent: 'center', backgroundColor: colors.background }}>
      <ActivityIndicator size="large" color={colors.primary} />
    </View>
  );
}
