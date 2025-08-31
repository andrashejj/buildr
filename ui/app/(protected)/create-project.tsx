import { CreateProjectForm } from '@/components/create-project-form';
import { View } from 'react-native';

export default function CreateProjectPage() {
  return (
    <View className="flex-1 p-4">
      <CreateProjectForm />
    </View>
  );
}
