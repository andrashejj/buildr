import { Text } from '@/components/ui/text';
import React from 'react';
import { Image, View } from 'react-native';
import { FormValues, MediaAsset } from './schema';

type Props = {
  values: Partial<FormValues>;
};

export default function StepReview({ values }: Props) {
  return (
    <>
      <Text className="mb-2">Review</Text>
      <View className="py-2">
        <Text className="font-semibold">Name</Text>
        <Text>{values.name}</Text>
      </View>
      <View className="py-2">
        <Text className="font-semibold">Type</Text>
        <Text>{values.type}</Text>
      </View>
      <View className="py-2">
        <Text className="font-semibold">Start</Text>
        <Text>{values.startDate}</Text>
      </View>
      {values.endDate && (
        <View className="py-2">
          <Text className="font-semibold">End</Text>
          <Text>{values.endDate}</Text>
        </View>
      )}
      <View className="py-2">
        <Text className="font-semibold">Rooms</Text>
        <Text>{(values.rooms || []).join(', ')}</Text>
      </View>

      <View className="flex-row flex-wrap py-2">
        {(values.images || []).map((asset: MediaAsset) =>
          asset.mediaType === 'image' ? (
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
