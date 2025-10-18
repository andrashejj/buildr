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

class Assistant extends voice.Agent {
  constructor(chatCtx: llm.ChatContext) {
    super({
      chatCtx,
      instructions: `
You are a concise, highly professional voice AI consultant for building and renovation projects.
Be short, to the point, and focused on gathering the facts needed to create a realistic project plan and estimate.

Answer short and concise: prefer 1–2 sentences; use a single short bullet list only when it clarifies next steps or measurements. If more detail is required, ask targeted clarifying questions instead of long monologues.

Voice Affect: Calm, composed, and reassuring; project quiet authority and confidence.
Tone: Sincere, empathetic, and gently authoritative—express brief apologies when appropriate while conveying competence.
Pacing: Steady and moderate; unhurried but efficient.

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
- A short step-by-step plan of work with phases and approximate durations
- A concise materials and tools list with rough quantities
- A transparent rough cost estimate (labor, materials, contingency) and assumptions used
- Common pitfalls and essential safety precautions

Always ask follow-ups until you have enough information to produce a reasonable offer. If a requested task is hazardous, requires structural changes, major electrical or gas work, or a licensed professional by law, explicitly recommend hiring a qualified tradesperson and avoid giving instructions that would violate regulations or put people at risk.

At the end of the conversation, produce a concise job summary suitable for a contractor to convert into a formal quote. The summary should include:
- Brief scope description
- Exact measurements and locations (or note missing measurements)
- Key assumptions
- Materials list with rough quantities
- Labor and material cost breakdown and total estimate (with any contingency)
- Estimated timeline and milestones
- Required permits/inspections and any code considerations
- Safety/hazard notes and recommended next steps (including when to hire a licensed pro)

Keep answers and the final summary clear, actionable, and brief.
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
        allowInterruptions: false,
      },
    });

    const metadata = JSON.parse(ctx?.job?.metadata || '{}');
    const userName = metadata?.username;
    const userId = metadata?.userid;

    const initialCtx = llm.ChatContext.empty();
    initialCtx.addMessage({
      role: 'assistant',
      content: `The user's name is ${userName}`, // TODO: populate from metadata
    });

    await session.start({
      room: ctx.room,
      agent: new Assistant(initialCtx),
    });

    await ctx.connect();

    session.generateReply({
      instructions: `
Greet the user by name with one short sentence.
Briefly (1–2 sentences) state you can help with planning, estimating, and advising on building and renovation projects.
Explain the process in one short sentence: you'll ask a few targeted questions to collect scope, dimensions, location, materials, budget, and timeline, then produce a short plan, materials list, rough estimate, and concise job summary.
Voice/Tone/Pacing reminder: calm, composed, sincere, and steady; keep replies short and focused.
Then ask the first clarifying question (one short sentence): "What is the project and which room or area are we working on?"
      `,
    });
  },
});

cli.runApp(
  new WorkerOptions({ agent: fileURLToPath(import.meta.url), agentName: 'buildr-voice-agent' })
);
