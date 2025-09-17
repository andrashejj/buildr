import { Text } from '@/components/ui/text';
import React from 'react';
import { Control, FieldErrors, useController } from 'react-hook-form';
import { ScrollView, View } from 'react-native';
import OptionCard from './OptionCard';
import { FormValues, ROOM_TYPES, RoomType } from './schema';

type Props = {
  control: Control<FormValues>;
  errors?: FieldErrors<FormValues>;
};

export default function StepRooms({ control }: Props) {
  const { field: roomsField } = useController({ name: 'rooms', control });
  const { field: roomsDetailsField } = useController({ name: 'roomsDetails', control });

  const selectedRooms: RoomType[] = roomsField.value ?? [];

  const toggleRoom = (room: RoomType) => {
    const next = new Set(selectedRooms);
    if (next.has(room)) next.delete(room);
    else next.add(room);
    const nextArr = Array.from(next);
    roomsField.onChange(nextArr);

    // remove details for deselected room
    if (!next.has(room)) {
      const details = roomsDetailsField.value ?? [];
      roomsDetailsField.onChange(details.filter((d) => d.room !== room));
    }
  };

  return (
    <ScrollView contentContainerStyle={{ paddingBottom: 24 }}>
      <Text className="mb-2">Select room types</Text>
      <View className="flex-row flex-wrap gap-2">
        {ROOM_TYPES.map((room: RoomType) => (
          <OptionCard
            key={room}
            label={room.replace('_', ' ')}
            icon={room === 'BATHROOM' ? '🛁' : room === 'KITCHEN' ? '🍽️' : '📦'}
            selected={selectedRooms.includes(room)}
            onPress={() => toggleRoom(room)}
          />
        ))}
      </View>
    </ScrollView>
  );
}
