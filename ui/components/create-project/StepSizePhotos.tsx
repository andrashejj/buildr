import { FormValues } from '@/components/create-project/schema';
import { Text } from '@/components/ui/text';
import * as ImagePicker from 'expo-image-picker';
import React from 'react';
import { Control, FieldErrors, useController } from 'react-hook-form';
import { Alert, Image, TouchableOpacity, View } from 'react-native';

type Props = {
  control: Control<any>;
  errors?: FieldErrors<any>;
};

async function requestMediaPermission(): Promise<boolean> {
  const { granted } = await ImagePicker.requestMediaLibraryPermissionsAsync();
  if (!granted) {
    Alert.alert('Permission required', 'Please allow access to photos.');
  }
  return granted;
}

function normalizeAssets(result: ImagePicker.ImagePickerResult) {
  if (result.canceled) return [];
  const assets = 'assets' in result ? result.assets : [];
  return assets.map((a) => ({ uri: a.uri, mediaType: a.type === 'video' ? 'video' : 'image' }));
}

async function pickMedia() {
  const granted = await requestMediaPermission();
  if (!granted) return [];
  const result = await ImagePicker.launchImageLibraryAsync({
    mediaTypes: ImagePicker.MediaTypeOptions.All,
    allowsMultipleSelection: true,
    quality: 0.7,
  });
  return normalizeAssets(result);
}

export default function StepSizePhotos({ control }: Props) {
  const { field: imagesField } = useController<FormValues, 'images'>({ name: 'images', control });

  const handlePickProjectImages = async () => {
    const assets = await pickMedia();
    if (assets.length === 0) return;
    imagesField.onChange([...(imagesField.value ?? []), ...assets]);
  };

  const selectedImages = imagesField.value ?? [];

  return (
    <>
      <Text className="mb-2 mt-4">Photos (Optional)</Text>
      <TouchableOpacity
        onPress={handlePickProjectImages}
        className="rounded-md border border-border bg-background p-3">
        <Text>Pick Images</Text>
      </TouchableOpacity>

      <View className="mt-2 flex-row flex-wrap">
        {selectedImages.map((asset) =>
          asset.mediaType === 'IMAGE' ? (
            <Image
              key={asset.uri}
              source={{ uri: asset.uri }}
              style={{ width: 80, height: 80, marginRight: 8, marginBottom: 8 }}
            />
          ) : (
            <View
              key={asset.uri}
              style={{
                width: 80,
                height: 80,
                marginRight: 8,
                marginBottom: 8,
                backgroundColor: '#111',
                alignItems: 'center',
                justifyContent: 'center',
              }}>
              <Text className="text-sm text-muted-foreground">Video</Text>
            </View>
          )
        )}
      </View>
    </>
  );
}
