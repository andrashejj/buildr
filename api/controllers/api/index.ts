import env from '@/config/env';
import cors from '@fastify/cors';
import formbody from '@fastify/formbody';
import helmet from '@fastify/helmet';
import fastifyMultipart from '@fastify/multipart';
import sensible from '@fastify/sensible';
import * as Sentry from '@sentry/node';
import Fastify from 'fastify';
import { protectedRoutes, publicRoutes } from './routes';

const logger = {
  level: 'warn',
  transport: {
    target: 'pino-pretty',
    options: {
      translateTime: 'HH:MM:ss Z',
      ignore: 'pid,hostname',
      messageFormat: '{msg} [method={req.method} url={req.url} duration={responseTime}ms]',
    },
  },
};

const server = Fastify({
  logger: logger,
});

Sentry.setupFastifyErrorHandler(server);

server.register(sensible);

server.register(formbody);

server.register(fastifyMultipart);

server.register(cors, {
  origin: env.ENDPOINT.APP,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: [
    'content-type',
    'trpc-batch-mode',
    'trpc-accept',
    'authorization',
    'x-token-mode',
  ],
  credentials: true,
});

// TODO: move all the static pages to either UI or another service, and disable all srciptSrc, and imgSrc
server.register(helmet, {
  contentSecurityPolicy: {
    directives: {
      frameAncestors: ["'self'", env.ENDPOINT.APP],
      scriptSrc: ["'self'", "'unsafe-inline'", "'unsafe-eval'", 'https://cdn.tailwindcss.com'],
      mediaSrc: ["'self'"],
      imgSrc: ["'self'"],
    },
  },
});

server.register(publicRoutes);
server.register(protectedRoutes);

export default server;
