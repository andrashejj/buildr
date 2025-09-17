import { projectSchema } from '@/components/create-project/schema';
import StepRoomDetails from '@/components/create-project/StepRoomDetails';
import { Button } from '@/components/ui/button';
import { Text } from '@/components/ui/text';
import { useCreateProjectStore } from '@/store/createProjectStore';
import { DevTool } from '@hookform/devtools';
import { useRouter } from 'expo-router';
import { useForm } from 'react-hook-form';
import { View } from 'react-native';
import { z } from 'zod';

export default function Step3() {
  const router = useRouter();
  const { formData } = useCreateProjectStore((s) => ({ formData: s.formData }));

  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  const step3Schema = projectSchema.pick({ roomsDetails: true });
  type Step3Values = z.infer<typeof step3Schema>;

  const { control } = useForm<Step3Values>({
    defaultValues: { roomsDetails: formData?.roomsDetails ?? [] },
    mode: 'onBlur',
  });

  return (
    <View className="flex-1 p-4">
      <Text className="text-lg font-bold">Room Details</Text>
      <StepRoomDetails control={control} room={(formData.rooms ?? [])[0]} />
      <DevTool control={control} />

      <View className="mt-4 flex-row gap-2">
        <Button variant="secondary" onPress={() => router.back()}>
          <Text>Back</Text>
        </Button>
        <Button
          className="ml-auto"
          onPress={() => router.push({ pathname: '/create-project/step-4' })}>
          <Text>Next</Text>
        </Button>
      </View>
    </View>
  );
}
