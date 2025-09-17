import type { Prisma } from '@/prisma/generated';
import prisma from '@/prisma/prisma';

export const createOffer = async ({ data }: { data: Prisma.OfferCreateInput }) => {
  return prisma.offer.create({ data });
};

export const getOffersForProject = async ({ projectId }: { projectId: string }) => {
  return prisma.offer.findMany({ where: { projectId }, orderBy: { createdAt: 'desc' } });
};

export const updateOfferStatus = async ({
  where,
  data,
}: {
  where: Prisma.OfferWhereUniqueInput;
  data: Prisma.OfferUpdateInput;
}) => {
  return prisma.offer.update({ where, data });
};

export const deleteOffer = async ({ where }: { where: Prisma.OfferWhereUniqueInput }) => {
  return prisma.offer.delete({ where });
};
