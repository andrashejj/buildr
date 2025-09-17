import type { Prisma } from '@/prisma/generated';
import prisma from '@/prisma/prisma';

export const createMedia = async ({ data }: { data: Prisma.MediaCreateInput }) => {
  return prisma.media.create({ data });
};

export const getMediaByProject = async ({ projectId }: { projectId: string }) => {
  return prisma.media.findMany({ where: { projectId } });
};

export const deleteMedia = async ({ where }: { where: Prisma.MediaWhereUniqueInput }) => {
  return prisma.media.delete({ where });
};
