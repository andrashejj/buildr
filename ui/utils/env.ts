import { z } from 'zod';

const envSchema = z.object({
  EXPO_PUBLIC_CLERK_PUBLISHABLE_KEY: z.string().min(1, 'Clerk publishable key is required'),
  EXPO_PUBLIC_API_ENDPOINT: z.string().url('API endpoint must be a valid URL'),
});

export const env = envSchema.parse(process.env);
