import useDataStreamTranscriptions from '@/hooks/useDataStreamTranscriptions';
import { useTRPC } from '@/utils/trpc';
import {
  LiveKitRoom,
  RoomAudioRenderer,
  useIsSpeaking,
  useLocalParticipant,
} from '@livekit/components-react';
import { useQuery } from '@tanstack/react-query';
import React, { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { Alert, ScrollView, Text, TouchableOpacity, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
export default function AiAdmin() {
  const insets = useSafeAreaInsets();
  const trpc = useTRPC();
  const {
    data: connectionDetails,
    isLoading,
    error,
  } = useQuery(trpc.livekit.createConnection.queryOptions());

  if (error) {
    return (
      <View className="flex-1" style={{ paddingTop: insets.top }}>
        <View className="flex-1 items-center justify-center">
          <Text className="text-base text-destructive">Error: {error.message}</Text>
        </View>
      </View>
    );
  }

  if (isLoading || !connectionDetails?.participantToken || !connectionDetails.serverUrl) {
    return (
      <View className="flex-1" style={{ paddingTop: insets.top }}>
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
      {/* <ParticipantContext> */}
      <RoomView />
      {/* </ParticipantContext> */}
      <RoomAudioRenderer />
    </LiveKitRoom>
  );
}

const RoomView = () => {
  const { isMicrophoneEnabled, localParticipant } = useLocalParticipant();
  useIsSpeaking(localParticipant);

  const transcriptionState = useDataStreamTranscriptions();

  const sortedTranscriptions = useMemo(
    () =>
      [...transcriptionState.transcriptions].sort(
        (a, b) => a.segment.firstReceivedTime - b.segment.firstReceivedTime
      ),
    [transcriptionState.transcriptions]
  );

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

  const scrollRef = useRef<ScrollView | null>(null);

  useEffect(() => {
    if (!scrollRef.current) return;
    try {
      // react-native ScrollView has scrollToEnd
      // @ts-ignore
      scrollRef.current.scrollToEnd({ animated: true });
    } catch {
      // ignore if running on a platform without scrollToEnd
    }
  }, [sortedTranscriptions]);

  return (
    <View className="flex-1 items-stretch justify-start bg-background px-5 pt-3">
      <Text className="mb-4 text-xl font-bold text-foreground">Voice Assistant Connected</Text>
      <Text className="mb-8 px-5 text-center text-base text-muted-foreground">
        Start speaking to interact with the AI assistant
      </Text>

      <View className="mb-5 w-full rounded-lg bg-card p-4">
        <Text className="mb-2 text-sm text-card-foreground">
          Microphone: {isMicrophoneEnabled ? '🎤 ON' : '🔇 OFF'}
        </Text>
        <Text className="text-sm text-card-foreground">
          Participant ID: {localParticipant.identity || 'Unknown'}
        </Text>
      </View>

      <TouchableOpacity
        accessibilityLabel="toggle-microphone"
        accessible
        disabled={isTogglingMic}
        className={`items-center rounded-lg px-6 py-3 ${isMicrophoneEnabled ? 'bg-primary' : 'bg-destructive'} ${isTogglingMic ? 'opacity-60' : ''}`}
        onPress={onMicClick}>
        <Text className="text-base font-bold text-primary-foreground">
          {isTogglingMic ? '...' : isMicrophoneEnabled ? 'Mute' : 'Unmute'}
        </Text>
      </TouchableOpacity>

      <ScrollView
        ref={scrollRef}
        className="mt-5 w-full flex-1 rounded-lg bg-background py-2"
        contentContainerStyle={{
          paddingHorizontal: 12,
          paddingBottom: 12,
          flexGrow: 1,
          justifyContent: 'flex-end',
        }}
        keyboardShouldPersistTaps="handled">
        {sortedTranscriptions.map((t) => {
          const isAgent = !!t.identity && t.identity.startsWith('agent-');
          const speaker = isAgent ? 'Assistant' : 'User';
          const time = new Date(t.segment.firstReceivedTime).toLocaleTimeString();

          return (
            <View
              key={t.segment.id}
              className={`my-1.5 max-w-[90%] ${isAgent ? 'self-end' : 'self-start'}`}>
              <Text className="mb-1 text-xs text-muted-foreground">
                {speaker} · {time}
              </Text>
              <View className={`rounded-xl px-3 py-2 ${isAgent ? 'bg-secondary' : 'bg-accent'}`}>
                <Text className="text-sm text-card-foreground">{t.segment.text || '...'}</Text>
              </View>
            </View>
          );
        })}
      </ScrollView>
    </View>
  );
};

// styles removed — using NativeWind/Tailwind CSS variables and className utilities instead
