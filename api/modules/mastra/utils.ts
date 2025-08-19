import env from '@/config/env';
import { UserSchema } from '@/prisma/generated/zod';
import { RuntimeContext } from '@mastra/core/runtime-context';
import { createOpenRouter } from '@openrouter/ai-sdk-provider';
import { z } from 'zod';

// @ts-ignore

export const openrouter = createOpenRouter({
  apiKey: env.OPENROUTER_API_KEY,
});

export const agentRuntimeContextSchema = z.object({
  user: UserSchema,
  localTime: z.string().nullable().default(new Date().toLocaleTimeString()),
  threadCount: z.number().nullable().optional(),
});
export type AgentRuntimeContext = z.infer<typeof agentRuntimeContextSchema>;

export const createRuntimeContext = (
  agentRuntimeContext: AgentRuntimeContext,
) => {
  const parsedAgentRuntimeContext =
    agentRuntimeContextSchema.parse(agentRuntimeContext);

  const runtimeContext = new RuntimeContext<{
    agentRuntimeContext: AgentRuntimeContext;
  }>();
  runtimeContext.set('agentRuntimeContext', parsedAgentRuntimeContext);
  return runtimeContext;
};

export const getRuntimeContext = (runtimeContext: RuntimeContext) => {
  const agentRuntimeContext = agentRuntimeContextSchema.parse({
    runtimeContext: runtimeContext.get('agentRuntimeContext'),
  });
  return agentRuntimeContext;
};
