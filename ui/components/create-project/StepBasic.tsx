import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Text } from '@/components/ui/text';
import React from 'react';
import { Control, FieldErrors, useController } from 'react-hook-form';
import { View } from 'react-native';
import { DateField } from '../ui/date-field';
import { FormValues } from './schema';

type Props = {
  control: Control<any>;
  errors: FieldErrors<any>;
};

export default function StepBasic({ control, errors }: Props) {
  const { field: nameField } = useController({ name: 'name', control });
  const { field: startField } = useController({ name: 'startDate', control });
  const { field: endField } = useController({ name: 'endDate', control });

  return (
    <>
      {/* Project Name */}
      <View className="gap-1.5 overflow-visible">
        <Label htmlFor="name">Project Name</Label>
        <Input
          id="name"
          placeholder="Enter project name"
          onBlur={nameField.onBlur}
          onChangeText={nameField.onChange}
          value={nameField.value ?? ''}
          className="h-16 p-3"
        />
        {errors?.name && (
          <Text className="text-sm text-destructive">{String(errors.name?.message)}</Text>
        )}
      </View>
      {/* Dates */}
      <DateField<FormValues, 'startDate'>
        label="Start Date"
        placeholder="Select start date"
        field={startField}
      />
      <DateField<FormValues, 'endDate'>
        label="End Date (Optional)"
        placeholder="Select end date"
        field={endField}
      />
    </>
  );
}
