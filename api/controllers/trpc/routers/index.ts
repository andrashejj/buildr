import { router } from '..';
import { healthRouter } from './health';
import { loggerRouter } from './logger';
import { userRouter } from './user';

export const appRouter = router({
  health: healthRouter,
  user: userRouter,
  logger: loggerRouter,
});

export type AppRouter = typeof appRouter;
