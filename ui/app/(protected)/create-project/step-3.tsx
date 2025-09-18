import { ROOM_OPTIONS, step3Schema, Step3Values } from '@/components/create-project/schema';
import { Button } from '@/components/ui/button';
import { DateField } from '@/components/ui/date-field';
import { Text } from '@/components/ui/text';
import { useCreateProjectFormStore } from '@/store/useCreateProjectFormStore';
import { useTRPC } from '@/utils/trpc';
import { zodResolver } from '@hookform/resolvers/zod';
import { useMutation } from '@tanstack/react-query';
import * as ImagePicker from 'expo-image-picker';
import { useRouter } from 'expo-router';
import { Controller, useForm } from 'react-hook-form';
import { ScrollView, TextInput, TouchableOpacity, View } from 'react-native';

export default function Step3() {
  const router = useRouter();
  const trpc = useTRPC();

  const uploadMediaToProject = useMutation(trpc.project.uploadMediaToProject.mutationOptions());

  const step2 = useCreateProjectFormStore((s) => s.step2);
  const step3 = useCreateProjectFormStore((s) => s.step3);
  const setData = useCreateProjectFormStore((s) => s.setData);

  const selectedRooms = step2?.rooms ?? [];
  const existingRoomsDetails = step3?.roomsDetails ?? [];

  const {
    control,
    handleSubmit,
    watch,
    setValue,
    formState: { errors },
  } = useForm<Step3Values>({
    resolver: zodResolver(step3Schema),
    mode: 'onBlur',
    defaultValues: {
      roomsDetails: selectedRooms.map((room, index) => {
        const existing = existingRoomsDetails[index];
        return {
          room,
          expectations: existing?.expectations ?? '',
          media: existing?.media ?? [],
        };
      }),
      startDate: step3?.startDate ?? '',
      endDate: step3?.endDate ?? '',
      endDateType: step3?.endDateType ?? undefined,
      images: step3?.images ?? [],
    },
  });

  const roomsDetails = watch('roomsDetails') || [];

  const pickMedia = async (roomIndex: number) => {
    const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
    if (status !== 'granted') {
      alert('Permission to access media library is required!');
      return;
    }

    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.All,
      allowsMultipleSelection: true,
      quality: 1,
      base64: true,
    });

    if (!result.canceled) {
      const currentMedia = roomsDetails[roomIndex]?.media || [];
      const newMedia = result.assets.map((asset) => ({
        uri: asset.uri,
        mediaType: (asset.type?.toUpperCase() === 'VIDEO' ? 'VIDEO' : 'IMAGE') as 'IMAGE' | 'VIDEO',
        base64: asset.base64!,
        fileName: asset.fileName || `file_${Date.now()}`,
      }));
      setValue(`roomsDetails.${roomIndex}.media`, [...currentMedia, ...newMedia]);
    }
  };

  const onSubmit = async (data: Step3Values) => {
    try {
      console.log('Starting form submission with data:', data);

      // Upload media
      const uploadedRoomsDetails = await Promise.all(
        data.roomsDetails?.map(async (roomDetail) => {
          const uploadedMedia = await Promise.all(
            roomDetail.media?.map(async (media) => {
              console.log('Uploading media:', media.fileName);
              const result = await uploadMediaToProject.mutateAsync({
                fileName: media.fileName!,
                fileData: media.base64!,
                mediaType: media.mediaType,
              });
              return {
                uri: result.url,
                mediaType: result.mediaType,
                base64: undefined,
                fileName: undefined,
              };
            }) || []
          );
          return {
            ...roomDetail,
            media: uploadedMedia,
          };
        }) || []
      );

      const uploadedImages = await Promise.all(
        data.images?.map(async (image) => {
          console.log('Uploading image:', image.fileName);
          const result = await uploadMediaToProject.mutateAsync({
            fileName: image.fileName!,
            fileData: image.base64!,
            mediaType: image.mediaType,
          });
          return {
            uri: result.url,
            mediaType: result.mediaType,
            base64: undefined,
            fileName: undefined,
          };
        }) || []
      );

      console.log('Setting data and navigating...');
      setData({
        step: 3,
        data: { ...data, roomsDetails: uploadedRoomsDetails, images: uploadedImages },
      });
      router.push('/(protected)/create-project/review');
    } catch (error) {
      console.error('Error during form submission:', error);
      alert('An error occurred while saving your data. Please try again.');
    }
  };

  return (
    <ScrollView className="flex-1 p-4">
      <Text className="mb-4 text-lg font-bold">Room Details</Text>
      {selectedRooms.map((room, index) => {
        const roomOption = ROOM_OPTIONS.find((opt) => opt.value === room);
        const detail = roomsDetails[index] || { expectations: '', media: [] };
        return (
          <View key={room} className="mb-6 rounded-lg border border-border p-4">
            <Text className="mb-2 text-lg font-semibold">{roomOption?.label}</Text>
            <Controller
              control={control}
              name={`roomsDetails.${index}.expectations`}
              render={({ field: { onChange, value } }) => (
                <TextInput
                  value={value || ''}
                  onChangeText={onChange}
                  placeholder="Describe your expectations for this room"
                  multiline
                  numberOfLines={3}
                  className="mb-2 rounded border border-border p-2"
                />
              )}
            />
            <TouchableOpacity
              className="mb-2 rounded bg-muted p-2"
              onPress={() => pickMedia(index)}>
              <Text>Add Images or Videos for {roomOption?.label}</Text>
            </TouchableOpacity>
            <Text className="text-sm text-muted-foreground">
              Media: {detail.media?.length || 0} selected
            </Text>
          </View>
        );
      })}
      {errors.roomsDetails && (
        <Text className="mt-2 text-destructive">{errors.roomsDetails.message}</Text>
      )}

      {/* Timeline Section */}
      <View className="mt-6 rounded-lg border border-border p-4">
        <Text className="mb-4 text-lg font-semibold">Project Timeline</Text>

        <Controller
          control={control}
          name="startDate"
          render={({ field }) => (
            <DateField label="Start Date *" placeholder="Select start date" field={field} />
          )}
        />
        {errors.startDate && (
          <Text className="mt-1 text-destructive">{errors.startDate.message}</Text>
        )}

        <Controller
          control={control}
          name="endDate"
          render={({ field }) => (
            <DateField label="End Date (Optional)" placeholder="Select end date" field={field} />
          )}
        />
        {errors.endDate && <Text className="mt-1 text-destructive">{errors.endDate.message}</Text>}

        <Controller
          control={control}
          name="endDateType"
          render={({ field: { onChange, value } }) => (
            <View className="mt-3">
              <Text className="mb-2 text-sm font-medium">End Date Type (Optional)</Text>
              <View className="flex-row gap-2">
                {[
                  { value: 'FLEXIBLE', label: 'Flexible' },
                  { value: 'EXACT', label: 'Exact' },
                ].map((option) => (
                  <TouchableOpacity
                    key={option.value}
                    onPress={() => onChange(option.value)}
                    className={`flex-1 rounded-md border p-3 ${
                      value === option.value ? 'border-primary bg-accent' : 'border-border'
                    }`}>
                    <Text className="text-center text-sm">{option.label}</Text>
                  </TouchableOpacity>
                ))}
              </View>
            </View>
          )}
        />
      </View>

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
