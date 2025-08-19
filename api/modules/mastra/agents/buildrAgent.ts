import { agentRuntimeContextSchema, openrouter } from '@/modules/mastra/utils';
import { Agent } from '@mastra/core';

const model = openrouter('openai/gpt-4.1-mini');

export const buildrAgent = new Agent({
  name: 'Buildr Agent',
  instructions: async ({ runtimeContext }) => {
    const parsedAgentRuntimeContext = agentRuntimeContextSchema.parse(
      runtimeContext.get('agentRuntimeContext'),
    );

    const hopperAgentInstructions =
      'You are Hopper, a financial assistant. Your goal is to help users with their financial needs.';

    return hopperAgentInstructions;
  },
  model,
});
