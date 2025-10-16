import {
  FormValues,
  PROJECT_TYPE_OPTIONS,
  projectSchema,
  ROOM_OPTIONS,
} from '@/components/create-project/schema';
import { MediaPreview } from '@/components/media-preview';
import { Button } from '@/components/ui/button';
import { Text } from '@/components/ui/text';
import { useCreateProjectFormStore } from '@/store/useCreateProjectFormStore';
import { useTRPC } from '@/utils/trpc';
import { zodResolver } from '@hookform/resolvers/zod';
import { useMutation } from '@tanstack/react-query';
import { router } from 'expo-router';
import { useMemo, useState } from 'react';
import { Controller, useForm, useWatch } from 'react-hook-form';
import { ScrollView, View } from 'react-native';

export default function Review() {
  const trpc = useTRPC();
  const createProjectMutation = useMutation(trpc.project.createProject.mutationOptions());
  const createPresignedUrlMutation = useMutation(trpc.project.createPresignedUrl.mutationOptions());

  const { step1, step2, step3, reset } = useCreateProjectFormStore();

  const [mediaUrls, setMediaUrls] = useState<Record<string, string>>({});

  const { control, handleSubmit } = useForm<FormValues>({
    resolver: zodResolver(projectSchema),
    defaultValues: {
      ...(step1 ?? {}),
      ...(step2 ?? {}),
      ...(step3 ?? {}),
      summary: '',
    },
  });
  const roomsDetails = useWatch<FormValues, 'roomsDetails'>({ control, name: 'roomsDetails' });

  useMemo(() => {
    if (!roomsDetails?.length) return setMediaUrls({});
    const fetchUrls = async () => {
      const urls: Record<string, string> = {};
      for (let i = 0; i < roomsDetails.length; i++) {
        const detail = roomsDetails[i];
        if (!detail.media) continue;
        for (let j = 0; j < detail.media.length; j++) {
          const media = detail.media[j];
          const path = media.uri.split('/').pop() || '';
          const contentType = media.mediaType === 'VIDEO' ? 'video/*' : 'image/*';
          try {
            const { presignedUrl } = await createPresignedUrlMutation.mutateAsync({
              operation: 'get',
              path,
              contentType,
            });
            urls[`${i}-${j}`] = presignedUrl || media.uri;
          } catch {
            urls[`${i}-${j}`] = media.uri;
          }
        }
      }
      setMediaUrls(urls);
    };
    void fetchUrls();
  }, [roomsDetails]);

  const onSubmit = (data: FormValues) => {
    const transformedData = {
      ...data,
      roomsDetails: data.roomsDetails?.map((detail) => ({
        ...detail,
        media: detail.media || [],
      })),
    };
    createProjectMutation.mutate(transformedData, {
      onSuccess: () => {
        reset();
        router.push('/');
      },
      onError: (e) => console.error('Failed to create project:', e),
    });
  };

  const Card = ({ title, children }: { title: string; children: React.ReactNode }) => (
    <View className="mb-6 rounded-2xl bg-card p-5 shadow-sm">
      <Text className="mb-3 text-lg font-semibold">{title}</Text>
      {children}
    </View>
  );

  return (
    <ScrollView className="flex-1 p-5">
      {/* Unified Header */}
      <View className="mb-8 rounded-2xl bg-card p-5 shadow-sm">
        {/* Title and Subtitle */}
        <View className="mb-4">
          <Text className="text-3xl font-bold tracking-tight">🏗️ Request for Quote Summary</Text>
          <Text className="text-base text-muted-foreground">
            Review your renovation details before submitting for quotes.
          </Text>
        </View>

        {/* Inline Project Info */}
        <View className="mt-2 flex-row flex-wrap justify-between">
          {/* Project Type */}
          <View className="mb-3 mr-4">
            <Text className="text-sm font-medium text-foreground/80">Project Type</Text>
            <Controller
              control={control}
              name="type"
              render={({ field }) => {
                const type = PROJECT_TYPE_OPTIONS.find((opt) => opt.value === field.value);
                return (
                  <Text className="text-base font-semibold">{type?.label || 'Not specified'}</Text>
                );
              }}
            />
          </View>

          {/* Budget */}
          <View className="mb-3 mr-4">
            <Text className="text-sm font-medium text-foreground/80">Estimated Budget</Text>
            <Controller
              control={control}
              name="budgetRange"
              render={({ field }) =>
                field.value?.min && field.value?.max ? (
                  <Text className="text-base font-semibold">
                    ${field.value.min.toLocaleString()} – ${field.value.max.toLocaleString()}
                  </Text>
                ) : (
                  <Text className="text-base text-muted-foreground">Not specified</Text>
                )
              }
            />
          </View>

          {/* Start Date */}
          <View className="mb-3 mr-4">
            <Text className="text-sm font-medium text-foreground/80">Start Date</Text>
            <Controller
              control={control}
              name="startDate"
              render={({ field }) => (
                <Text className="text-base font-semibold">
                  {field.value ? new Date(field.value).toLocaleDateString() : 'Not specified'}
                </Text>
              )}
            />
          </View>

          {/* End Date */}
          <View className="mb-3">
            <Text className="text-sm font-medium text-foreground/80">End Date</Text>
            <Controller
              control={control}
              name="endDate"
              render={({ field }) => (
                <Controller
                  control={control}
                  name="endDateType"
                  render={({ field: typeField }) => (
                    <Text className="text-base font-semibold">
                      {field.value ? new Date(field.value).toLocaleDateString() : 'Not specified'}
                    </Text>
                  )}
                />
              )}
            />
          </View>
        </View>
      </View>

      {/* Room Details */}
      {roomsDetails?.map((detail, i) => {
        const roomLabel = ROOM_OPTIONS.find((opt) => opt.value === detail.room)?.label || 'Room';
        return (
          <Card key={i} title={`${roomLabel} Details`}>
            {detail.expectations ? (
              <>
                <Text className="font-medium">Expectations</Text>
                <Text className="mb-4 text-sm text-muted-foreground">{detail.expectations}</Text>
              </>
            ) : (
              <Text className="mb-4 text-sm text-muted-foreground">No expectations provided.</Text>
            )}
            {detail.media?.length ? (
              <>
                <Text className="mb-2 font-medium">Reference Photos</Text>
                <View className="flex-row flex-wrap gap-2">
                  {detail.media.map((m, j) => (
                    <MediaPreview
                      key={j}
                      uri={mediaUrls[`${i}-${j}`]}
                      mediaType={m.mediaType}
                      width={70}
                      height={70}
                    />
                  ))}
                </View>
              </>
            ) : (
              <Text className="text-sm text-muted-foreground">No media uploaded.</Text>
            )}
          </Card>
        );
      })}

      {/* Timeline and Notes were merged into the Project Summary header above */}

      {/* Submit */}
      <View className="mb-16 mt-10">
        <Button
          onPress={handleSubmit(onSubmit)}
          disabled={createProjectMutation.isPending}
          className="w-full rounded-xl shadow-md">
          <Text className="text-center font-semibold">
            {createProjectMutation.isPending ? 'Submitting...' : 'Submit Request for Quote'}
          </Text>
        </Button>
      </View>
    </ScrollView>
  );
}
