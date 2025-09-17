import type { FormValues } from '@/components/create-project/schema';
import { projectSchema } from '@/components/create-project/schema';
import StepBasic from '@/components/create-project/StepBasic';
import { Button } from '@/components/ui/button';
import { Text } from '@/components/ui/text';
import { useCreateProjectStore } from '@/store/createProjectStore';
import { DevTool } from '@hookform/devtools';
import { zodResolver } from '@hookform/resolvers/zod';
import { useRouter } from 'expo-router';
import { useForm } from 'react-hook-form';
import { View } from 'react-native';
import { z } from 'zod';

export default function Step0() {
  const router = useRouter();
  const { formData, updateForm } = useCreateProjectStore((s) => ({
    formData: s.formData,
    updateForm: s.updateForm,
  }));

  const step0Schema = projectSchema.pick({ name: true, startDate: true, endDate: true });
  type Step0Values = z.infer<typeof step0Schema>;

  const {
    control,
    handleSubmit,
    formState: { errors },
  } = useForm<Step0Values>({
    resolver: zodResolver(step0Schema),
    mode: 'onBlur',
    defaultValues: {
      name: formData?.name ?? '',
      startDate: formData?.startDate ?? new Date().toISOString().split('T')[0],
      endDate: formData?.endDate ?? undefined,
    },
  });

  const onSubmit = (data: Partial<FormValues>) => {
    updateForm(data);
    router.push({ pathname: '/create-project/step-1' });
  };

  return (
    <View className="flex-1 p-4">
      <Text className="text-lg font-bold">Basic</Text>
      <StepBasic control={control} errors={errors} />
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
