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
    <Stack>
      {/* Screens only shown when the user is NOT signed in */}
      <Stack.Protected guard={!isSignedIn}>
        <Stack.Screen name="(auth)/sign-in" options={SIGN_IN_SCREEN_OPTIONS} />
        <Stack.Screen name="(auth)/sign-up" options={SIGN_UP_SCREEN_OPTIONS} />
        <Stack.Screen name="(auth)/reset-password" options={DEFAULT_AUTH_SCREEN_OPTIONS} />
        <Stack.Screen name="(auth)/forgot-password" options={DEFAULT_AUTH_SCREEN_OPTIONS} />
      </Stack.Protected>

      {/* Screens only shown when the user IS signed in */}
      <Stack.Protected guard={isSignedIn}>
        <Stack.Screen name="(protected)/index" options={PROTECTED_SCREEN_OPTIONS} />
        <Stack.Screen name="(protected)/about" options={PROTECTED_SCREEN_OPTIONS} />
        <Stack.Screen name="(protected)/create-project" options={CREATE_PROJECT_SCREEN_OPTIONS} />
        <Stack.Screen name="(protected)/projects/[id]" options={CREATE_PROJECT_SCREEN_OPTIONS} />
      </Stack.Protected>

      {/* Screens outside the guards are accessible to everyone (e.g. not found) */}

      <Stack.Screen name="(landing)/landing" options={{ headerShown: false }} />
    </Stack>
  );
}

const SIGN_IN_SCREEN_OPTIONS = {
  headerShown: false,
  title: 'Sign in',
};

const SIGN_UP_SCREEN_OPTIONS = {
  presentation: 'modal',
  title: '',
  headerTransparent: true,
  gestureEnabled: false,
} as const;

const DEFAULT_AUTH_SCREEN_OPTIONS = {
  title: '',
  headerShadowVisible: false,
  headerTransparent: true,
};

const PROTECTED_SCREEN_OPTIONS = {
  headerShown: false,
};

const CREATE_PROJECT_SCREEN_OPTIONS = {
  headerShown: false,
};
