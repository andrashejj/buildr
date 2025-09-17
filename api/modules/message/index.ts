import prisma from '@/prisma/prisma';
import { Prisma } from '../../prisma/generated';

export const createMessage = async ({ data }: { data: Prisma.MessageCreateInput }) => {
  return prisma.message.create({ data });
};

export const getMessagesForProject = async ({ projectId }: { projectId: string }) => {
  return prisma.message.findMany({ where: { projectId }, orderBy: { createdAt: 'asc' } });
};

export const markRead = async ({ messageId }: { messageId: string }) => {
  return prisma.message.update({ where: { id: messageId }, data: { readAt: new Date() } });
};
