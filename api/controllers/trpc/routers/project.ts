import { createMedia, getMediaByProject } from '@/modules/media';
import { createMessage, getMessagesForProject } from '@/modules/message';
import { createOffer, getOffersForProject, updateOfferStatus } from '@/modules/offer';
import { createProject, getProjectById, getProjectsByUser } from '@/modules/project';
import { createRoom, getRoomsByProject } from '@/modules/room';
import { Prisma } from '@/prisma/generated';
import {
  EndDateTypeSchema,
  MediaCreateInputSchema,
  MessageCreateInputSchema,
  OfferCreateInputSchema,
  OfferUpdateInputSchema,
  OfferWhereUniqueInputSchema,
  ProjectTypeSchema,
  RoomCreateInputSchema,
  RoomTypeSchema,
} from '@/prisma/generated/zod';
import { getPresignedUrl } from '@tigrisdata/storage';
import { z } from 'zod';
import { protectedProcedure, router } from '..';
import env from '../../../config/env';

export const CreateProjectInputSchema = z.object({
  summary: z.string().min(1, 'Project summary is required'),
  startDate: z.coerce.date(),
  endDate: z.coerce.date().optional().nullable(),
  endDateType: z
    .lazy(() => EndDateTypeSchema)
    .optional()
    .nullable(),
  budgetRange: z
    .object({
      min: z.number().min(0, 'Minimum budget must be at least 0'),
      max: z.number().min(0, 'Maximum budget must be at least 0'),
    })
    .optional()
    .refine((data) => !data || data.min <= data.max, {
      message: 'Minimum budget cannot exceed maximum budget',
    }),
  type: z.lazy(() => ProjectTypeSchema),
  rooms: z.array(RoomTypeSchema).optional(),
  roomsDetails: z
    .array(
      z.object({
        room: RoomTypeSchema,
        expectations: z.string().optional(),
        media: MediaCreateInputSchema.array(),
      })
    )
    .optional(),
});

export const projectRouter = router({
  createProject: protectedProcedure
    .input(CreateProjectInputSchema)
    .mutation(async ({ ctx, input }) => {
      const { roomsDetails, rooms, startDate, endDate, endDateType, ...rest } = input;
      console.log('Creating project with data:', input);

      const data: Prisma.ProjectCreateInput = {
        user: { connect: { id: ctx.user.id } },

        startDate: new Date(startDate),
        endDate: endDate ? new Date(endDate) : null,
        endDateType,

        budgetMin: input.budgetRange?.min,
        budgetMax: input.budgetRange?.max,

        rooms: undefined,
        ...rest,
      };

      // Prefer detailed room objects when provided
      if (roomsDetails && roomsDetails.length > 0) {
        data.rooms = {
          create: roomsDetails.map((roomDetail) => ({
            type: roomDetail.room,
            name: roomDetail.room.toLowerCase().replace('_', ' '),
            expectations: roomDetail.expectations,
            media: {
              create: roomDetail.media.map((mediaItem) => ({
                uri: mediaItem.uri,
                fileName: mediaItem.fileName,
                type: mediaItem.type,
                uploadedBy: { connect: { id: ctx.user.id } },
              })),
            },
          })),
        };
      } else if (rooms && rooms.length > 0) {
        data.rooms = {
          create: rooms.map((roomType) => ({
            type: roomType,
            name: roomType.toLowerCase().replace('_', ' '),
          })),
        };
      }

      return await createProject({ data });
    }),

  getProjects: protectedProcedure.query(async ({ ctx }) => {
    return await getProjectsByUser({ userId: ctx.user.id });
  }),

  getProjectWithDetails: protectedProcedure
    .input(z.object({ id: z.string() }))
    .query(async ({ ctx, input }) => {
      return await getProjectById({ id: input.id, userId: ctx.user.id });
    }),

  // Rooms
  createRoom: protectedProcedure.input(RoomCreateInputSchema).mutation(async ({ input }) => {
    return await createRoom({ data: input });
  }),

  getRooms: protectedProcedure
    .input(z.object({ projectId: z.string() }))
    .query(async ({ input }) => {
      return await getRoomsByProject({ projectId: input.projectId });
    }),

  // Media
  createPresignedUrl: protectedProcedure
    .input(
      z.object({ path: z.string(), contentType: z.string(), operation: z.enum(['put', 'get']) })
    )
    .mutation(async ({ input }) => {
      try {
        const uuidFileName = `${crypto.randomUUID()}-${input.path}`;
        const result = await getPresignedUrl(
          input.operation === 'put' ? uuidFileName : input.path,
          {
            operation: input.operation,
            expiresIn: 3600, // 1 hour
            config: {
              bucket: env.TIGRIS.BUCKET_NAME,
              accessKeyId: env.TIGRIS.AWS_ACCESS_KEY_ID,
              secretAccessKey: env.TIGRIS.AWS_SECRET_ACCESS_KEY,
            },
          }
        );

        return { presignedUrl: result.data?.url };
      } catch (error) {
        console.error('Error generating presigned URL:', error);
        throw new Error('Failed to generate presigned URL');
      }
    }),

  createPresignedUrls: protectedProcedure
    .input(
      z.object({
        files: z.array(z.object({ path: z.string(), contentType: z.string() })),
        operation: z.enum(['put', 'get']),
      })
    )
    .mutation(async ({ input }) => {
      const results = await Promise.all(
        input.files.map((file) =>
          getPresignedUrl(file.path, {
            operation: input.operation,
            expiresIn: 3600, // 1 hour
          })
        )
      );
      return results;
    }),

  addMediaToProject: protectedProcedure
    .input(MediaCreateInputSchema)
    .mutation(async ({ input }) => {
      return await createMedia({ data: input });
    }),

  getMediaByProject: protectedProcedure
    .input(z.object({ projectId: z.string() }))
    .query(async ({ input }) => {
      return await getMediaByProject({ projectId: input.projectId });
    }),

  // Messages
  sendMessage: protectedProcedure
    .input(MessageCreateInputSchema)
    .mutation(async ({ ctx, input }) => {
      // Validate that message has either text or attachments, but not both
      const hasText = input.body && input.body.trim().length > 0;
      const hasAttachments = !!input.attachments;

      if (!hasText && !hasAttachments) {
        throw new Error('Message must contain either text or attachments');
      }

      if (hasText && hasAttachments) {
        throw new Error('Message cannot have both text and attachments');
      }

      return await createMessage({
        data: input,
      });
    }),

  getProjectMessages: protectedProcedure
    .input(z.object({ projectId: z.string() }))
    .query(async ({ input }) => {
      return await getMessagesForProject({ projectId: input.projectId });
    }),

  // Offers
  createOffer: protectedProcedure.input(OfferCreateInputSchema).mutation(async ({ ctx, input }) => {
    return await createOffer({ data: input });
  }),

  getOffers: protectedProcedure
    .input(z.object({ projectId: z.string() }))
    .query(async ({ input }) => {
      return await getOffersForProject({ projectId: input.projectId });
    }),

  updateOfferStatus: protectedProcedure
    .input(z.object({ where: OfferWhereUniqueInputSchema, data: OfferUpdateInputSchema }))
    .mutation(async ({ input }) => {
      return await updateOfferStatus({ where: input.where, data: input.data });
    }),
});
