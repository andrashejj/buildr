import env from '@/config/env';
import { createMedia, getMediaByProject } from '@/modules/media';
import { createMessage, getMessagesForProject } from '@/modules/message';
import { createOffer, getOffersForProject, updateOfferStatus } from '@/modules/offer';
import { createProject, getProjectById, getProjectsByUser } from '@/modules/project';
import { createRoom, getRoomsByProject } from '@/modules/room';
import { Prisma } from '@/prisma/generated';
import {
  EndDateTypeSchema,
  MediaCreateInputSchema,
  MediaTypeSchema,
  MessageCreateInputSchema,
  OfferCreateInputSchema,
  OfferUpdateInputSchema,
  OfferWhereUniqueInputSchema,
  ProjectTypeSchema,
  RoomCreateInputSchema,
  RoomTypeSchema,
} from '@/prisma/generated/zod';
import { put } from '@vercel/blob';
import { z } from 'zod';
import { protectedProcedure, router } from '..';

export const projectRouter = router({
  createProject: protectedProcedure
    .input(
      z.object({
        name: z.string(),
        startDate: z.coerce.date(),
        endDate: z.coerce.date().optional().nullable(),
        endDateType: z
          .lazy(() => EndDateTypeSchema)
          .optional()
          .nullable(),
        type: z.lazy(() => ProjectTypeSchema),
        rooms: z.array(RoomTypeSchema).optional(),
        roomsDetails: z
          .array(
            z.object({
              room: RoomTypeSchema,
              expectations: z.string().optional(),
              images: z
                .array(
                  z.object({
                    uri: z.string().min(1),
                    mediaType: MediaTypeSchema,
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
              mediaType: MediaTypeSchema,
            })
          )
          .optional(),
      })
    )
    .mutation(async ({ ctx, input }) => {
      const { roomsDetails, images, rooms, startDate, endDate, endDateType, ...rest } = input;
      console.log('Creating project with data:', input);

      const data: Prisma.ProjectCreateInput = {
        ...rest,
        startDate: new Date(startDate),
        endDate: endDate ? new Date(endDate) : null,
        endDateType,
        user: { connect: { id: ctx.user.id } },
        rooms: undefined,
        media: undefined,
      };

      // Prefer detailed room objects when provided
      if (roomsDetails && roomsDetails.length > 0) {
        data.rooms = {
          create: roomsDetails.map((roomDetail) => ({
            type: roomDetail.room,
            name: roomDetail.room.toLowerCase().replace('_', ' '),
            expectations: roomDetail.expectations,
            media: roomDetail.images
              ? {
                  create: roomDetail.images.map((image) => ({
                    url: image.uri,
                    type: image.mediaType,
                    uploadedBy: { connect: { id: ctx.user.id } },
                  })),
                }
              : undefined,
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

      // Handle project-level media
      if (images && images.length > 0) {
        data.media = {
          create: images.map((image) => ({
            url: image.uri,
            type: image.mediaType,
            uploadedBy: { connect: { id: ctx.user.id } },
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
  addMediaToProject: protectedProcedure
    .input(MediaCreateInputSchema)
    .mutation(async ({ input }) => {
      return await createMedia({ data: input });
    }),

  uploadMediaToProject: protectedProcedure
    .input(
      z.object({
        projectId: z.string().optional(),
        roomId: z.string().optional(),
        fileName: z.string(),
        fileData: z.string(), // base64
        mediaType: MediaTypeSchema,
      })
    )
    .mutation(async ({ ctx, input }) => {
      const { fileName, fileData, mediaType } = input;

      // Convert base64 to buffer
      const buffer = Buffer.from(fileData, 'base64');

      // Upload to Vercel Blob
      const blob = await put(fileName, buffer, {
        access: 'public',
        token: env.BLOB_READ_WRITE_TOKEN,
        addRandomSuffix: true,
      });

      return { url: blob.url, mediaType };
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
