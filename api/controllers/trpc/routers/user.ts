import { getUser } from '@/modules/user';
import prisma from '@/prisma/prisma';
import { protectedProcedure, router } from '..';

export const userRouter = router({
  getUser: protectedProcedure.query(async ({ ctx }) => {
    return await getUser(ctx.user.id);
  }),

  deleteUserAccount: protectedProcedure.mutation(async ({ ctx }) => {
    await prisma.user.delete({
      where: { id: ctx.user.id },
    });

    return true;
  }),
});
