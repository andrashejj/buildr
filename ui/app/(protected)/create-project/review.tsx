import type { FormValues } from '@/components/create-project/schema';
import StepReview from '@/components/create-project/StepReview';
import { Button } from '@/components/ui/button';
import { Text } from '@/components/ui/text';
import { useCreateProjectStore } from '@/store/createProjectStore';
import { useRouter } from 'expo-router';
import { View } from 'react-native';

export default function Review() {
  const router = useRouter();
  const { formData } = useCreateProjectStore((s) => ({ formData: s.formData }));

  const onSubmit = async () => {
    // For now, just log and navigate back — replace with trpc submit if needed
    console.log('Submit', formData as FormValues);
    router.back();
  };

  return (
    <View className="flex-1 p-4">
      <Text className="text-lg font-bold">Review</Text>
      <View className="mt-4">
        <StepReview values={formData as FormValues} />
      </View>

      <View className="mt-4 flex-row gap-2">
        <Button variant="secondary" onPress={() => router.back()}>
          <Text>Back</Text>
        </Button>
        <Button className="ml-auto" onPress={onSubmit}>
          <Text>Create Project</Text>
        </Button>
      </View>
    </View>
  );
}
