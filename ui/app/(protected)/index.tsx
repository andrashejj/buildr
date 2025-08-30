import { Button } from '@/components/ui/button';
import { Icon } from '@/components/ui/icon';
import { Text } from '@/components/ui/text';
import { UserMenu } from '@/components/user-menu';
import { useUser } from '@clerk/clerk-expo';
import { Link, Stack } from 'expo-router';
import { MoonStarIcon, SunIcon } from 'lucide-react-native';
import { useColorScheme } from 'nativewind';
import React from 'react';
import { type ImageStyle, View } from 'react-native';
import { AppTRPCProvider } from '../../utils/trpc';

const LOGO = {
  light: require('@/assets/images/react-native-reusables-light.png'),
  dark: require('@/assets/images/react-native-reusables-dark.png'),
};

const CLERK_LOGO = {
  light: require('@/assets/images/clerk-logo-light.png'),
  dark: require('@/assets/images/clerk-logo-dark.png'),
};

const LOGO_STYLE: ImageStyle = {
  height: 36,
  width: 40,
};

const SCREEN_OPTIONS = {
  header: () => (
    <View className="top-safe absolute left-0 right-0 flex-row justify-between px-4 py-2 web:mx-2">
      <ThemeToggle />
      <UserMenu />
    </View>
  ),
};

// query client and trpc provider are provided by `AppTRPCProvider`

function Screen() {
  const { user } = useUser();

  return (
    <>
      <Stack.Screen options={SCREEN_OPTIONS} />
      <View className="flex-1 items-center justify-center gap-8 bg-gradient-to-br from-primary to-secondary p-4">
        <View className="max-w-sm gap-4 px-4">
          <Text className="text-center text-4xl font-bold text-foreground dark:text-primary-foreground">
            Welcome to Buildr
          </Text>
          <Text className="text-center text-lg text-foreground/90 dark:text-primary-foreground/90">
            Realize your home project dreams with ease.
          </Text>
          <Text className="text-center text-base text-foreground/80 dark:text-primary-foreground/80">
            From precise room measurements to creating ideal layouts, selecting perfect furniture,
            and guiding you through the building process – we've got you covered every step of the
            way.
          </Text>
        </View>
        <View className="gap-2">
          <Link href="/capture" asChild>
            <Button size="lg" className="bg-primary">
              <Text className="font-semibold text-primary-foreground">Get Started</Text>
            </Button>
          </Link>
        </View>
      </View>
    </>
  );
}

export default function App() {
  return (
    <AppTRPCProvider>
      <Screen />
    </AppTRPCProvider>
  );
}

const THEME_ICONS = {
  light: SunIcon,
  dark: MoonStarIcon,
};

function ThemeToggle() {
  const { colorScheme, toggleColorScheme } = useColorScheme();

  return (
    <Button onPress={toggleColorScheme} size="icon" variant="ghost" className="rounded-full">
      <Icon as={THEME_ICONS[colorScheme ?? 'light']} className="size-6" />
    </Button>
  );
}
