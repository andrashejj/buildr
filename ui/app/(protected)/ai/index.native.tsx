import { useTRPC } from '@/utils/trpc';
import {
  AudioSession,
  LiveKitRoom,
  registerGlobals,
  useIOSAudioManagement,
  useIsSpeaking,
  useLocalParticipant,
  useParticipants,
  useRoomContext,
} from '@livekit/react-native';
import { useQuery } from '@tanstack/react-query';
import React, { useCallback, useEffect, useState } from 'react';
import { Alert, Text, TouchableOpacity, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

// registerGlobals must be called prior to using LiveKit.
registerGlobals();

export default function AiAdmin() {
  const trpc = useTRPC();
  const insets = useSafeAreaInsets();

  // Start the audio session first.
  useEffect(() => {
    const start = async () => {
      await AudioSession.startAudioSession();
    };

    start();
    return () => {
      AudioSession.stopAudioSession();
    };
  }, []);

  const {
    data: connectionDetails,
    isLoading,
    error,
  } = useQuery(trpc.livekit.createConnection.queryOptions());

  if (error) {
    return (
      <View className="flex-1 bg-background" style={{ paddingTop: insets.top }}>
        <View className="flex-1 items-center justify-center">
          <Text className="text-base text-destructive">Error: {error.message}</Text>
        </View>
      </View>
    );
  }

  if (isLoading || !connectionDetails?.participantToken || !connectionDetails.serverUrl) {
    return (
      <View className="flex-1 bg-background" style={{ paddingTop: insets.top }}>
        <View className="flex-1 items-center justify-center">
          <Text className="text-base text-foreground">Connecting to LiveKit...</Text>
        </View>
      </View>
    );
  }

  return (
    <LiveKitRoom
      serverUrl={connectionDetails.serverUrl}
      token={connectionDetails.participantToken}
      connect={true}
      options={{
        adaptiveStream: false,
      }}
      audio={true}
      video={false}>
      <RoomView />
    </LiveKitRoom>
  );
}

const RoomView = () => {
  const room = useRoomContext();
  const participants = useParticipants();

  // Enable iOS audio management for proper audio routing
  useIOSAudioManagement(room, true);

  const { isMicrophoneEnabled, localParticipant } = useLocalParticipant();
  const isSpeaking = useIsSpeaking(localParticipant);

  // Toggle microphone on/off (async with error handling)
  const [isTogglingMic, setIsTogglingMic] = useState(false);
  const onMicClick = useCallback(async () => {
    if (!localParticipant) {
      console.warn('No local participant available to toggle microphone');
      return;
    }

    if (isTogglingMic) return;
    setIsTogglingMic(true);
    try {
      await localParticipant.setMicrophoneEnabled(!isMicrophoneEnabled);
      console.log('Microphone toggled:', !isMicrophoneEnabled);
    } catch (err: unknown) {
      console.error('Failed to toggle microphone', err);
      const msg =
        (err as { message?: string })?.message ??
        'Unable to change microphone state. Check permissions.';
      Alert.alert('Microphone Error', msg);
    } finally {
      setIsTogglingMic(false);
    }
  }, [isMicrophoneEnabled, localParticipant, isTogglingMic]);

  // When the participant becomes available, turn microphone on immediately.
  useEffect(() => {
    if (!localParticipant) return;

    let mounted = true;
    const enable = async () => {
      try {
        await localParticipant.setMicrophoneEnabled(true);
        if (mounted) console.log('Microphone enabled on join');
      } catch (err: unknown) {
        console.error('Failed to enable microphone on join', err);
      }
    };

    enable();
    return () => {
      mounted = false;
    };
  }, [localParticipant]);

  return (
    <View className="flex-1 items-center justify-center px-5">
      <Text className="mb-4 text-lg font-bold text-foreground">Voice Assistant Connected</Text>
      <Text className="mb-6 text-center text-base text-muted-foreground">
        Start speaking to interact with the AI assistant
      </Text>

      {/* Audio Status Indicator */}
      <View className="mb-5 w-full rounded-md bg-card p-4">
        <Text className="mb-2 text-sm text-foreground">
          Microphone: {isMicrophoneEnabled ? '🎤 ON' : '🔇 OFF'}
        </Text>
        <Text className="text-sm text-foreground">
          Participant ID: {localParticipant.identity || 'Unknown'}
        </Text>
      </View>

      {/* Microphone Control */}
      <TouchableOpacity
        accessibilityLabel="toggle-microphone"
        accessible
        disabled={isTogglingMic}
        className={
          `items-center rounded-md px-6 py-3 ` +
          (isMicrophoneEnabled ? 'bg-primary' : 'bg-destructive') +
          (isTogglingMic ? ' opacity-60' : '')
        }
        onPress={onMicClick}>
        <Text className="text-base font-bold text-white">
          {isTogglingMic ? '...' : isMicrophoneEnabled ? 'Mute' : 'Unmute'}
        </Text>
      </TouchableOpacity>
    </View>
  );
};
