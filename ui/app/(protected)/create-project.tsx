import { useRouter } from 'expo-router';
import { useEffect } from 'react';
import { View } from 'react-native';

export default function CreateProjectPage() {
  const router = useRouter();

  useEffect(() => {
    // Redirect to the first step
    router.replace({ pathname: '/create-project/step-1' });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return <View className="flex-1 p-4" />;
}
