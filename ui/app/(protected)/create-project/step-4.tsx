import type { FormValues } from '@/components/create-project/schema';
import { projectSchema } from '@/components/create-project/schema';
import StepSizePhotos from '@/components/create-project/StepSizePhotos';
import { Button } from '@/components/ui/button';
import { Text } from '@/components/ui/text';
import { useCreateProjectStore } from '@/store/createProjectStore';
import { DevTool } from '@hookform/devtools';
import { zodResolver } from '@hookform/resolvers/zod';
import { useRouter } from 'expo-router';
import { useForm } from 'react-hook-form';
import { View } from 'react-native';
import { z } from 'zod';

export default function Step4() {
  const router = useRouter();
  const { formData, updateForm } = useCreateProjectStore((s) => ({
    formData: s.formData,
    updateForm: s.updateForm,
  }));

  const step4Schema = projectSchema.pick({ size: true, images: true });
  type Step4Values = z.infer<typeof step4Schema>;

  const {
    control,
    handleSubmit,
    formState: { errors },
  } = useForm<Step4Values>({
    resolver: zodResolver(step4Schema),
    mode: 'onBlur',
    defaultValues: { size: formData?.size ?? undefined, images: formData?.images ?? [] },
  });

  const onSubmit = (data: Partial<FormValues>) => {
    updateForm(data);
    router.push({ pathname: '/create-project/review' });
  };

  return (
    <View className="flex-1 p-4">
      <Text className="text-lg font-bold">Size & Photos</Text>
      <StepSizePhotos control={control} errors={errors} />
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
