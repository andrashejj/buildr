import prisma from '@/prisma/prisma';
import { z } from 'zod';
import { protectedProcedure, router } from '..';

const createProjectSchema = z.object({
  name: z.string().min(1, 'Project name is required'),
  startDate: z.string().transform((str) => new Date(str)),
  endDate: z
    .string()
    .optional()
    .transform((str) => (str ? new Date(str) : undefined)),
  size: z.string().optional(),
  type: z.string().min(1, 'Project type is required'),
});

export const projectRouter = router({
  createProject: protectedProcedure.input(createProjectSchema).mutation(async ({ ctx, input }) => {
    const project = await prisma.project.create({
      data: {
        ...input,
        userId: ctx.user.id,
      },
    });
    return project;
  }),

  getProjects: protectedProcedure.query(async ({ ctx }) => {
    return await prisma.project.findMany({
      where: { userId: ctx.user.id },
      orderBy: { createdAt: 'desc' },
    });
  }),
});
