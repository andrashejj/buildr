import { protectedProcedure, publicProcedure, router } from '..';

export const healthRouter = router({
  server: publicProcedure.query(() => {
    return {
      message: 'This is a public route.',
      timestamp: new Date().toISOString(),
    };
  }),

  db: protectedProcedure.query(({ ctx }) => {
    return {
      message: 'This is a protected route.',
      timestamp: new Date().toISOString(),
      user: ctx.user,
    };
  }),
});
