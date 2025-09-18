import { z } from 'zod';

const envSchema = z.object({
  EXPO_PUBLIC_CLERK_PUBLISHABLE_KEY: z.string().min(1, 'Clerk publishable key is required'),
  EXPO_PUBLIC_API_ENDPOINT: z.string().url('API endpoint must be a valid URL'),
});

const envVars = {
  EXPO_PUBLIC_CLERK_PUBLISHABLE_KEY:
    process.env.EXPO_PUBLIC_CLERK_PUBLISHABLE_KEY || process.env.NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY,
  EXPO_PUBLIC_API_ENDPOINT:
    process.env.EXPO_PUBLIC_API_ENDPOINT || process.env.NEXT_PUBLIC_API_ENDPOINT,
};

console.log('logging out the env vars', envVars);

export const env = envSchema.parse(envVars);
