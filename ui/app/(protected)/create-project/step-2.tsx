import type { FormValues } from '@/components/create-project/schema';
import { projectSchema } from '@/components/create-project/schema';
import StepRooms from '@/components/create-project/StepRooms';
import { Button } from '@/components/ui/button';
import { Text } from '@/components/ui/text';
import { useCreateProjectStore } from '@/store/createProjectStore';
import { DevTool } from '@hookform/devtools';
import { zodResolver } from '@hookform/resolvers/zod';
import { useRouter } from 'expo-router';
import { useForm } from 'react-hook-form';
import { View } from 'react-native';

export default function Step2() {
  const router = useRouter();
  const { formData, updateForm } = useCreateProjectStore((s) => ({
    formData: s.formData,
    updateForm: s.updateForm,
  }));

  const {
    control,
    handleSubmit,
    formState: { errors },
  } = useForm<FormValues>({
    resolver: zodResolver(projectSchema),
    mode: 'onBlur',
    defaultValues: {
      name: formData?.name,
      startDate: formData?.startDate,
      type: formData?.type,
      endDate: formData?.endDate,
      size: formData?.size,
      rooms: formData?.rooms,
      images: formData?.images,
      roomsDetails: formData?.roomsDetails,
    },
  });

  const onSubmit = (data: Partial<FormValues>) => {
    updateForm(data);
    router.push({ pathname: '/create-project/step-3' });
  };

  return (
    <View className="flex-1 p-4">
      <Text className="text-lg font-bold">Rooms</Text>
      <StepRooms control={control} errors={errors} />
      <DevTool control={control} />

      <View className="mt-4 flex-row gap-2">
        <Button variant="secondary" onPress={() => router.back()}>
          <Text>Back</Text>
        </Button>
        <Button className="ml-auto" onPress={handleSubmit(onSubmit)}>
          <Text>Next</Text>
        </Button>
      </View>
    </View>
  );
}
