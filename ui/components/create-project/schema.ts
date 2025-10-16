import { z } from 'zod';

// Server enum values (Prisma) with user-facing labels
export const PROJECT_TYPE_OPTIONS = [
  {
    value: 'RENOVATION',
    label: 'renovation',
    description:
      'Complete home renovation projects including structural changes and modern updates.',
  },
  {
    value: 'PAINTING',
    label: 'paint job',
    description: 'Interior and exterior painting services for a fresh new look.',
  },
  {
    value: 'ELECTRICAL',
    label: 'electrical',
    description: 'Electrical installations, repairs, and upgrades for safety and functionality.',
  },
  {
    value: 'PLUMBING',
    label: 'plumbing',
    description: 'Plumbing repairs, installations, and maintenance for water systems.',
  },
  {
    value: 'OTHER',
    label: 'other',
    description: 'Custom projects not covered by the above categories.',
  },
] as const;

export const PROJECT_TYPES = ['RENOVATION', 'PAINTING', 'ELECTRICAL', 'PLUMBING', 'OTHER'] as const;

export const ROOM_TYPES = [
  'KITCHEN',
  'BATHROOM',
  'BEDROOM',
  'LIVING_ROOM',
  'DINING_ROOM',
  'GARAGE',
  'BASEMENT',
  'ATTIC',
  'OTHER',
] as const;

export const ROOM_OPTIONS = [
  {
    value: 'KITCHEN',
    label: 'Kitchen',
    description: 'The heart of the home for cooking and dining.',
  },
  { value: 'BATHROOM', label: 'Bathroom', description: 'Personal care and hygiene space.' },
  { value: 'BEDROOM', label: 'Bedroom', description: 'Rest and relaxation area.' },
  {
    value: 'LIVING_ROOM',
    label: 'Living Room',
    description: 'Main gathering and entertainment space.',
  },
  {
    value: 'DINING_ROOM',
    label: 'Dining Room',
    description: 'Dedicated area for meals and family time.',
  },
  { value: 'GARAGE', label: 'Garage', description: 'Vehicle storage and workshop area.' },
  {
    value: 'BASEMENT',
    label: 'Basement',
    description: 'Lower level storage or additional living space.',
  },
  { value: 'ATTIC', label: 'Attic', description: 'Upper level storage or potential living space.' },
  { value: 'OTHER', label: 'Other', description: 'Any other room or area not listed above.' },
] as const;

export const MEDIA_TYPES = ['IMAGE', 'VIDEO'] as const;

export const projectSchema = z.object({
  // Step 1 - Project Type
  type: z.enum(PROJECT_TYPES),

  // Step 2 - Project Scope
  rooms: z.array(z.enum(ROOM_TYPES)).optional(),

  // Step 3X - Details for each room
  roomsDetails: z
    .array(
      z.object({
        room: z.enum(ROOM_TYPES),
        expectations: z.string().optional(),
        media: z
          .array(
            z.object({
              fileName: z.string().min(1),
              uri: z.string().min(1, 'Media URI is required'),
              mediaType: z.enum(MEDIA_TYPES),
            })
          )
          .optional(),
      })
    )
    .optional(),

  // Step 4 - Timeline (start)
  startDate: z.string().regex(/^[0-9]{4}-[0-9]{2}-[0-9]{2}$/, 'Invalid date format (YYYY-MM-DD)'),
  endDate: z
    .string()
    .regex(/^[0-9]{4}-[0-9]{2}-[0-9]{2}$/, 'Invalid date format (YYYY-MM-DD)')
    .optional(),

  endDateType: z.enum(['FLEXIBLE', 'EXACT']).optional(),

  budgetRange: z
    .object({
      min: z.number().min(0, 'Minimum budget must be at least 0'),
      max: z.number().min(0, 'Maximum budget must be at least 0'),
    })
    .optional()
    .refine((data) => !data || data.min <= data.max, {
      message: 'Minimum budget cannot exceed maximum budget',
    }),

  // Step Review - Derived Info
  summary: z.string().min(1, 'Project summary is required'),
});

export type FormValues = z.infer<typeof projectSchema>;

export type ProjectType = FormValues['type'];
export type RoomType = NonNullable<FormValues['rooms']>[number];

export const step1Schema = projectSchema.pick({
  type: true,
});
export type Step1Values = z.infer<typeof step1Schema>;

export const step2Schema = projectSchema.pick({
  rooms: true,
});
export type Step2Values = z.infer<typeof step2Schema>;

export const step3Schema = projectSchema.pick({
  roomsDetails: true,
  startDate: true,
  endDate: true,
  endDateType: true,
});
export type Step3Values = z.infer<typeof step3Schema>;
