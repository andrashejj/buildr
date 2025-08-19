import { User } from '@/prisma/generated';
import prisma from '@/prisma/prisma';
import { User as ClerkUserType } from '@clerk/fastify';
import { createHash } from 'crypto';
import ms from 'ms';

/**
 * Generate a hash from Clerk user data to detect changes
 */
const generateHash = (payload: string): string => {
  return createHash('md5').update(payload).digest('hex');
};

/**
 * Check if a full sync is needed based on data changes and time
 */
const shouldPerformFullSync = (
  existingUser: {
    clerkUserId: string;
    clerkDataHash: string | null;
    lastFullSync: Date | null;
  } | null,
  clerkDataHash: string,
  forceSync = false,
): boolean => {
  if (forceSync || !existingUser) return true;

  // Check if hash changed (data changed)
  if (existingUser.clerkDataHash !== clerkDataHash) {
    console.log(
      `🔄 Clerk data changed for user ${existingUser.clerkUserId} (hash mismatch)`,
    );
    return true;
  }

  // Check if it's been too long since last full sync (24 hours)
  const FORCE_SYNC_INTERVAL = ms('24h');
  if (existingUser.lastFullSync) {
    const timeSinceSync = Date.now() - existingUser.lastFullSync.getTime();
    if (timeSinceSync > FORCE_SYNC_INTERVAL) {
      console.log(
        `🕒 Force sync due to time interval for user ${existingUser.clerkUserId}`,
      );
      return true;
    }
  }

  return false;
};

export const upsertUser = async (
  clerkUserInfo: ClerkUserType,
): Promise<User | null> => {
  try {
    const upsertData = getClerkUpsertData(clerkUserInfo);
    const { createdAt, lastActiveAt, updatedAt, lastSignInAt, ...hashData } =
      upsertData;

    const clerkDataHash = generateHash(JSON.stringify({ ...hashData }));

    // Check if user exists and if we need a full sync
    const existingUser = await prisma.user.findUnique({
      where: { clerkUserId: clerkUserInfo.id },
      select: {
        id: true,
        clerkUserId: true,
        clerkDataHash: true,
        lastFullSync: true,
        lastLogin: true,
      },
    });

    const needsFullSync = shouldPerformFullSync(existingUser, clerkDataHash);

    if (!needsFullSync && existingUser) {
      // Just update lastLogin and return cached user
      const user = await prisma.user.update({
        where: { clerkUserId: clerkUserInfo.id },
        data: { lastLogin: new Date() },
      });

      return user;
    }

    console.log(
      `🔄 Full sync needed for user ${clerkUserInfo.id} (${!existingUser ? 'new user' : 'data changed'})`,
    );

    // Prepare user data for full sync
    const userData = {
      email: '',
      name: null as string | null,
      picture: null as string | null,
      isInternalUser: false,
      lastLogin: new Date(),
      clerkDataHash,
      lastFullSync: new Date(),
    };

    const primaryUserEmail = clerkUserInfo.emailAddresses.find(
      (email) => email.id === clerkUserInfo.primaryEmailAddressId,
    )?.emailAddress;

    if (!primaryUserEmail) {
      throw new Error('Primary email not found for user');
    }

    userData.email = primaryUserEmail;
    userData.name = clerkUserInfo.fullName;
    userData.picture = clerkUserInfo.imageUrl || null;

    const user = await prisma.user.upsert({
      where: {
        clerkUserId: clerkUserInfo.id,
      },
      update: userData,
      create: {
        clerkUserId: clerkUserInfo.id,
        ...userData,
      },
    });

    if (!user) {
      throw new Error('Failed to upsert user');
    }

    const clerkUser = await prisma.clerkUser.upsert({
      where: {
        id: clerkUserInfo.id,
      },
      update: upsertData,
      create: {
        userId: user.id,
        ...upsertData,
      },
    });

    if (!clerkUser) throw new Error('Failed to upsert clerk user');

    console.log(`✅ Full sync completed for user ${clerkUserInfo.id}`);
    return user;
  } catch (err) {
    console.error('Error upserting user');
    console.error(err);
    return null;
  }
};

export const getUserByClerkId = async (
  clerkId: string,
): Promise<User | null> => {
  try {
    const user = await prisma.user.findUniqueOrThrow({
      where: {
        clerkUserId: clerkId,
      },
    });

    return user;
  } catch (err) {
    return null;
  }
};

export const getUser = async (userId: string) => {
  try {
    const user = await prisma.user.findUniqueOrThrow({
      where: {
        id: userId,
      },
    });
    return user;
  } catch (err) {
    return null;
  }
};

export const getAllUsers = async () => {
  try {
    const users = await prisma.user.findMany({
      orderBy: {
        createdAt: 'desc',
      },
    });
    return users;
  } catch (err) {
    console.error('Error fetching all users:', err);
    return [];
  }
};

export const upsertPushToken = async (userId: string, pushToken: string) => {
  try {
    const user = await prisma.user.findUniqueOrThrow({
      where: {
        id: userId,
      },
    });
    await prisma.user.update({
      where: {
        id: userId,
      },
      data: {
        pushToken: pushToken,
      },
    });
    return user;
  } catch (err) {
    return null;
  }
};

const getClerkUpsertData = (clerkUserInfo: ClerkUserType) => {
  return {
    id: clerkUserInfo.id,
    passwordEnabled: clerkUserInfo.passwordEnabled,
    totpEnabled: clerkUserInfo.totpEnabled,
    backupCodeEnabled: clerkUserInfo.backupCodeEnabled,
    twoFactorEnabled: clerkUserInfo.twoFactorEnabled,
    banned: clerkUserInfo.banned,
    createdAt: clerkUserInfo.createdAt.toString(),
    updatedAt: clerkUserInfo.updatedAt.toString(),
    lastSignInAt: clerkUserInfo.lastSignInAt?.toString(),
    lastActiveAt: clerkUserInfo.lastActiveAt?.toString(),
    legalAcceptedAt: clerkUserInfo.legalAcceptedAt?.toString(),
    externalId: clerkUserInfo.externalId,
    username: clerkUserInfo.username,
    firstName: clerkUserInfo.firstName,
    lastName: clerkUserInfo.lastName,
    imageUrl: clerkUserInfo.imageUrl,
    hasImage: clerkUserInfo.hasImage,
    primaryEmailAddressId: clerkUserInfo.primaryEmailAddressId,
    primaryPhoneNumberId: clerkUserInfo.primaryPhoneNumberId,
    primaryWeb3WalletId: clerkUserInfo.primaryWeb3WalletId,
    emailAddresses: clerkUserInfo.emailAddresses.map(
      (email) => email.emailAddress,
    ),
    phoneNumbers: clerkUserInfo.phoneNumbers.map((phone) => phone.phoneNumber),
    web3Wallets: clerkUserInfo.web3Wallets.map((wallet) => wallet.web3Wallet),
  };
};
