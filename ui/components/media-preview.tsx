import { Image } from 'expo-image';
import { VideoView, useVideoPlayer } from 'expo-video';
import { useCallback, useEffect, useState } from 'react';
import { ActivityIndicator, TouchableOpacity, View } from 'react-native';
import { Text } from './ui/text';

// Example BlurHash placeholder you can pass via `placeholderBlurhash` prop
const blurhash =
  '|rF?hV%2WCj[ayj[a|j[az_NaeWBj@ayfRayfQfQM{M|azj[azf6fQfQfQIpWXofj[ayj[j[fQayWCoeoeaya}j[ayfQa{oLj?j[WVj[ayayj[fQoff7azayj[ayj[j[ayofayayayj[fQj[ayayj[ayfjj[j[ayjuayj[';

interface MediaPreviewProps {
  uri: string;
  mediaType: 'IMAGE' | 'VIDEO';
  width?: number;
  height?: number;
  className?: string;
}

type LoadState = 'idle' | 'loading' | 'ready' | 'error';

export function MediaPreview({
  uri,
  mediaType,
  width = 100,
  height = 100,
  className = '',
}: MediaPreviewProps) {
  const normalizedUri = uri?.trim() || '';
  const [loadState, setLoadState] = useState<LoadState>(normalizedUri ? 'loading' : 'idle');
  const [isPlaying, setIsPlaying] = useState(false);

  // Start loading whenever URI changes
  useEffect(() => {
    if (normalizedUri) {
      setLoadState('loading');
    } else {
      setLoadState('idle');
    }
  }, [normalizedUri]);

  // --- VIDEO ---
  const player = useVideoPlayer(normalizedUri, (p) => {
    p.loop = false;
    p.muted = true;
  });

  useEffect(() => {
    if (mediaType !== 'VIDEO' || !player) return;

    const handleStatus = (status: any) => {
      if (!status) return;
      if (status.error) {
        setLoadState('error');
      } else {
        setLoadState(status.isLoaded && !status.isBuffering ? 'ready' : 'loading');
      }
    };

    player.addListener('statusChange', handleStatus);
    return () => {
      try {
        player.removeListener('statusChange', handleStatus);
      } catch {
        // ignore if player already disposed
      }
    };
  }, [player, mediaType]);

  // reset playing when uri or mediaType changes
  useEffect(() => {
    setIsPlaying(false);
  }, [normalizedUri, mediaType]);

  const handlePress = useCallback(() => {
    if (mediaType !== 'VIDEO' || !player) return;
    setIsPlaying((prev) => {
      const next = !prev;
      try {
        if (next) player.play();
        else player.pause();
      } catch {
        // ignore playback errors
      }
      return next;
    });
  }, [mediaType, player]);

  // --- VIDEO RENDER ---
  if (mediaType === 'VIDEO') {
    return (
      <TouchableOpacity onPress={handlePress} className={className}>
        <View className="relative" style={{ width, height }}>
          <VideoView
            player={player}
            style={{ width, height }}
            contentFit="cover"
            allowsFullscreen={false}
            allowsPictureInPicture={false}
          />
          {loadState === 'loading' && (
            <View className="absolute inset-0 items-center justify-center bg-black/30">
              <ActivityIndicator size="small" color="#fff" />
            </View>
          )}
          {loadState === 'error' && (
            <View className="absolute inset-0 items-center justify-center bg-black/50">
              <Text className="text-sm text-white">Failed to load video</Text>
            </View>
          )}
          {loadState === 'ready' && (
            <View className="absolute bottom-1 right-1 rounded bg-black/60 px-1 py-0.5">
              <Text className="text-xs text-white">{isPlaying ? '⏸' : '▶'}</Text>
            </View>
          )}
        </View>
      </TouchableOpacity>
    );
  }

  // --- IMAGE RENDER ---
  return (
    <View style={{ width, height }} className={`overflow-hidden rounded ${className}`}>
      <Image
        source={{ uri: normalizedUri }}
        style={{ width, height }}
        contentFit="cover"
        placeholder={{ blurhash }}
        transition={1000}
        onLoadStart={() => setLoadState('loading')}
        onLoadEnd={() => setLoadState('ready')}
        onError={() => setLoadState('error')}
      />
      {loadState === 'loading' && (
        <View className="absolute inset-0 items-center justify-center bg-black/10">
          <ActivityIndicator size="small" />
        </View>
      )}
      {loadState === 'error' && (
        <View className="absolute inset-0 items-center justify-center bg-gray-200">
          <Text className="text-sm text-muted-foreground">Failed to load image</Text>
        </View>
      )}
    </View>
  );
}
