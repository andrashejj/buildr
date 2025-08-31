import { verifyRequestAuth } from '@/middleware/auth';
import * as Sentry from '@sentry/node';
import { initTRPC, TRPCError } from '@trpc/server';
import transformer from 'superjson';
import { ZodError } from 'zod';
import { Context } from './context';

const t = initTRPC.context<Context>().create({
  errorFormatter({ shape, error }) {
    return {
      ...shape,
      data: {
        ...shape.data,
        zodError:
          error.code === 'BAD_REQUEST' && error.cause instanceof ZodError
            ? error.cause.flatten()
            : null,
      },
    };
  },
  transformer,
});

// middleware for sentry
const sentryMiddleware = t.middleware(
  Sentry.trpcMiddleware({
    attachRpcInput: true,
  })
);

// middleware to check if user is authenticated
const isAuthed = t.middleware(async ({ next, ctx }) => {
  const user = await verifyRequestAuth(ctx.req);

  if (!user) {
    throw new TRPCError({ code: 'UNAUTHORIZED' });
  }

  return next({
    ctx: {
      user,
    },
  });
});

export const router = t.router;

export const publicProcedure = t.procedure.use(sentryMiddleware);

export const protectedProcedure = t.procedure.use(isAuthed).use(sentryMiddleware);

export const mergeRouters = t.mergeRouters;

export const createCallerFactory = t.createCallerFactory;
