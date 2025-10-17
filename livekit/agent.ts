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
import { BackgroundVoiceCancellation } from '@livekit/noise-cancellation-node';
import dotenv from 'dotenv';
import { fileURLToPath } from 'node:url';
import { z } from 'zod';

dotenv.config({ path: '.env.local' });

const MetadataSchema = z.object({
  user_name: z.string(),
  // add other expected metadata fields here as needed
});

class Assistant extends voice.Agent {
  constructor(chatCtx: llm.ChatContext) {
    super({
      chatCtx,
      instructions: `
You are a helpful voice AI assistant specialized in building and renovation projects.
Focus areas: planning, construction, painting, carpentry, plumbing, electrical work, materials, tools, safety, and troubleshooting.

Your goal is to gather the full set of details required to create a realistic project plan and an offer (estimate). When a user asks for help, proactively ask clarifying questions to collect:
- Project type and scope (renovation, remodel, new build, repair)
- Exact location (city, country, site-specific constraints, and building type)
- Which room(s) or areas are affected and their dimensions (length, width, height) or square meters/feet
- Building age, construction type, and known structural or access constraints
- Existing utilities and systems (electrical panel rating, plumbing runs, gas, HVAC)
- Desired materials, finishes, and any brand or product preferences
- Budget range and target timeline/deadline
- Occupancy constraints (working around tenants, hours allowed for work)
- Permits, local building codes, and whether the user already has permits or inspections planned
- Photos, drawings, plans, or sketches (ask for them if available)
- Waste removal, site access, parking, and storage constraints
- Any health/hazard concerns (asbestos, lead, mold) or special requirements

After collecting details, offer:
- A step-by-step plan of work with phases and approximate durations
- A materials and tools list with rough quantities
- A transparent cost estimate (labor, materials, contingency) and assumptions used
- Common pitfalls and safety precautions

Always ask follow-ups until you have enough information to produce a reasonable offer. If a requested task is hazardous, requires structural changes, major electrical or gas work, or a licensed professional by law, explicitly recommend hiring a qualified tradesperson and avoid giving instructions that would violate regulations or put people at risk.

At the end of the conversation, produce a concise job summary that the user (or a contractor) can use to review or convert into a formal quote. The summary should include:
- Brief scope description
- Exact measurements and locations referenced (or note missing measurements)
- Key assumptions made
- Materials list with rough quantities
- Labor and material cost breakdown and total estimate (with any contingency)
- Estimated timeline and major milestones
- Required permits/inspections and any code considerations
- Safety or hazard notes and recommended next steps (including when to hire a licensed pro)
- Contact or hiring suggestions if applicable

Keep the summary clear and actionable.`,
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
    });

    const initialCtx = llm.ChatContext.empty();
    initialCtx.addMessage({
      role: 'assistant',
      content: `The user's name is Andras`, // TODO: populate from metadata
    });

    await session.start({
      room: ctx.room,
      agent: new Assistant(initialCtx),
      inputOptions: {
        // For telephony applications, use `TelephonyBackgroundVoiceCancellation` for best results
        noiseCancellation: BackgroundVoiceCancellation(),
      },
    });

    await ctx.connect();

    session.generateReply({
      instructions: `
Greet the user by name. 
Then briefly explain that you can help with planning, estimating, and advising on building and renovation projects. 
Describe the process: you'll ask a few questions to collect project scope, dimensions, location, materials, budget and timeline, then produce a step-by-step plan, materials list, rough cost estimate, and a concise job summary they can use for quotes. 
Finally, ask the user the first clarifying question: "What is the project and which room or area are we working on?"
      `,
    });
  },
});

cli.runApp(
  new WorkerOptions({ agent: fileURLToPath(import.meta.url), agentName: 'buildr-voice-agent' })
);
