import { createMedia, getMediaByProject } from '@/modules/media';
import { createMessage, getMessagesForProject } from '@/modules/message';
import { createOffer, getOffersForProject, updateOfferStatus } from '@/modules/offer';
import { createProject, getProjectById, getProjectsByUser } from '@/modules/project';
import { createRoom, getRoomsByProject } from '@/modules/room';
import {
  MediaCreateInputSchema,
  MessageCreateInputSchema,
  OfferCreateInputSchema,
  OfferUpdateInputSchema,
  OfferWhereUniqueInputSchema,
  RoomCreateInputSchema,
} from '@/prisma/generated/zod';
import { z } from 'zod';
import { protectedProcedure, router } from '..';

export const projectRouter = router({
  // Client-friendly create: accept simple scalars/arrays and map to Prisma nested creates
  createProject: protectedProcedure
    .input(
      z
        .object({
          name: z.string(),
          startDate: z.string(),
          endDate: z.string().nullable().optional(),
          size: z.string().optional().nullable(),
          type: z.string(),
          // client may send simple enum array or detailed room objects
          rooms: z.array(z.string()).optional(),
          roomsDetails: z
            .array(
              z.object({
                room: z.string(),
                expectations: z.string().optional(),
                images: z.array(z.any()).optional(),
              })
            )
            .optional(),
          images: z.array(z.any()).optional(),
        })
        .passthrough()
    )
    .mutation(async ({ ctx, input }) => {
      const { roomsDetails, images, size, rooms, startDate, endDate, ...rest } = input;

      const data: any = {
        ...rest,
        startDate: startDate ? new Date(startDate) : undefined,
        endDate: endDate ? new Date(endDate) : null,
        user: { connect: { id: ctx.user.id } },
      };

      // Prefer detailed room objects when provided
      if (roomsDetails && Array.isArray(roomsDetails) && roomsDetails.length > 0) {
        data.rooms = {
          create: roomsDetails.map((r: any) => ({ room: r.room, expectations: r.expectations })),
        };
      } else if (rooms && Array.isArray(rooms) && rooms.length > 0) {
        data.rooms = { create: rooms.map((r: string) => ({ room: r })) };
      }

      if (images && Array.isArray(images) && images.length > 0) {
        data.media = { create: images };
      }

      if (size && typeof size === 'string') data.size = size.toUpperCase();

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
