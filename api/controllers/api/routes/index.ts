import env from '@/config/env';
import { verifyRequestAuth } from '@/middleware/auth';
import { clerkPlugin } from '@clerk/fastify';
import { FastifyPluginCallback } from 'fastify';
import { FastifyReply } from 'fastify/types/reply';
import { FastifyRequest } from 'fastify/types/request';
import { protectedRoutes as uploadRoutes } from './upload';

const addUserToRequest = async (request: FastifyRequest, reply: FastifyReply) => {
  try {
    if (!request.headers.authorization) throw new Error('No Authorization header found');

    const user = await verifyRequestAuth(request);

    if (!user) throw new Error('No user info found');

    Object.assign(request, { user });
    return request;
  } catch (err) {
    //return unauthorized if any error
    reply.code(401).send({ message: 'Unauthorized' });
  }
};

//all protected routes
export const protectedRoutes: FastifyPluginCallback = (instance, opts, done) => {
  instance.register(clerkPlugin, {
    secretKey: env.CLERK.SECRET_KEY,
    publishableKey: env.CLERK.PUBLISHABLE_KEY,
    jwtKey: env.CLERK.JWT_KEY,
  });

  instance.addHook('preHandler', addUserToRequest);

  instance.register(uploadRoutes, { prefix: '/upload' });

  done();
};

//all public routes
export const publicRoutes: FastifyPluginCallback = (instance, opts, done) => {
  done();
};
