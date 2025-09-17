import { Card, CardContent, CardTitle } from '@/components/ui/card';
import { Text } from '@/components/ui/text';
import React from 'react';
import { TouchableOpacity, View } from 'react-native';

type Props = {
  label: string;
  icon?: React.ReactNode;
  selected?: boolean;
  onPress?: () => void;
  className?: string;
};

export default function OptionCard({ label, icon, selected, onPress, className }: Props) {
  return (
    <TouchableOpacity onPress={onPress} className={className ?? 'p-1'}>
      <Card className={`h-32 w-full ${selected ? 'ring-2 ring-primary' : ''}`}>
        <CardContent className="items-center justify-center">
          <View className="mb-2">{icon ?? <Text className="text-2xl">◻️</Text>}</View>
          <CardTitle className="text-center text-sm">{label}</CardTitle>
        </CardContent>
      </Card>
    </TouchableOpacity>
  );
}
