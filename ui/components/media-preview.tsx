import { Image } from 'expo-image';
import { VideoView, useVideoPlayer } from 'expo-video';
import { useState } from 'react';
import { TouchableOpacity, View } from 'react-native';
import { Text } from './ui/text';

interface MediaPreviewProps {
  uri: string;
  mediaType: 'IMAGE' | 'VIDEO';
  width?: number;
  height?: number;
  className?: string;
}

export function MediaPreview({
  uri,
  mediaType,
  width = 100,
  height = 100,
  className = '',
}: MediaPreviewProps) {
  const [isPlaying, setIsPlaying] = useState(false);

  // Always create the player for video, but only use it if mediaType is VIDEO
  const player = useVideoPlayer(uri, (player) => {
    player.loop = false;
    player.muted = true;
  });

  if (mediaType === 'VIDEO') {
    const handlePress = () => {
      if (isPlaying) {
        player.pause();
        setIsPlaying(false);
      } else {
        player.play();
        setIsPlaying(true);
      }
    };

    return (
      <TouchableOpacity onPress={handlePress} className={className}>
        <View className="relative">
          <VideoView
            player={player}
            style={{ width, height }}
            contentFit="cover"
            allowsFullscreen={false}
            allowsPictureInPicture={false}
          />
          <View className="absolute inset-0 rounded bg-black/20" />
          <View className="absolute bottom-1 right-1 rounded bg-black/60 px-1 py-0.5">
            <Text className="text-xs text-white">▶</Text>
          </View>
        </View>
      </TouchableOpacity>
    );
  }

  return (
    <Image
      source={{ uri }}
      style={{ width, height }}
      contentFit="cover"
      className={`rounded ${className}`}
    />
  );
}
