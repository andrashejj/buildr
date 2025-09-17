import type { Prisma } from '@/prisma/generated';
import prisma from '@/prisma/prisma';

export const createRoom = async ({ data }: { data: Prisma.RoomCreateInput }) => {
  const room = await prisma.room.create({ data });
  return room;
};

export const getRoomsByProject = async ({ projectId }: { projectId: string }) => {
  return prisma.room.findMany({ where: { projectId }, orderBy: { createdAt: 'desc' } });
};

export const getRoom = async ({ roomId }: { roomId: string }) => {
  return prisma.room.findUnique({ where: { id: roomId } });
};

export const updateRoom = async ({
  where,
  data,
}: {
  where: Prisma.RoomWhereUniqueInput;
  data: Prisma.RoomUpdateInput;
}) => {
  return prisma.room.update({ where, data });
};

export const deleteRoom = async (where: Prisma.RoomWhereUniqueInput) => {
  return prisma.room.delete({ where });
};
