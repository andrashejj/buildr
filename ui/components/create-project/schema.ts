import { z } from 'zod';

// Server enum values (Prisma) with user-facing labels
export const PROJECT_TYPE_OPTIONS = [
  { value: 'RENOVATION', label: 'renovation' },
  { value: 'PAINTING', label: 'paint job' },
  { value: 'ELECTRICAL', label: 'electrical' },
  { value: 'PLUMBING', label: 'plumbing' },
  { value: 'OTHER', label: 'other' },
] as const;

export const PROJECT_TYPES = ['RENOVATION', 'PAINTING', 'ELECTRICAL', 'PLUMBING', 'OTHER'] as const;

export const PROJECT_SIZES = ['small', 'medium', 'large'] as const;

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

export const projectSchema = z.object({
  name: z.string().min(1, 'Project name is required'),
  startDate: z.string().regex(/^[0-9]{4}-[0-9]{2}-[0-9]{2}$/, 'Invalid date format (YYYY-MM-DD)'),
  endDate: z
    .string()
    .regex(/^[0-9]{4}-[0-9]{2}-[0-9]{2}$/, 'Invalid date format (YYYY-MM-DD)')
    .optional(),
  size: z.enum(PROJECT_SIZES).optional(),
  type: z.enum(PROJECT_TYPES),
  rooms: z.array(z.enum(ROOM_TYPES)).optional(),
  roomsDetails: z
    .array(
      z.object({
        room: z.enum(ROOM_TYPES),
        expectations: z.string().optional(),
        images: z
          .array(
            z.object({
              uri: z.string().min(1),
              mediaType: z.enum(['image', 'video']),
            })
          )
          .optional(),
      })
    )
    .optional(),
  images: z
    .array(
      z.object({
        uri: z.string().min(1),
        mediaType: z.enum(['image', 'video']),
      })
    )
    .optional(),
});

export type FormValues = z.infer<typeof projectSchema>;
export type MediaAsset = NonNullable<FormValues['images']>[number];
export type ProjectSize = FormValues['size'];
export type ProjectType = FormValues['type'];
export type RoomType = NonNullable<FormValues['rooms']>[number];
