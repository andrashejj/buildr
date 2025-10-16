import { PROJECT_TYPE_OPTIONS, ROOM_OPTIONS } from '@/components/create-project/schema';
import { MediaPreview } from '@/components/media-preview';
import { Button } from '@/components/ui/button';
import { Text } from '@/components/ui/text';
import { useTRPC } from '@/utils/trpc';
import { useQuery } from '@tanstack/react-query';
import { router, useLocalSearchParams } from 'expo-router';
import { ScrollView, View } from 'react-native';

export default function ProjectPage() {
  const { id } = useLocalSearchParams<{ id: string }>();

  const trpc = useTRPC();
  const {
    data: projectDetails,
    isLoading,
    error,
  } = useQuery(
    trpc.project.getProjectWithDetails.queryOptions({
      id,
    })
  );

  console.log('🚀 ~ ProjectPage ~ projectDetails:', projectDetails);

  if (isLoading) {
    return (
      <View className="flex-1 items-center justify-center p-4">
        <Text className="text-lg">Loading project details...</Text>
      </View>
    );
  }

  if (error) {
    return (
      <View className="flex-1 items-center justify-center p-4">
        <Text className="text-lg text-red-500">Error loading project: {error.message}</Text>
        <Button onPress={() => router.back()} className="mt-4">
          <Text>Go Back</Text>
        </Button>
      </View>
    );
  }

  if (!projectDetails) {
    return (
      <View className="flex-1 items-center justify-center p-4">
        <Text className="text-lg">Project not found</Text>
        <Button onPress={() => router.back()} className="mt-4">
          <Text>Go Back</Text>
        </Button>
      </View>
    );
  }

  const projectTypeOption = PROJECT_TYPE_OPTIONS.find((opt) => opt.value === projectDetails.type);

  return (
    <ScrollView className="flex-1 p-4">
      <Text className="mb-6 text-2xl font-bold">Project Details</Text>

      {/* Project Name */}
      <View className="mb-6 rounded-lg bg-accent p-4">
        <Text className="mb-2 text-lg font-semibold">Project Name</Text>
        <Text className="text-xl text-primary">{projectDetails.summary}</Text>
      </View>

      {/* Project Type */}
      <View className="mb-6 rounded-lg border border-border p-4">
        <Text className="mb-2 text-lg font-semibold">Project Type</Text>
        <Text className="text-base">{projectTypeOption?.label}</Text>
        <Text className="mt-1 text-sm text-muted-foreground">{projectTypeOption?.description}</Text>
      </View>

      {/* Timeline */}
      <View className="mb-6 rounded-lg border border-border p-4">
        <Text className="mb-2 text-lg font-semibold">Timeline</Text>
        <Text className="mb-1">
          Start Date: {new Date(projectDetails.startDate).toLocaleDateString()}
        </Text>
        {projectDetails.endDate && (
          <Text className="mb-1">
            End Date: {new Date(projectDetails.endDate).toLocaleDateString()}
          </Text>
        )}
        {projectDetails.endDateType && (
          <Text className="text-sm text-muted-foreground">
            End Date Type: {projectDetails.endDateType.toLowerCase()}
          </Text>
        )}
      </View>

      {/* Rooms */}
      {projectDetails.rooms && projectDetails.rooms.length > 0 && (
        <View className="mb-6">
          <Text className="mb-4 text-xl font-semibold">Rooms ({projectDetails.rooms.length})</Text>
          {projectDetails.rooms.map((room) => {
            const roomOption = ROOM_OPTIONS.find((opt) => opt.value === room.type);
            return (
              <View key={room.id} className="mb-4 rounded-lg border border-border p-4">
                <Text className="mb-2 text-lg font-semibold">{roomOption?.label || room.name}</Text>
                {room.expectations && (
                  <View className="mb-3">
                    <Text className="mb-1 font-medium">Expectations:</Text>
                    <Text className="text-sm text-muted-foreground">{room.expectations}</Text>
                  </View>
                )}
                {room.media && room.media.length > 0 ? (
                  <View className="mb-3">
                    <Text className="mb-2 font-medium">Media:</Text>
                    <View className="flex-row flex-wrap gap-2">
                      {room.media.map((media) => (
                        <MediaPreview
                          key={media.id}
                          uri={media.uri}
                          mediaType={media.type}
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
        </View>
      )}

      {/* Project Media */}
      {projectDetails.media && projectDetails.media.length > 0 && (
        <View className="mb-6">
          <Text className="mb-4 text-xl font-semibold">Project Media</Text>
          <View className="flex-row flex-wrap gap-2">
            {projectDetails.media.map((media) => (
              <MediaPreview
                key={media.id}
                uri={media.uri}
                mediaType={media.type}
                width={80}
                height={80}
              />
            ))}
          </View>
        </View>
      )}

      {/* Action Buttons */}
      <View className="mb-8 mt-6 flex-row gap-4">
        <Button onPress={() => router.back()} variant="outline" className="flex-1">
          <Text>Back</Text>
        </Button>
        <Button className="flex-1">
          <Text>Edit Project</Text>
        </Button>
      </View>
    </ScrollView>
  );
}
