import { router } from '..';
import { healthRouter } from './health';
import { livekitRouter } from './livekit';
import { loggerRouter } from './logger';
import { projectRouter } from './project';
import { userRouter } from './user';

export const appRouter = router({
  health: healthRouter,
  user: userRouter,
  logger: loggerRouter,
  project: projectRouter,
  livekit: livekitRouter,
});

export type AppRouter = typeof appRouter;
