import useDataStreamTranscriptions from '@/hooks/useDataStreamTranscriptions';
import { useTRPC } from '@/utils/trpc';
import {
  LiveKitRoom,
  RoomAudioRenderer,
  useIsSpeaking,
  useLocalParticipant,
  useParticipants,
  useVoiceAssistant,
} from '@livekit/components-react';
import { useQuery } from '@tanstack/react-query';
import React, { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { Alert, ScrollView, Text, TouchableOpacity, View, Platform } from 'react-native';
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
  const participants = useParticipants();
  const { agent } = useVoiceAssistant();

  // Track whether we auto-muted the microphone so we don't unmute if user
  // intentionally muted it.
  const autoMutedRef = useRef<boolean>(false);
  const prevUserMicStateRef = useRef<boolean | null>(null);

  // Request microphone permission on mount but keep the mic muted initially.
  useEffect(() => {
    if (!localParticipant) return;
    let mounted = true;

    const requestPermissionAndMute = async () => {
      try {
        if (typeof navigator !== 'undefined' && (navigator as any).mediaDevices?.getUserMedia) {
          try {
            await (navigator as any).mediaDevices.getUserMedia({ audio: true });
            console.log('Microphone permission granted');
          } catch (e) {
            console.warn('Microphone permission denied or unavailable', e);
          }
        }

        // Ensure we start muted on join.
        await localParticipant.setMicrophoneEnabled(false);
        if (mounted) console.log('Microphone kept muted on join');
      } catch (err: unknown) {
        console.error('Failed to set microphone state on join', err);
      }
    };

    requestPermissionAndMute();

    return () => {
      mounted = false;
    };
  }, [localParticipant]);

  // Derive agent status: prefer an explicit status on the agent object, but
  // fall back to inferring from transcriptions. Expected statuses: 'Ready' | 'Thinking'
  const agentStatus = useMemo(() => {
    if (agent && (agent as any).status) return (agent as any).status as string;
    const list = transcriptionState?.transcriptions ?? [];
    const thinking = list.some((t: any) => t.identity === agent?.identity && !t.segment?.final);
    return thinking ? 'Thinking' : 'Ready';
  }, [agent, transcriptionState?.transcriptions]);

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

  // When the agent is 'Thinking', auto-mute the local mic; when it becomes 'Ready'
  // restore the mic only if we auto-muted earlier. This respects user's manual mute state.
  useEffect(() => {
    if (!localParticipant) return;

    const apply = async () => {
      try {
        if (agentStatus === 'Thinking') {
          if (isMicrophoneEnabled) {
            prevUserMicStateRef.current = isMicrophoneEnabled;
            autoMutedRef.current = true;
            await localParticipant.setMicrophoneEnabled(false);
            console.log('Auto-muted microphone while agent is Thinking');
          } else {
            autoMutedRef.current = false;
            prevUserMicStateRef.current = false;
          }
        } else {
          // agentStatus !== 'Thinking'
          if (autoMutedRef.current) {
            const shouldEnable = prevUserMicStateRef.current ?? true;
            if (shouldEnable && !isMicrophoneEnabled) {
              await localParticipant.setMicrophoneEnabled(true);
              console.log('Restored microphone after agent finished');
            }
            autoMutedRef.current = false;
            prevUserMicStateRef.current = null;
          }
        }
      } catch (err: unknown) {
        console.error('Error toggling microphone for agent status', err);
      }
    };

    apply();
  }, [agentStatus, localParticipant, isMicrophoneEnabled]);

  const scrollRef = useRef<any>(null);

  useEffect(() => {
    const el = scrollRef.current;
    if (!el) return;

    try {
      // react-native ScrollView has scrollToEnd
      if (typeof el.scrollToEnd === 'function') {
        el.scrollToEnd({ animated: true });
        return;
      }

      // react-native-web / DOM element fallback
      // If the ref points to an HTMLElement, scroll to its scrollHeight
      const node = el as unknown as HTMLElement;
      if (node && typeof node.scrollTo === 'function') {
        node.scrollTo({ top: node.scrollHeight, behavior: 'smooth' });
        return;
      }

      // final fallback: set scrollTop
      if (node && 'scrollHeight' in node) {
        // @ts-ignore
        node.scrollTop = node.scrollHeight;
      }
    } catch {
      // ignore
    }
  }, [sortedTranscriptions]);

  // Platform-aware scroll style: on web use viewport-height units, on native
  // use a numeric maxHeight so types align with React Native's expectations.
  const scrollStyle = useMemo(() => {
    if (Platform.OS === 'web') {
      return { maxHeight: '60vh', overflow: 'auto' } as any;
    }
    return { maxHeight: 400 };
  }, []);

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

        {/* Participant list */}
        <View className="mt-2">
          <Text className="mb-1 text-sm font-semibold text-card-foreground">Participants</Text>
          <Text className="text-sm text-card-foreground">
            You: {localParticipant?.identity || 'Unknown'}
          </Text>
          <Text className="text-sm text-card-foreground">
            Assistant: {agent?.identity || 'None'}
          </Text>

          {participants && participants.length > 0 && (
            <View className="mt-2">
              {participants
                .filter(
                  (p: any) =>
                    p.identity !== localParticipant?.identity && p.identity !== agent?.identity
                )
                .map((p: any) => (
                  <Text key={p.identity} className="text-sm text-card-foreground">
                    • {p.identity}
                  </Text>
                ))}
            </View>
          )}

          {/* Agent thinking indicator: infer from non-final agent transcription (no casting or non-existent flags) */}
          <Text className="mt-2 text-sm text-card-foreground">
            Agent status: {agentStatus === 'Thinking' ? '💭 Thinking...' : agentStatus}
          </Text>
        </View>
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
        className="mt-5 w-full rounded-lg bg-background py-2"
        // Constrain the height so the list becomes scrollable on web and native.
        style={scrollStyle}
        // Allow nested scrolling in mobile/Android where supported
        nestedScrollEnabled={true}
        contentContainerStyle={{
          paddingHorizontal: 12,
          paddingBottom: 12,
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
