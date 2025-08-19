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

  NODE_ENV: z.string(),

  // AUTH
  CLERK: z.object({
    PUBLISHABLE_KEY: z.string(),
    SECRET_KEY: z.string(),
  }),

  // SEARCH TOOLS
  EXA_API_KEY: z.string(),
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

  // SEARCH TOOLS
  EXA_API_KEY: process.env.EXA_API_KEY,
};

function getAppEnv() {
  const NODE_ENV = z
    .enum(['development', 'staging', 'production'])
    .parse(process.env.NODE_ENV);

  return {
    ...lodash.merge(require(`./envs/${NODE_ENV}`).default, secrets),
    NODE_ENV,
  };
}

const parsed = appEnvSchema.safeParse(getAppEnv());

if (!parsed.success) {
  console.error(
    '❌ Invalid environment variables:',
    JSON.stringify(parsed.error.format(), null, 2),
  );
  process.exit(1);
}

const env = parsed.data;

export default env;
