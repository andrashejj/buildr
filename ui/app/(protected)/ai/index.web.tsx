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
import React, { useEffect, useMemo, useRef } from 'react';
import { Platform, ScrollView, Text, View } from 'react-native';
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
  const insets = useSafeAreaInsets();
  const { localParticipant } = useLocalParticipant();
  useIsSpeaking(localParticipant);

  const transcriptionState = useDataStreamTranscriptions();
  const participants = useParticipants();
  const { agent } = useVoiceAssistant();

  // Track whether we auto-muted the microphone so we don't unmute if user
  // (Microphone auto-mute behavior removed)

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

  // (Agent-driven mic toggling removed)

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
      // Subtract the top safe-area inset so the content area doesn't get hidden
      // under iOS Safari's address bar when it shrinks the viewport.
      return { maxHeight: 'calc(60vh - env(safe-area-inset-top, 12px))', overflow: 'auto' } as any;
    }
    return { maxHeight: 400 };
  }, []);

  // Compute content bottom padding that respects iOS safe area on web and native.
  // On web use CSS env(safe-area-inset-bottom) with a fallback, on native use the insets value.
  const contentPaddingBottom =
    Platform.OS === 'web' ? `calc(env(safe-area-inset-bottom, 0px) + 12px)` : insets.bottom + 12;

  return (
    <View
      className="flex-1 items-stretch justify-start bg-background px-5 pt-3"
      // Ensure the overall layout also respects the top and bottom safe areas so
      // buttons and content aren't hidden by the iOS address bar / home indicator.
      // On web we use CSS env() variables; on native we use the safe area insets.
      // Cast to `any` so TypeScript accepts the CSS env() string on web while allowing
      // a numeric value on native platforms.
      style={
        {
          paddingTop: Platform.OS === 'web' ? 'env(safe-area-inset-top, 12px)' : insets.top + 12,
          paddingBottom:
            Platform.OS === 'web' ? 'env(safe-area-inset-bottom, 12px)' : insets.bottom + 12,
        } as any
      }>
      <Text className="mb-4 text-xl font-bold text-foreground">Voice Assistant Connected</Text>
      <Text className="mb-8 px-5 text-center text-base text-muted-foreground">
        Start speaking to interact with the AI assistant
      </Text>

      <View className="mb-5 w-full rounded-lg bg-card p-4">
        {/* Microphone status removed */}

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

      {/* Microphone toggle removed */}

      <ScrollView
        ref={scrollRef}
        className="mt-5 w-full rounded-lg bg-background py-2"
        // Constrain the height so the list becomes scrollable on web and native.
        style={scrollStyle}
        // Allow nested scrolling in mobile/Android where supported
        nestedScrollEnabled={true}
        contentContainerStyle={{
          paddingHorizontal: 12,
          // Use the computed content padding which includes the safe-area inset on web/native
          // Cast to `any` for the same reason as above.
          paddingBottom: contentPaddingBottom as any,
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
