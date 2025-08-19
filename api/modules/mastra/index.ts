import { Mastra } from '@mastra/core';
import { createLogger } from '@mastra/core/logger';
import { buildrAgent } from './agents';

export const mastra = new Mastra({
  agents: {
    buildrAgent,
  },
  logger: createLogger({
    name: 'Mastra',
    level: 'error',
  }),
});
