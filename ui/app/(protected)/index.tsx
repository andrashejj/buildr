import { Button } from '@/components/ui/button';
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { Icon } from '@/components/ui/icon';
import { Text } from '@/components/ui/text';
import { UserMenu } from '@/components/user-menu';
import { useTRPC } from '@/utils/trpc';
import { useUser } from '@clerk/clerk-expo';
import { useQuery } from '@tanstack/react-query';
import { format } from 'date-fns';
import { Link, router } from 'expo-router';
import { MoonStarIcon, SunIcon, XIcon } from 'lucide-react-native';
import { useColorScheme } from 'nativewind';
import React from 'react';
import { Image, type ImageStyle, ScrollView, View } from 'react-native';

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

export default function WelcomePage() {
  const { colorScheme } = useColorScheme();
  const { user } = useUser();

  const trpc = useTRPC();
  const projects = useQuery(trpc.project.getProjects.queryOptions());

  return (
    <ScrollView className="top-safe flex-1">
      <View
        accessibilityRole="header"
        className="w-full flex-row items-center justify-between bg-background px-4 py-3">
        <ThemeToggle />
        <UserMenu />
      </View>
      <View className="flex-1 items-center justify-center gap-8 p-4">
        <View className="flex-row items-center justify-center gap-3.5">
          <Image
            source={CLERK_LOGO[colorScheme ?? 'light']}
            resizeMode="contain"
            style={LOGO_STYLE}
          />
          <Icon as={XIcon} className="mr-1 size-5" />
          <Image source={LOGO[colorScheme ?? 'light']} style={LOGO_STYLE} resizeMode="contain" />
        </View>
        <View className="max-w-sm gap-2 px-4">
          <Text variant="h1" className="text-3xl font-medium">
            Hi {user?.firstName || 'there'}, welcome to buildr, the place to realize your dreams.
          </Text>
          <Text className="ios:text-foreground text-center font-mono text-sm text-muted-foreground">
            Let us build something amazing together.
          </Text>
        </View>
        <View className="gap-2">
          <Link href="/about" asChild>
            <Button size="sm">
              <Text>Learn about buildr</Text>
            </Button>
          </Link>
          <Link href="/create-project" asChild>
            <Button size="sm" variant="outline">
              <Text>Create Project</Text>
            </Button>
          </Link>
        </View>

        {/* Projects list (show as cards when available) */}
        {projects.data && projects.data.length > 0 && (
          <ScrollView contentContainerStyle={{ paddingVertical: 12 }} className="w-full px-4">
            {projects.data.map((project) => {
              const safeDate = (date?: string | Date | number | null): string => {
                if (!date) return '';
                try {
                  const d =
                    typeof date === 'string' || typeof date === 'number' ? new Date(date) : date;
                  if (!(d instanceof Date) || isNaN(d.getTime())) return String(date);
                  return format(d, 'yyyy-MM-dd');
                } catch (e: unknown) {
                  console.error('Error formatting date', e);
                  return String(date);
                }
              };

              const startStr = safeDate(project.startDate);
              const endStr = project.endDate ? safeDate(project.endDate) : '';

              return (
                <Card key={project.id} className="mb-4 w-full max-w-sm">
                  <CardHeader className="flex-row">
                    <View className="flex-1 gap-1.5">
                      <CardTitle>{project.name}</CardTitle>
                      <CardDescription>
                        {project.type} • {project.size ?? 'unspecified'}
                      </CardDescription>
                    </View>
                  </CardHeader>
                  <CardContent>
                    <Text className="text-sm text-muted-foreground">
                      {startStr}
                      {endStr ? ` — ${endStr}` : ''}
                    </Text>
                  </CardContent>
                  <CardFooter className="flex-row">
                    <Button size="sm" onPress={() => router.push(`/projects/${project.id}`)}>
                      <Text>Open</Text>
                    </Button>
                  </CardFooter>
                </Card>
              );
            })}
          </ScrollView>
        )}
      </View>
    </ScrollView>
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
