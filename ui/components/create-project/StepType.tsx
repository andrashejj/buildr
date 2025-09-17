import { Label } from '@/components/ui/label';
import { Zap } from 'lucide-react-native';
import React from 'react';
import { Control, FieldErrors, useController } from 'react-hook-form';
import { ScrollView, View } from 'react-native';
import OptionCard from './OptionCard';
import type { FormValues } from './schema';
import { PROJECT_TYPE_OPTIONS } from './schema';

type Props = {
  control: Control<any>;
  errors?: FieldErrors<any>;
};

export default function StepType({ control }: Props) {
  const { field: typeField } = useController<FormValues, 'type'>({ name: 'type', control });

  return (
    <View className="mt-2">
      <Label>Project Type</Label>

      <ScrollView className="mt-3" contentContainerStyle={{ gap: 12 }}>
        <View className="flex-row flex-wrap justify-between">
          {PROJECT_TYPE_OPTIONS.map((opt) => {
            const isSelected = typeField.value === opt.value;
            return (
              <OptionCard
                key={opt.value}
                label={opt.label}
                icon={<Zap size={20} color={isSelected ? '#0ea5e9' : '#111827'} />}
                selected={isSelected}
                onPress={() => typeField.onChange(opt.value)}
                className="w-1/2 p-1"
              />
            );
          })}
        </View>
      </ScrollView>
    </View>
  );
}
