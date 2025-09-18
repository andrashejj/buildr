import { ROOM_OPTIONS, step2Schema, Step2Values } from '@/components/create-project/schema';
import { Button } from '@/components/ui/button';
import { Text } from '@/components/ui/text';
import { useCreateProjectFormStore } from '@/store/useCreateProjectFormStore';
import { zodResolver } from '@hookform/resolvers/zod';
import { useRouter } from 'expo-router';
import { Controller, useForm } from 'react-hook-form';
import { ScrollView, TouchableOpacity, View } from 'react-native';

export default function Step2() {
  const router = useRouter();

  const step2 = useCreateProjectFormStore((s) => s.step2);
  const setData = useCreateProjectFormStore((s) => s.setData);

  const {
    control,
    handleSubmit,
    setValue,
    watch,
    formState: { errors },
  } = useForm<Step2Values>({
    resolver: zodResolver(step2Schema),
    mode: 'onBlur',
    defaultValues: {
      rooms: step2?.rooms ?? [],
    },
  });

  const selectedRooms = watch('rooms') || [];

  const onSubmit = (data: Step2Values) => {
    setData({ step: 2, data });
    router.push('/(protected)/create-project/step-3');
  };

  return (
    <ScrollView className="flex-1 p-4">
      <Text className="mb-4 text-lg font-bold">Select Rooms Involved</Text>
      <Controller
        control={control}
        name="rooms"
        render={({ field: { value } }) => (
          <View className="space-y-3">
            {ROOM_OPTIONS.map((option) => {
              const isSelected = selectedRooms.includes(option.value);
              return (
                <TouchableOpacity
                  key={option.value}
                  onPress={() => {
                    const current = value || [];
                    if (isSelected) {
                      setValue(
                        'rooms',
                        current.filter((r) => r !== option.value)
                      );
                    } else {
                      setValue('rooms', [...current, option.value]);
                    }
                  }}
                  className={`rounded-lg border p-4 ${
                    isSelected ? 'border-primary bg-accent' : 'border-border'
                  }`}>
                  <View className="flex-row items-center">
                    <Text className="mr-3 text-2xl">{isSelected ? '✅' : '🔨'}</Text>
                    <View className="flex-1">
                      <Text className="text-lg font-semibold">{option.label}</Text>
                      <Text className="mt-1 text-sm text-muted-foreground">
                        {option.description}
                      </Text>
                    </View>
                  </View>
                </TouchableOpacity>
              );
            })}
          </View>
        )}
      />
      {errors.rooms && <Text className="mt-2 text-destructive">{errors.rooms.message}</Text>}

      <View className="mt-6 flex-row gap-2">
        <Button variant="secondary" onPress={() => router.back()} className="flex-1">
          <Text>Back</Text>
        </Button>
        <Button className="flex-1" onPress={handleSubmit(onSubmit)}>
          <Text>Next</Text>
        </Button>
      </View>
    </ScrollView>
  );
}
