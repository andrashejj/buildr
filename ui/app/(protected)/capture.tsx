import { Button } from '@/components/ui/button';
import { Text } from '@/components/ui/text';
import { Link, Stack } from 'expo-router';
import React from 'react';
import { View } from 'react-native';

const CAPTURE_SCREEN_OPTIONS = {
  title: 'Room Capture',
  headerBackTitle: 'Back',
};

function CaptureScreen() {
  return (
    <>
      <Stack.Screen options={CAPTURE_SCREEN_OPTIONS} />
      <View className="flex-1 items-center justify-center gap-8 bg-background p-4">
        <View className="max-w-sm gap-4 px-4">
          <Text className="text-center text-3xl font-bold text-foreground">Room Capture</Text>
          <Text className="text-center text-lg text-muted-foreground">
            Capture your room for accurate measurements and layout planning.
          </Text>
          <Text className="text-center text-base text-muted-foreground">
            This feature will use AR technology to scan your space. Coming soon with Viro
            integration.
          </Text>
        </View>
        <View className="gap-2">
          <Button
            size="lg"
            onPress={() => {
              // Placeholder for Viro AR capture
              console.log('Starting room capture...');
            }}>
            <Text className="text-center font-semibold">Start Capture</Text>
          </Button>
          <Link href="/" asChild>
            <Button size="sm" variant="outline">
              <Text className="text-center">Back to Home</Text>
            </Button>
          </Link>
        </View>
      </View>
    </>
  );
}

export default CaptureScreen;
