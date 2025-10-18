import { RoomConfiguration } from '@livekit/protocol';
import { AccessToken, type AccessTokenOptions, type VideoGrant } from 'livekit-server-sdk';

import env from '@/config/env';

import { protectedProcedure, router } from '..';

export const livekitRouter = router({
  createConnection: protectedProcedure.query(async ({ ctx }) => {
    const participantIdentity = ctx.user.id + '_' + Math.floor(Math.random() * 10_000);
    const participantName = ctx.user.name;
    const roomName = `voice_assistant_room_${Math.floor(Math.random() * 10_000)}`;
    const ttlMinutes = 30;
    const agentName = 'buildr-voice-agent';

    const accessToken = new AccessToken(env.LIVEKIT.API_KEY, env.LIVEKIT.API_SECRET, {
      identity: participantIdentity,
      name: participantName,
      ttl: `${ttlMinutes}m`,
    } as AccessTokenOptions);

    const grant: VideoGrant = {
      room: roomName,
      roomJoin: true,
      canPublish: true,
      canPublishData: true,
      canSubscribe: true,
    };

    accessToken.addGrant(grant);

    if (agentName) {
      accessToken.roomConfig = new RoomConfiguration({
        agents: [{ agentName }],
        metadata: JSON.stringify({
          userid: ctx.user.id,
          username: ctx.user.name,
        }),
      });
    }

    const participantToken = await accessToken.toJwt();

    return {
      serverUrl: env.LIVEKIT.URL,
      roomName,
      participantName,
      participantToken,
    };
  }),
});
