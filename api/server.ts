import env from '@/config/env';
import server from '@/controllers/api/';
import { createContext } from '@/controllers/trpc/context';
import { appRouter } from '@/controllers/trpc/routers';
import prisma from '@/prisma/prisma';
import { clerkPlugin } from '@clerk/fastify';
import * as Sentry from '@sentry/node';
import { fastifyTRPCPlugin } from '@trpc/server/adapters/fastify';
import { FastifyReply } from 'fastify/types/reply';
import { FastifyRequest } from 'fastify/types/request';

// Sentry
Sentry.init({
  dsn: env.SENTRY_DSN,
  tracesSampleRate: 1.0,
  spotlight: env.NODE_ENV === 'development',
  skipOpenTelemetrySetup: true,
});

server.register(clerkPlugin, {
  secretKey: env.CLERK.SECRET_KEY,
  publishableKey: env.CLERK.PUBLISHABLE_KEY,
});

// Trpc plugin
server.register(fastifyTRPCPlugin, {
  prefix: '/api',
  trpcOptions: {
    router: appRouter,
    createContext,
  },
});

// Health check
server.get(
  '/api/health',
  async (request: FastifyRequest, reply: FastifyReply) => {
    return reply.send({
      status: true,
      response: {
        message: 'This is a public route.',
        timestamp: new Date().toISOString(),
      },
    });
  },
);

// DB connection check
prisma
  .$connect()
  .then(() => {
    console.log('💾 Connected to database successfully.');
  })
  .catch((error) => {
    console.error('💾 Failed to connect to database:', error);
    process.exit(1);
  });

// Start server
const startServer = async () => {
  try {
    await server.listen({
      port: 4001,
      host: '::',
    });

    console.log(
      `🚀 Server is running at ${env.ENDPOINT.API} and ready to accept requests.`,
    );
  } catch (err) {
    console.error(err);
    process.exit(1);
  }
};

startServer();
