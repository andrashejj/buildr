import { router } from '..';
import { healthRouter } from './health';
import { loggerRouter } from './logger';
import { projectRouter } from './project';
import { userRouter } from './user';

export const appRouter = router({
  health: healthRouter,
  user: userRouter,
  logger: loggerRouter,
  project: projectRouter,
});

export type AppRouter = typeof appRouter;
