import { Text } from '@/components/ui/text';
import React from 'react';
import { ControllerRenderProps, FieldValues, Path } from 'react-hook-form';
import { Platform, TouchableOpacity, View } from 'react-native';
import DateTimePickerModal from 'react-native-modal-datetime-picker';
import { Label } from './label';

type DateFieldProps<TFieldValues extends FieldValues, TName extends Path<TFieldValues>> = {
  label: string;
  placeholder: string;
  field: ControllerRenderProps<TFieldValues, TName>;
};

export function DateField<TFieldValues extends FieldValues, TName extends Path<TFieldValues>>({
  label,
  placeholder,
  field,
}: DateFieldProps<TFieldValues, TName>) {
  const [isVisible, setVisible] = React.useState(false);

  const value = field.value;
  const showValue = value || placeholder;

  return (
    <View className="mt-3 gap-1.5 overflow-visible">
      <Label>{label}</Label>
      {Platform.OS === 'web' ? (
        <input
          type="date"
          className="rounded-md border border-border bg-background p-3 text-foreground"
          value={value || ''}
          onChange={(e) => field.onChange(e.target.value || undefined)}
        />
      ) : (
        <>
          <TouchableOpacity
            onPress={() => setVisible(true)}
            className="rounded-md border border-border bg-background p-3">
            <Text className="text-foreground">{showValue}</Text>
          </TouchableOpacity>
          <DateTimePickerModal
            isVisible={isVisible}
            mode="date"
            onConfirm={(date) => {
              field.onChange(date.toISOString().split('T')[0]);
              setVisible(false);
            }}
            onCancel={() => setVisible(false)}
          />
        </>
      )}
    </View>
  );
}
