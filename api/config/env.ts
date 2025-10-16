import dotenv from 'dotenv';
import lodash from 'lodash';
import { z } from 'zod';
dotenv.config({ path: ['.env'] });

export const appEnvSchema = z.object({
  ENDPOINT: z.object({
    APP: z.string(),
    API: z.string(),
  }),

  // DATABASE
  POSTGRES_PRISMA_URL: z.string(),

  // SENTRY
  SENTRY_DSN: z.string(),

  // AI Stuff
  OPENAI_API_KEY: z.string(),
  OPENROUTER_API_KEY: z.string(),

  // VERCEL BLOB
  BLOB_READ_WRITE_TOKEN: z.string(),

  // TIGRIS Object Storage
  TIGRIS: z.object({
    AWS_ACCESS_KEY_ID: z.string(),
    AWS_ENDPOINT_URL_S3: z.string(),
    AWS_REGION: z.string(),
    AWS_SECRET_ACCESS_KEY: z.string(),
    BUCKET_NAME: z.string(),
  }),

  NODE_ENV: z.string(),

  // AUTH
  CLERK: z.object({
    PUBLISHABLE_KEY: z.string(),
    SECRET_KEY: z.string(),
    JWT_KEY: z.string(),
  }),

  // SEARCH TOOLS
  EXA_API_KEY: z.string(),

  // LIVEKIT
  LIVEKIT: z.object({
    API_KEY: z.string(),
    API_SECRET: z.string(),
    URL: z.string(),
  }),
});

const secrets = {
  POSTGRES_PRISMA_URL: process.env.POSTGRES_PRISMA_URL,

  // AI Stuff
  OPENAI_API_KEY: process.env.OPENAI_API_KEY,
  OPENROUTER_API_KEY: process.env.OPENROUTER_API_KEY,

  // CLERK
  CLERK: {
    SECRET_KEY: process.env.CLERK_SECRET_KEY,
  },

  // EMAIL / RESEND
  RESEND_SECRET_KEY: process.env.RESEND_SECRET_KEY,

  // SEARCH TOOLS
  EXA_API_KEY: process.env.EXA_API_KEY,

  // VERCEL BLOB
  BLOB_READ_WRITE_TOKEN: process.env.BLOB_READ_WRITE_TOKEN,

  // TIGRIS Object Storage
  TIGRIS: {
    AWS_ACCESS_KEY_ID: process.env.AWS_ACCESS_KEY_ID,
    AWS_ENDPOINT_URL_S3: process.env.AWS_ENDPOINT_URL_S3,
    AWS_REGION: process.env.AWS_REGION,
    AWS_SECRET_ACCESS_KEY: process.env.AWS_SECRET_ACCESS_KEY,
    BUCKET_NAME: process.env.BUCKET_NAME,
  },

  // LIVEKIT
  LIVEKIT: {
    API_KEY: process.env.LIVEKIT_API_KEY,
    API_SECRET: process.env.LIVEKIT_API_SECRET,
    URL: process.env.LIVEKIT_URL,
  },
};

function getAppEnv() {
  const NODE_ENV = z.enum(['development', 'staging', 'production']).parse(process.env.NODE_ENV);

  return {
    ...lodash.merge(require(`./envs/${NODE_ENV}`).default, secrets),
    NODE_ENV,
  };
}

const parsed = appEnvSchema.safeParse(getAppEnv());

if (!parsed.success) {
  console.error(
    '❌ Invalid environment variables:',
    JSON.stringify(parsed.error.format(), null, 2)
  );
  process.exit(1);
}

const env = parsed.data;

export default env;
