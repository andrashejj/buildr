import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Text } from '@/components/ui/text';
import { useTRPC } from '@/utils/trpc';
import { zodResolver } from '@hookform/resolvers/zod';
import { useMutation } from '@tanstack/react-query';
import { format } from 'date-fns';
import { router } from 'expo-router';
import { useState } from 'react';
import { Controller, useForm } from 'react-hook-form';
import { Alert, TouchableOpacity, View } from 'react-native';
import ActionSheet, { SheetManager } from 'react-native-actions-sheet';
import DateTimePickerModal from 'react-native-modal-datetime-picker';
import { z } from 'zod';

type FormData = z.infer<typeof schema>;

const PROJECT_TYPES = [
  'renovation',
  'paint job',
  'electrical',
  'plumbing',
  'landscaping',
  'roofing',
  'flooring',
  'kitchen remodel',
  'bathroom remodel',
  'other',
] as const;

const PROJECT_SIZES = ['small', 'medium', 'large'] as const;

const schema = z.object({
  name: z.string().min(1, 'Project name is required'),
  startDate: z.string().regex(/^\d{4}-\d{2}-\d{2}$/, 'Invalid date format (YYYY-MM-DD)'),
  endDate: z
    .string()
    .regex(/^\d{4}-\d{2}-\d{2}$/, 'Invalid date format (YYYY-MM-DD)')
    .optional(),
  size: z.enum(PROJECT_SIZES).optional(),
  type: z.enum(PROJECT_TYPES),
});

export function CreateProjectForm() {
  const trpc = useTRPC();
  const createProjectMutation = useMutation(trpc.project.createProject.mutationOptions({}));

  const [startDateObj, setStartDateObj] = useState(new Date());
  const [endDateObj, setEndDateObj] = useState<Date | null>(null);
  const [isStartPickerVisible, setStartPickerVisible] = useState(false);
  const [isEndPickerVisible, setEndPickerVisible] = useState(false);

  const {
    control,
    handleSubmit,
    setValue,
    watch,
    formState: { errors },
  } = useForm<FormData>({
    resolver: zodResolver(schema),
    mode: 'onBlur',
    defaultValues: {
      startDate: startDateObj.toISOString().split('T')[0],
    },
  });

  const selectedSize = watch('size');
  const selectedType = watch('type');

  const onSubmit = async (data: FormData) => {
    try {
      await createProjectMutation.mutateAsync(data);
      Alert.alert('Success', 'Project created successfully!');
      router.back();
    } catch (error) {
      Alert.alert('Error', 'Failed to create project. Please try again.');
      console.error(error);
    }
  };

  const openSizeActionSheet = () => {
    SheetManager.show('size-action-sheet');
  };

  const openTypeActionSheet = () => {
    SheetManager.show('type-action-sheet');
  };

  const selectSize = (size: (typeof PROJECT_SIZES)[number]) => {
    setValue('size', size);
    SheetManager.hide('size-action-sheet');
  };

  const selectType = (type: (typeof PROJECT_TYPES)[number]) => {
    setValue('type', type);
    SheetManager.hide('type-action-sheet');
  };

  const showStartDatePicker = () => setStartPickerVisible(true);
  const hideStartDatePicker = () => setStartPickerVisible(false);
  const handleConfirmStart = (date: Date) => {
    setStartDateObj(date);
    setValue('startDate', date.toISOString().split('T')[0]);
    hideStartDatePicker();
  };

  const showEndDatePicker = () => setEndPickerVisible(true);
  const hideEndDatePicker = () => setEndPickerVisible(false);
  const handleConfirmEnd = (date: Date) => {
    setEndDateObj(date);
    setValue('endDate', date.toISOString().split('T')[0]);
    hideEndDatePicker();
  };

  return (
    <>
      <Card className="mx-auto w-full max-w-md">
        <CardHeader>
          <CardTitle>Create New Project</CardTitle>
          <CardDescription>Fill in the details to create a new project.</CardDescription>
        </CardHeader>
        <CardContent className="gap-4">
          {/* Project name */}
          <View className="gap-1.5">
            <Label htmlFor="name">Project Name</Label>
            <Controller
              control={control}
              render={({ field: { onChange, onBlur, value } }) => (
                <Input
                  id="name"
                  placeholder="Enter project name"
                  onBlur={onBlur}
                  onChangeText={onChange}
                  value={value}
                />
              )}
              name="name"
            />
            {errors.name && (
              <Text className="text-sm font-medium text-destructive">{errors.name.message}</Text>
            )}
          </View>

          {/* Start date */}
          <View className="gap-1.5">
            <Label htmlFor="startDate">Start Date</Label>
            <TouchableOpacity
              onPress={showStartDatePicker}
              className="rounded-md border border-border bg-background p-3"
              activeOpacity={0.7}>
              <Text className="text-foreground">{format(startDateObj, 'yyyy-MM-dd')}</Text>
            </TouchableOpacity>
            <DateTimePickerModal
              isVisible={isStartPickerVisible}
              mode="date"
              onConfirm={handleConfirmStart}
              onCancel={hideStartDatePicker}
            />
            {errors.startDate && (
              <Text className="text-sm font-medium text-destructive">
                {errors.startDate.message}
              </Text>
            )}
          </View>

          {/* End date */}
          <View className="gap-1.5">
            <Label htmlFor="endDate">End Date (Optional)</Label>
            <TouchableOpacity
              onPress={showEndDatePicker}
              className="rounded-md border border-border bg-background p-3"
              activeOpacity={0.7}>
              <Text className="text-foreground">
                {endDateObj ? format(endDateObj, 'yyyy-MM-dd') : 'Select end date'}
              </Text>
            </TouchableOpacity>
            <DateTimePickerModal
              isVisible={isEndPickerVisible}
              mode="date"
              onConfirm={handleConfirmEnd}
              onCancel={hideEndDatePicker}
            />
            {errors.endDate && (
              <Text className="text-sm font-medium text-destructive">{errors.endDate.message}</Text>
            )}
          </View>

          {/* Size */}
          <View className="gap-1.5">
            <Label htmlFor="size">Size (Optional)</Label>
            <TouchableOpacity onPress={openSizeActionSheet}>
              <View className="rounded-md border border-border bg-background p-3">
                <Text className={selectedSize ? 'text-foreground' : 'text-muted-foreground'}>
                  {selectedSize || 'Select size'}
                </Text>
              </View>
            </TouchableOpacity>
            {errors.size && (
              <Text className="text-sm font-medium text-destructive">{errors.size.message}</Text>
            )}
          </View>

          {/* Type */}
          <View className="gap-1.5">
            <Label htmlFor="type">Project Type</Label>
            <TouchableOpacity onPress={openTypeActionSheet}>
              <View className="rounded-md border border-border bg-background p-3">
                <Text className={selectedType ? 'text-foreground' : 'text-muted-foreground'}>
                  {selectedType || 'Select project type'}
                </Text>
              </View>
            </TouchableOpacity>
            {errors.type && (
              <Text className="text-sm font-medium text-destructive">{errors.type.message}</Text>
            )}
          </View>

          {/* Submit */}
          <Button
            className="mt-4 w-full"
            onPress={handleSubmit(onSubmit)}
            disabled={createProjectMutation.isPending}>
            <Text>{createProjectMutation.isPending ? 'Creating...' : 'Create Project'}</Text>
          </Button>
        </CardContent>
      </Card>

      {/* Action sheets */}
      <ActionSheet id="size-action-sheet">
        <View className="p-4">
          <Text className="mb-4 text-lg font-semibold">Select Project Size</Text>
          {PROJECT_SIZES.map((size) => (
            <TouchableOpacity
              key={size}
              onPress={() => selectSize(size)}
              className="border-b border-border py-3">
              <Text className="text-base">{size}</Text>
            </TouchableOpacity>
          ))}
          <TouchableOpacity
            onPress={() => SheetManager.hide('size-action-sheet')}
            className="mt-4 py-3">
            <Text className="text-base text-muted-foreground">Cancel</Text>
          </TouchableOpacity>
        </View>
      </ActionSheet>

      <ActionSheet id="type-action-sheet">
        <View className="p-4">
          <Text className="mb-4 text-lg font-semibold">Select Project Type</Text>
          {PROJECT_TYPES.map((type) => (
            <TouchableOpacity
              key={type}
              onPress={() => selectType(type)}
              className="border-b border-border py-3">
              <Text className="text-base">{type}</Text>
            </TouchableOpacity>
          ))}
          <TouchableOpacity
            onPress={() => SheetManager.hide('type-action-sheet')}
            className="mt-4 py-3">
            <Text className="text-base text-muted-foreground">Cancel</Text>
          </TouchableOpacity>
        </View>
      </ActionSheet>
    </>
  );
}
