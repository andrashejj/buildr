import { Button } from '@/components/ui/button';
import { Text } from '@/components/ui/text';
import * as ImagePicker from 'expo-image-picker';
import React from 'react';
import { Control, FieldErrors, useController, useWatch } from 'react-hook-form';
import { Image, ScrollView, TextInput, View } from 'react-native';
import type { RoomType } from './schema';

type RoomDetailsItem = {
  room: RoomType;
  expectations?: string;
  images?: any[];
};

type Props = {
  control: Control<any>;
  room: RoomType;
  errors?: FieldErrors<any>;
};

export default function StepRoomDetails({ control, room, errors }: Props) {
  const { field: roomsDetailsField } = useController({ name: 'roomsDetails', control });

  const [isDragActive, setIsDragActive] = React.useState(false);

  const details: RoomDetailsItem[] =
    useWatch({ control, name: 'roomsDetails' }) ?? roomsDetailsField.value ?? [];
  const current = details.find((d: RoomDetailsItem) => d.room === room);

  const setExpectations = (text: string) => {
    const next = details.slice();
    const idx = next.findIndex((d: RoomDetailsItem) => d.room === room);
    if (idx === -1) {
      next.push({ room, expectations: text, images: current?.images ?? [] });
    } else {
      next[idx] = { ...(next[idx] ?? {}), expectations: text };
    }
    roomsDetailsField.onChange(next);
  };

  async function requestMediaPermission(): Promise<boolean> {
    const { granted } = await ImagePicker.requestMediaLibraryPermissionsAsync();
    return granted;
  }

  async function pickMediaLocal() {
    const granted = await requestMediaPermission();
    if (!granted) return [];
    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.All,
      allowsMultipleSelection: true,
      quality: 0.7,
    });
    if ('canceled' in result && result.canceled) return [];
    const assets = 'assets' in result ? result.assets : [];
    return assets.map((a) => ({ uri: a.uri, mediaType: a.type === 'video' ? 'video' : 'image' }));
  }

  const handlePickRoomImages = async () => {
    const assets = await pickMediaLocal();
    if (assets.length === 0) return;
    const details = roomsDetailsField.value ?? [];
    const existing = details.find((d: RoomDetailsItem) => d.room === room);
    const nextImages = [...(existing?.images ?? []), ...assets];
    const nextDetails: RoomDetailsItem[] = existing
      ? details.map((d: RoomDetailsItem) => (d.room === room ? { ...d, images: nextImages } : d))
      : [...details, { room, images: nextImages }];
    roomsDetailsField.onChange(nextDetails);
  };

  // Web drag & drop support: convert dropped File objects to temporary object URLs
  const handleDragOver = React.useCallback((e: any) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragActive(true);
  }, []);

  const handleDragLeave = React.useCallback((e: any) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragActive(false);
  }, []);

  const handleDrop = React.useCallback(
    async (e: any) => {
      e.preventDefault();
      e.stopPropagation();
      setIsDragActive(false);
      const dt = e.dataTransfer;
      if (!dt) return;
      const files: File[] = Array.from(dt.files || []);
      if (files.length === 0) return;

      // Create simple assets using object URLs (works on web). Native platforms won't reach here.
      const droppedAssets = files.map((f) => {
        const uri = typeof window !== 'undefined' && 'URL' in window ? URL.createObjectURL(f) : '';
        const fileType = f.type ?? '';
        const mediaType = fileType.startsWith('video') ? 'video' : 'image';
        return { uri, mediaType };
      });

      const details = roomsDetailsField.value ?? [];
      const existing = details.find((d: RoomDetailsItem) => d.room === room);
      const nextImages = [...(existing?.images ?? []), ...droppedAssets];
      const nextDetails: RoomDetailsItem[] = existing
        ? details.map((d: RoomDetailsItem) => (d.room === room ? { ...d, images: nextImages } : d))
        : [...details, { room, images: nextImages }];
      roomsDetailsField.onChange(nextDetails);
    },
    [room, roomsDetailsField]
  );

  // Attach web drag/drop listeners to the DOM element when running in browser
  const nativeId = `room-drop-${room}`;
  React.useEffect(() => {
    if (typeof window === 'undefined') return;
    const el = document.getElementById(nativeId);
    if (!el) return;

    const onDragOver = (ev: Event) => handleDragOver(ev);
    const onDragLeave = (ev: Event) => handleDragLeave(ev);
    const onDrop = (ev: Event) => {
      void handleDrop(ev);
    };

    el.addEventListener('dragover', onDragOver);
    el.addEventListener('dragleave', onDragLeave);
    el.addEventListener('drop', onDrop);

    return () => {
      el.removeEventListener('dragover', onDragOver);
      el.removeEventListener('dragleave', onDragLeave);
      el.removeEventListener('drop', onDrop);
    };
  }, [nativeId, handleDragOver, handleDragLeave, handleDrop]);

  return (
    <ScrollView className="pb-6">
      <Text className="mb-2">Details for {room.replace('_', ' ')}</Text>

      <View className="mb-3">
        <Text className="mb-1 text-sm">Expectations / Notes</Text>
        <TextInput
          value={current?.expectations ?? ''}
          onChangeText={setExpectations}
          placeholder="Describe expectations for this room"
          className="min-h-[80px] rounded-md border border-muted-foreground/10 p-2"
          multiline
        />
      </View>

      <View>
        <View className="mb-2 flex-row items-center justify-between">
          <Text className="text-sm">Photos & Videos</Text>
          <Button size="sm" variant="outline" onPress={handlePickRoomImages}>
            <Text>Add</Text>
          </Button>
        </View>

        <View
          nativeID={nativeId}
          onStartShouldSetResponder={() => true}
          onResponderRelease={handlePickRoomImages}
          className={`flex-row flex-wrap ${isDragActive ? 'border-2 border-primary/60 bg-primary/5 p-2' : ''}`}>
          {(current?.images ?? []).map((asset) =>
            asset.mediaType === 'image' ? (
              <Image key={asset.uri} source={{ uri: asset.uri }} className="mb-2 mr-2 h-24 w-24" />
            ) : (
              <View
                key={asset.uri}
                className="mb-2 mr-2 h-24 w-24 items-center justify-center bg-foreground/10">
                <Text className="text-sm text-muted-foreground">Video</Text>
              </View>
            )
          )}
        </View>
      </View>
    </ScrollView>
  );
}
