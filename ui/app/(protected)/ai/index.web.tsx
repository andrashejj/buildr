import useDataStreamTranscriptions from '@/hooks/useDataStreamTranscriptions';
import { useTRPC } from '@/utils/trpc';
import { LiveKitRoom, useLocalParticipant, useParticipants } from '@livekit/components-react';
import { useQuery } from '@tanstack/react-query';
import React, { useCallback, useEffect, useState } from 'react';
import { Alert, Button, Text, View } from 'react-native';

export default function AiPlaygroundWeb() {
  const trpc = useTRPC();
  const {
    data: connectionDetails,
    isLoading,
    error,
  } = useQuery(trpc.livekit.createConnection.queryOptions());

  if (error) {
    return (
      <View className="flex-1 items-center justify-center">
        <Text className="text-base text-destructive">Error: {error.message}</Text>
      </View>
    );
  }

  if (isLoading || !connectionDetails?.participantToken || !connectionDetails?.serverUrl) {
    return (
      <View className="flex-1 items-center justify-center">
        <Text className="text-base text-foreground">Connecting to LiveKit...</Text>
      </View>
    );
  }

  return (
    <LiveKitRoom
      serverUrl={connectionDetails.serverUrl}
      token={connectionDetails.participantToken}
      connect>
      <RoomView />
    </LiveKitRoom>
  );
}

const RoomView = () => {
  const participants = useParticipants();
  const { localParticipant } = useLocalParticipant() || {};

    const transcriptionState = useDataStreamTranscriptions()

  console.log(
    '🚀 ~ RoomView(web) ~ transcriptionState:',
    transcriptionState.transcriptions
  )


  const [isTogglingMic, setIsTogglingMic] = useState(false);
  const [isMicrophoneEnabled, setIsMicrophoneEnabled] = useState(false);

  // Log participants whenever they change (supports array or Map-like collections)
  useEffect(() => {
    const list: any[] = [];
    if (!participants) return;
    if (Array.isArray(participants)) {
      list.push(...participants);
    } else if (typeof participants === 'object' && (participants as any).values) {
      list.push(...Array.from((participants as any).values()));
    }

    console.log('LiveKit participants:', list.map((p) => ({ id: p.identity ?? p.sid ?? p.name })));
  }, [participants]);

  // When the participant becomes available, turn microphone on immediately.
  useEffect(() => {
    if (!localParticipant) return;

    let mounted = true;
    const enable = async () => {
      try {
        // LocalParticipant from livekit should support setMicrophoneEnabled in the browser as well
        if (typeof localParticipant.setMicrophoneEnabled === 'function') {
          await localParticipant.setMicrophoneEnabled(true);
        }
        if (mounted) {
          setIsMicrophoneEnabled(true);
          console.log('Microphone enabled on join (web)');
        }
      } catch (err: unknown) {
        console.error('Failed to enable microphone on join (web)', err);
      }
    };

    enable();
    return () => {
      mounted = false;
    };
  }, [localParticipant]);

  const onMicClick = useCallback(async () => {
    if (isTogglingMic) return;
    setIsTogglingMic(true);
    try {
      if (localParticipant && typeof localParticipant.setMicrophoneEnabled === 'function') {
        await localParticipant.setMicrophoneEnabled(!isMicrophoneEnabled);
        setIsMicrophoneEnabled((v) => !v);
      } else {
        // Fallback to local state when localParticipant API isn't available
        setIsMicrophoneEnabled((v) => !v);
      }
    } catch (err: unknown) {
      const msg = (err as { message?: string })?.message ?? 'Unable to change microphone state.';
      Alert.alert('Microphone Error', msg);
    } finally {
      setIsTogglingMic(false);
    }
  }, [isTogglingMic, localParticipant, isMicrophoneEnabled]);

  return (
    <View className="flex-1 items-center justify-center px-4">
      <Text className="mb-3 text-2xl font-bold text-foreground">Voice Assistant Connected (Web)</Text>

      <Text className="mb-4 px-4 text-center text-base text-muted-foreground">
        Start speaking to interact with the AI assistant
      </Text>

      <View className="mb-4 w-full rounded-md bg-card p-4">
        <Text className="mb-2 text-sm text-foreground">
          Microphone: {isMicrophoneEnabled ? '🎤 ON' : '🔇 OFF'}
        </Text>
        <Text className="text-sm text-foreground">Participant ID: {localParticipant?.identity ?? 'Local'}</Text>
        {/* Show a simple list of participant identities */}
        {participants && (
          <View className="mt-3">
            <Text className="mb-1 text-sm font-semibold text-foreground">Room participants:</Text>
            {Array.isArray(participants)
              ? participants.map((p: any) => (
                  <Text key={p.sid ?? p.identity ?? p.name} className="text-sm text-foreground">
                    • {p.identity ?? p.name ?? p.sid}
                  </Text>
                ))
              : Array.from((participants as any).values()).map((p: any) => (
                  <Text key={p.sid ?? p.identity ?? p.name} className="text-sm text-foreground">
                    • {p.identity ?? p.name ?? p.sid}
                  </Text>
                ))}
          </View>
        )}
      </View>

      <View className="w-full">
        <Button accessibilityLabel="toggle-microphone" disabled={isTogglingMic} title={isTogglingMic ? '...' : isMicrophoneEnabled ? 'Mute' : 'Unmute'} onPress={onMicClick} />
      </View>
    </View>
  );
};
