import 'react-native-gesture-handler';
import { useEffect, useState } from 'react';
import { Stack } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import { GestureHandlerRootView } from 'react-native-gesture-handler';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { QueryClientProvider } from '@tanstack/react-query';
import * as SplashScreen from 'expo-splash-screen';
import {
  useFonts,
  Roboto_500Medium,
  Roboto_600SemiBold,
  Roboto_700Bold,
  Roboto_800ExtraBold,
  Roboto_900Black,
} from '@expo-google-fonts/roboto';
import { queryClient } from '@/services/queryClient';
import { ensureSession } from '@/services/authService';
import { useSyncProfile } from '@/hooks/useSyncProfile';
import { AnimatedSplash } from '@/components/AnimatedSplash';
import { OfflineBanner } from '@/components/OfflineBanner';
import '@/i18n'; // initialize i18next + subscribe to appLanguage changes

SplashScreen.preventAutoHideAsync().catch(() => {});

// Kick off anonymous Supabase session as early as possible.
ensureSession().catch(() => {});

function ProfileSyncBoundary() {
  useSyncProfile();
  return null;
}

export default function RootLayout() {
  const [fontsLoaded, fontError] = useFonts({
    Roboto_500Medium,
    Roboto_600SemiBold,
    Roboto_700Bold,
    Roboto_800ExtraBold,
    Roboto_900Black,
  });
  const [splashDone, setSplashDone] = useState(false);

  useEffect(() => {
    if (fontsLoaded || fontError) {
      SplashScreen.hideAsync().catch(() => {});
    }
  }, [fontsLoaded, fontError]);

  if (!fontsLoaded && !fontError) {
    return null;
  }

  return (
    <GestureHandlerRootView style={{ flex: 1 }}>
      <SafeAreaProvider>
        <QueryClientProvider client={queryClient}>
          <ProfileSyncBoundary />
          <StatusBar style="auto" />
          <Stack screenOptions={{ headerShown: false }}>
            <Stack.Screen name="(auth)" />
            <Stack.Screen name="(tabs)" />
            <Stack.Screen name="conversation/[scenarioId]" />
            <Stack.Screen name="conversation/settings" options={{ presentation: 'modal' }} />
            <Stack.Screen name="drill/[scenarioId]" />
            <Stack.Screen name="grammar/[lessonId]" />
            <Stack.Screen name="review" />
            <Stack.Screen name="settings" />
          </Stack>
          {splashDone ? null : (
            <AnimatedSplash onDone={() => setSplashDone(true)} />
          )}
          {splashDone ? <OfflineBanner /> : null}
        </QueryClientProvider>
      </SafeAreaProvider>
    </GestureHandlerRootView>
  );
}
