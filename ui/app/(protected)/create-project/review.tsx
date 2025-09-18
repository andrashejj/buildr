import {
  FormValues,
  PROJECT_TYPE_OPTIONS,
  ROOM_OPTIONS,
  projectSchema,
} from '@/components/create-project/schema';
import { MediaPreview } from '@/components/media-preview';
import { Button } from '@/components/ui/button';
import { Text } from '@/components/ui/text';
import { useCreateProjectFormStore } from '@/store/useCreateProjectFormStore';
import { useTRPC } from '@/utils/trpc';
import { zodResolver } from '@hookform/resolvers/zod';
import { useMutation } from '@tanstack/react-query';
import { router } from 'expo-router';
import { useCallback, useEffect, useState } from 'react';
import { Controller, useForm } from 'react-hook-form';
import { ScrollView, View } from 'react-native';

// Placeholder AI function - replace with actual AI integration
const generateProjectName = async (data: Partial<FormValues>): Promise<string> => {
  await new Promise((resolve) => setTimeout(resolve, 1000));
  const type =
    PROJECT_TYPE_OPTIONS.find((opt) => opt.value === data.type)?.label || data.type || 'Custom';
  const roomCount = data.rooms?.length || 0;
  return `${type} Dream Project (${roomCount} rooms) ${Math.floor(Math.random() * 1000)}`;
};

export default function Review() {
  const { step1, step2, step3, setData } = useCreateProjectFormStore();
  const [isGenerating, setIsGenerating] = useState(false);

  const trpc = useTRPC();
  const createProjectMutation = useMutation(trpc.project.createProject.mutationOptions());

  // Use Partial<FormValues> casts so TypeScript accepts spreading store objects
  const { control, handleSubmit, setValue, watch } = useForm<FormValues>({
    resolver: zodResolver(projectSchema),
    defaultValues: {
      ...((step1 ?? {}) as Partial<FormValues>),
      ...((step2 ?? {}) as Partial<FormValues>),
      ...((step3 ?? {}) as Partial<FormValues>),
      name: '',
    } as Partial<FormValues>,
  });

  // Read form values via watch (typed according to FormValues)
  const nameValue = watch('name');
  const typeValue = watch('type');
  const startDate = watch('startDate');
  const endDate = watch('endDate');
  const endDateType = watch('endDateType');
  const selectedRooms = watch('rooms') ?? [];
  const roomsDetails = watch('roomsDetails') ?? [];

  const handleGenerateName = useCallback(async () => {
    const currentType = watch('type');
    if (!currentType) return;
    setIsGenerating(true);
    try {
      const name = await generateProjectName({ type: currentType, rooms: selectedRooms });
      setValue('name', name, { shouldValidate: true });
      setData({ step: 4, data: { name } });
    } catch (error) {
      console.error('Failed to generate name:', error);
      setValue('name', 'Custom Project', { shouldValidate: true });
      setData({ step: 4, data: { name: 'Custom Project' } });
    } finally {
      setIsGenerating(false);
    }
  }, [setValue, setData, watch, selectedRooms]);

  useEffect(() => {
    // Run once on mount to populate name
    handleGenerateName();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const onSubmit = (data: FormValues) => {
    console.log('Submitting project data:', data);
    createProjectMutation.mutate(data, {
      onSuccess: () => {
        console.log('Project created successfully!');
        router.push('/'); // Navigate to home or projects list
      },
      onError: (error) => {
        console.error('Failed to create project:', error);
      },
    });
  };

  // If you still want a fallback "no data" UX, check the watched fields:
  if (!typeValue && !nameValue && selectedRooms.length === 0) {
    return (
      <View className="flex-1 items-center justify-center p-4">
        <Text>No project data found</Text>
      </View>
    );
  }

  const projectTypeOption = PROJECT_TYPE_OPTIONS.find((opt) => opt.value === typeValue);

  return (
    <ScrollView className="flex-1 p-4">
      <Text className="mb-6 text-2xl font-bold">Project Review</Text>

      {/* Project Name */}
      <View className="mb-6 rounded-lg bg-accent p-4">
        <Text className="mb-2 text-lg font-semibold">Project Name</Text>
        <Controller
          control={control}
          name="name"
          render={({ field }) => (
            <Text className="text-xl text-primary">{field.value || 'Generating...'}</Text>
          )}
        />
        <Button
          onPress={handleGenerateName}
          disabled={isGenerating}
          className="mt-2"
          variant="outline">
          <Text>{isGenerating ? 'Generating...' : 'Regenerate Name'}</Text>
        </Button>
      </View>

      {/* Project Type */}
      <View className="mb-6 rounded-lg border border-border p-4">
        <Text className="mb-2 text-lg font-semibold">Project Type</Text>
        <Controller
          control={control}
          name="type"
          render={({ field }) => {
            const projectType = PROJECT_TYPE_OPTIONS.find((opt) => opt.value === field.value);
            return (
              <>
                <Text className="text-base">{projectType?.label}</Text>
                <Text className="mt-1 text-sm text-muted-foreground">
                  {projectType?.description}
                </Text>
              </>
            );
          }}
        />
      </View>

      {/* Selected Rooms */}
      <View className="mb-6 rounded-lg border border-border p-4">
        <Text className="mb-2 text-lg font-semibold">Selected Rooms ({selectedRooms.length})</Text>
        {selectedRooms.map((room) => {
          const roomOption = ROOM_OPTIONS.find((opt) => opt.value === room);
          return (
            <View key={room} className="mb-2">
              <Text className="font-medium">{roomOption?.label}</Text>
            </View>
          );
        })}
      </View>

      {/* Room Details */}
      {roomsDetails.map((detail, index) => {
        const roomOption = ROOM_OPTIONS.find((opt) => opt.value === detail.room);
        return (
          <View key={index} className="mb-6 rounded-lg border border-border p-4">
            <Text className="mb-2 text-lg font-semibold">{roomOption?.label} Details</Text>
            {detail.expectations && (
              <View className="mb-3">
                <Text className="mb-1 font-medium">Expectations:</Text>
                <Text className="text-sm text-muted-foreground">{detail.expectations}</Text>
              </View>
            )}
            {detail.media && detail.media.length > 0 ? (
              <View className="mb-3">
                <Text className="mb-2 font-medium">Media:</Text>
                <View className="flex-row flex-wrap gap-2">
                  {detail.media.map((media, mediaIndex) => (
                    <MediaPreview
                      key={mediaIndex}
                      uri={media.uri}
                      mediaType={media.mediaType}
                      width={60}
                      height={60}
                    />
                  ))}
                </View>
              </View>
            ) : (
              <Text className="text-sm text-muted-foreground">No media uploaded</Text>
            )}
          </View>
        );
      })}

      {/* Timeline (now read from form via watch — fixes the TS error) */}
      <View className="mb-6 rounded-lg border border-border p-4">
        <Text className="mb-2 text-lg font-semibold">Timeline</Text>
        <Text className="mb-1">Start Date: {startDate}</Text>
        {endDate && <Text className="mb-1">End Date: {endDate}</Text>}
        {endDateType && (
          <Text className="text-sm text-muted-foreground">End Date Type: {endDateType}</Text>
        )}
      </View>

      {/* Submit Button */}
      <View className="mb-8 mt-6">
        <Button
          onPress={handleSubmit(onSubmit)}
          disabled={createProjectMutation.isPending}
          className="w-full">
          <Text className="text-center">
            {createProjectMutation.isPending ? 'Creating Project...' : 'Create Project'}
          </Text>
        </Button>
      </View>
    </ScrollView>
  );
}
