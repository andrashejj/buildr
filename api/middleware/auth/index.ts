import { upsertUser } from '@/modules/user';
import { User } from '@/prisma/generated';
import { clerkClient, getAuth } from '@clerk/fastify';
import * as Sentry from '@sentry/node';
import { FastifyRequest } from 'fastify';

export const verifyRequestAuth = async (
  request: FastifyRequest,
): Promise<User | null> => {
  try {
    const { userId } = getAuth(request);

    if (!userId) {
      throw new Error('No access token found');
    }

    const clerkUser = await clerkClient.users.getUser(userId);
    if (!clerkUser) throw new Error('Failed to get user from provider');

    const user = await upsertUser(clerkUser);

    // Set the user for Sentry for each request
    Sentry.setUser({ id: user?.id, username: user?.clerkUserId });

    if (!user) throw new Error('Failed to upsert user');
    return user;
  } catch (err) {
    // console.error("🚨🚨🚨 Error verifying Auth JWT:", err);
    return null;
  }
};
