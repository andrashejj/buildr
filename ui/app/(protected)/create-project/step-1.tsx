import { PROJECT_TYPE_OPTIONS, step1Schema, Step1Values } from '@/components/create-project/schema';
import { Button } from '@/components/ui/button';
import { Text } from '@/components/ui/text';
import { useCreateProjectFormStore } from '@/store/useCreateProjectFormStore';
import { zodResolver } from '@hookform/resolvers/zod';
import { useRouter } from 'expo-router';
import { Hammer } from 'lucide-react-native';
import { Controller, useForm } from 'react-hook-form';
import { ScrollView, TouchableOpacity, View } from 'react-native';

export default function Step1() {
  const router = useRouter();

  const step1 = useCreateProjectFormStore((s) => s.step1);
  const setData = useCreateProjectFormStore((s) => s.setData);

  const {
    control,
    handleSubmit,
    setValue,
    watch,
    formState: { errors },
  } = useForm<Step1Values>({
    resolver: zodResolver(step1Schema),
    mode: 'onBlur',
    defaultValues: {
      type: step1?.type ?? undefined,
    },
  });

  const selectedType = watch('type');

  const onSubmit = (data: Step1Values) => {
    setData({ step: 1, data });
    router.push('/create-project/step-2');
  };

  return (
    <ScrollView className="flex-1 p-4">
      <Text className="mb-4 text-lg font-bold">Choose Project Type</Text>
      <Controller
        control={control}
        name="type"
        render={({ field: { onChange, value } }) => (
          <View>
            {PROJECT_TYPE_OPTIONS.map((option) => (
              <TouchableOpacity
                key={option.value}
                onPress={() => {
                  onChange(option.value);
                  setValue('type', option.value);
                }}
                className={`mb-3 rounded-lg border p-4 ${selectedType === option.value ? 'border-primary bg-accent' : 'border-border'}`}>
                <View className="flex-row items-center">
                  <Hammer size={24} className="mr-3 text-2xl" />
                  <View className="flex-1">
                    <Text className="text-lg font-semibold">{option.label}</Text>
                    <Text className="mt-1 text-sm text-muted-foreground">{option.description}</Text>
                  </View>
                </View>
              </TouchableOpacity>
            ))}
          </View>
        )}
      />
      {errors.type && <Text className="mt-2 text-destructive">{errors.type.message}</Text>}

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
