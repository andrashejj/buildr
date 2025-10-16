import { getPresignedUrl } from '@tigrisdata/storage';
import { FastifyPluginCallback } from 'fastify';
import { z } from 'zod';
import env from '../../../../config/env';

const uploadSchema = z.object({
  path: z.string(),
  contentType: z.string(),
});

export const protectedRoutes: FastifyPluginCallback = (instance, opts, done) => {
  instance.post('/tigris', async (request, reply) => {
    try {
      const body = uploadSchema.parse(request.body);
      const { path } = body;
      const result = await getPresignedUrl(path, {
        operation: 'put',
        expiresIn: 3600, // 1 hour
        config: {
          bucket: env.TIGRIS.BUCKET_NAME,


        },
      });

      console.log('🚀 ~ protectedRoutes ~ result:', result);

      return reply.send({ data: result.data });
    } catch (error) {
      console.error('Upload error:', error);
      return reply.code(500).send({ error: 'Failed to generate presigned URL' });
    }
  });
  done();
};
