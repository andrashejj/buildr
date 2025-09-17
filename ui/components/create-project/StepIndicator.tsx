import React from 'react';
import { View } from 'react-native';

type Props = {
  stepIndex: number;
  total: number;
};

export default function StepIndicator({ stepIndex, total }: Props) {
  const items = Array.from({ length: total }).map((_, i) => i);
  return (
    <View className="w-full flex-row items-center">
      {items.map((i) => (
        <View key={i} className="flex-1 flex-row items-center">
          {/* left connector (empty for first) */}
          {i > 0 ? <View className="h-[2px] flex-1 bg-muted" /> : <View className="flex-1" />}

          {/* circle */}
          <View className="mx-2 items-center justify-center">
            <View
              className={`h-4 w-4 items-center justify-center rounded-full ${i === stepIndex ? 'bg-primary' : 'bg-muted'}`}
            />
          </View>

          {/* right connector (empty for last) */}
          {i < total - 1 ? (
            <View className="h-[2px] flex-1 bg-muted" />
          ) : (
            <View className="flex-1" />
          )}
        </View>
      ))}
    </View>
  );
}
