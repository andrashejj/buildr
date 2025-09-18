import type { Prisma } from '@/prisma/generated';
import prisma from '@/prisma/prisma';

export const createProject = async ({ data }: { data: Prisma.ProjectCreateInput }) => {
  return prisma.project.create({ data });
};

export const getProjectsByUser = async ({ userId }: { userId: string }) => {
  return await prisma.project.findMany({
    where: { userId },
    orderBy: { createdAt: 'desc' },
    include: {
      rooms: {
        include: {
          media: true,
        },
      },
      media: true,
    },
  });
};

export const getProjectById = async ({ id, userId }: { id: string; userId: string }) => {
  return prisma.project.findUnique({
    where: { id },
    include: {
      media: true,
      rooms: {
        include: {
          media: true,
        },
      },
      messages: {
        where: {
          OR: [{ senderId: userId }, { recipientId: userId }],
        },
      },
      offers: true,
    },
  });
};

export const getAllProjects = async () => {
  return prisma.project.findMany({
    include: {
      media: true,
      rooms: {
        include: {
          media: true,
        },
      },
    },
  });
};

export const updateProject = async ({
  where,
  data,
}: {
  where: Prisma.ProjectWhereUniqueInput;
  data: Prisma.ProjectUpdateInput;
}) => {
  return prisma.project.update({ where, data });
};

export const deleteProject = async ({ where }: { where: Prisma.ProjectWhereUniqueInput }) => {
  return prisma.project.delete({ where });
};
