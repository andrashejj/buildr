import '@/global.css';

import { NAV_THEME } from '@/lib/theme';
import { env } from '@/utils/env';
import { ClerkProvider, useAuth } from '@clerk/clerk-expo';
import { ThemeProvider } from '@react-navigation/native';
import { PortalHost } from '@rn-primitives/portal';
import { Stack } from 'expo-router';
import * as SplashScreen from 'expo-splash-screen';
import { StatusBar } from 'expo-status-bar';
import { useColorScheme } from 'nativewind';
import * as React from 'react';
import { AppTRPCProvider } from '../utils/trpc';

export default function RootLayout() {
  const { colorScheme } = useColorScheme();

  return (
    <ClerkProvider publishableKey={env.EXPO_PUBLIC_CLERK_PUBLISHABLE_KEY}>
      <AppTRPCProvider>
        <ThemeProvider value={NAV_THEME[colorScheme ?? 'light']}>
          <StatusBar style={colorScheme === 'dark' ? 'light' : 'dark'} />
          <Routes />
          <PortalHost />
        </ThemeProvider>
      </AppTRPCProvider>
    </ClerkProvider>
  );
}

SplashScreen.preventAutoHideAsync();

function Routes() {
  const { isSignedIn, isLoaded } = useAuth();

  React.useEffect(() => {
    if (isLoaded) {
      SplashScreen.hideAsync();
    }
  }, [isLoaded]);

  if (!isLoaded) {
    return null;
  }

  return (
    <Stack screenOptions={{ headerShown: false }}>
      {/* Screens only shown when the user is NOT signed in */}
      <Stack.Protected guard={!isSignedIn}>
        <Stack.Screen name="(auth)/sign-in" />
        <Stack.Screen name="(auth)/sign-up" />
        <Stack.Screen name="(auth)/reset-password" />
        <Stack.Screen name="(auth)/forgot-password" />
      </Stack.Protected>

      {/* Screens only shown when the user IS signed in */}
      <Stack.Protected guard={isSignedIn}>
        <Stack.Screen name="(protected)/index" />
        <Stack.Screen name="(protected)/about" />
        <Stack.Screen name="(protected)/create-project" />
        <Stack.Screen name="(protected)/projects/[id]" />
      </Stack.Protected>

      {/* Screens outside the guards are accessible to everyone (e.g. not found) */}

      <Stack.Screen name="(landing)/landing" options={{ headerShown: false }} />
    </Stack>
  );
}
