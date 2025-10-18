import {
  type JobContext,
  type JobProcess,
  WorkerOptions,
  cli,
  defineAgent,
  inference,
  llm,
  voice,
} from '@livekit/agents';
import * as livekit from '@livekit/agents-plugin-livekit';
import * as silero from '@livekit/agents-plugin-silero';
import dotenv from 'dotenv';
import { fileURLToPath } from 'node:url';
import { z } from 'zod';

dotenv.config({ path: '.env.local' });

const MetadataSchema = z.object({
  user_name: z.string(),
  // add other expected metadata fields here as needed
});

// INTERNAL: full set of goal fields the agent collects over the conversation.
// Keep this separate from user-facing prompts so the agent asks one question at a time.
const INTERNAL_GOALS = {
  project: 'type, scope, structural changes',
  location: 'city, country, building type, access/constraints',
  areas: 'which rooms, dimensions (L x W x H) — read aloud',
  building: 'age, construction type, structural constraints',
  utilities: 'electrical panel, gas, plumbing layout, HVAC',
  finishes: 'cabinetry, countertops, fixtures, appliances, paint',
  budget_timeline: 'budget range and target completion date',
  occupancy: 'occupied during work? tenant/time constraints',
  permits: 'permits required/planned, code constraints',
  access_waste: 'site access, parking, deliveries, waste removal',
  hazards: 'asbestos, lead, mold, other risks',
  drawings: 'photos, plans, sketches',
};

class Assistant extends voice.Agent {
  constructor(chatCtx: llm.ChatContext) {
    super({
      chatCtx,
      instructions: `
  You are a concise, professional voice AI consultant for building and renovation projects.
  Keep replies to 1 short sentence or 1 short sentence + a single clarification line when needed.

  Ask one focused question at a time. When requesting dimensions say them aloud (e.g. "Please read room dimensions: length x width x height in meters"). When asking about Occupancy say: "Occupancy — meaning: will the space be occupied during work (yes/no), any tenant/time constraints?"

  If user replies are unclear or you don't understand, ask one short clarifying question naming the unclear part and offer up to two short possible interpretations for them to confirm (e.g. "Do you mean A or B?").

  Stop asking follow-ups only when you have enough details to produce a short plan, materials list, rough estimate, and contractor-ready job summary. If work is structural, electrical, gas, or otherwise legally restricted, recommend a licensed professional.
  `,
    });
  }
}

export default defineAgent({
  prewarm: async (proc: JobProcess) => {
    proc.userData.vad = await silero.VAD
      .load
      //   {
      //   activationThreshold: 0.2,
      //   prefixPaddingDuration: 0.5,
      //   minSpeechDuration: 0.5,
      //   minSilenceDuration: 0.55,
      // }
      ();
  },
  entry: async (ctx: JobContext) => {
    const vad = ctx.proc.userData.vad! as silero.VAD;

    const session = new voice.AgentSession({
      vad,
      stt: new inference.STT({
        model: 'assemblyai/universal-streaming',
        language: 'en',
      }),
      llm: new inference.LLM({
        model: 'openai/gpt-5-nano',
        provider: 'openai',
        modelOptions: {
          reasoning_effort: 'low',
        },
      }),
      tts: new inference.TTS({
        model: 'cartesia/sonic-2',
        voice: '9626c31c-bec5-4cca-baa8-f8ba9e84c8bc',
        language: 'en',
      }),
      turnDetection: new livekit.turnDetector.MultilingualModel(),
      voiceOptions: {
        allowInterruptions: true,
      },
    });

    const metadata = JSON.parse(ctx?.job?.metadata || '{}');

    console.log('🚀 ~ metadata:', metadata);

    const userName = metadata?.username;
    const userId = metadata?.userid;

    const initialCtx = llm.ChatContext.empty();
    // Provide the full internal goals to the LLM as a system message so it
    // remembers what to collect across the conversation without asking them all at once.
    initialCtx.addMessage({
      role: 'system',
      content: `INTERNAL_GOALS: ${JSON.stringify(INTERNAL_GOALS)}`,
    });
    // CLARIFY_POLICY: short instruction for how to ask clarifying questions when user input is unclear.
    initialCtx.addMessage({
      role: 'system',
      content:
        'CLARIFY_POLICY: If user input is unclear, ask one short clarifying question naming the unclear part and offer up to two brief interpretations to confirm.',
    });
    // Friendly first-name greeting token for the assistant to use in replies.
    const friendlyName = (userName || 'there').split(' ')[0];
    initialCtx.addMessage({
      role: 'assistant',
      content: `The user's friendly name is ${friendlyName}`,
    });

    await session.start({
      room: ctx.room,
      agent: new Assistant(initialCtx),
    });

    await ctx.connect();

    session.generateReply({
      instructions: `
Greet the user by name in one short, friendly sentence (use the friendly name from context).
One short sentence: say you help with planning, estimating, and advising on building and renovation projects.
One short sentence: explain you'll ask one short question at a time and then produce a short plan, materials list, rough estimate, and job summary.
Then ask the first focused question (one short sentence): "What is the project and which room or area are we working on?"
      `,
    });
  },
});

cli.runApp(
  new WorkerOptions({ agent: fileURLToPath(import.meta.url), agentName: 'buildr-voice-agent' })
);
