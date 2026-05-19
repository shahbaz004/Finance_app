import { useEffect } from 'react';
import { Stack } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import * as SplashScreen from 'expo-splash-screen';
import { GestureHandlerRootView } from 'react-native-gesture-handler';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { useDatabase } from '../hooks/useDatabase';
import { useTheme } from '../hooks/useTheme';

SplashScreen.preventAutoHideAsync();

export default function RootLayout() {
  const { dbReady } = useDatabase();
  const { colors, isDark } = useTheme();

  useEffect(() => {
    if (dbReady) {
      SplashScreen.hideAsync();
    }
  }, [dbReady]);

  return (
    <GestureHandlerRootView style={{ flex: 1 }}>
      <SafeAreaProvider>
        <StatusBar style={isDark ? 'light' : 'dark'} />
        <Stack
          screenOptions={{
            headerStyle: { backgroundColor: colors.background },
            headerTintColor: colors.text,
            headerShadowVisible: false,
            contentStyle: { backgroundColor: colors.background },
            animation: 'slide_from_right',
          }}
        >
          <Stack.Screen name="index" options={{ headerShown: false }} />
          <Stack.Screen name="(auth)" options={{ headerShown: false }} />
          <Stack.Screen name="(tabs)" options={{ headerShown: false }} />
          <Stack.Screen name="lock" options={{ headerShown: false, presentation: 'fullScreenModal' }} />
          <Stack.Screen name="transaction/add" options={{ title: 'New Transaction', presentation: 'modal' }} />
          <Stack.Screen name="transaction/[id]" options={{ title: 'Edit Transaction' }} />
          <Stack.Screen name="account/index" options={{ title: 'Accounts' }} />
          <Stack.Screen name="account/[id]" options={{ title: 'Account' }} />
          <Stack.Screen name="reports" options={{ title: 'Reports & Analytics' }} />
        </Stack>
      </SafeAreaProvider>
    </GestureHandlerRootView>
  );
}
