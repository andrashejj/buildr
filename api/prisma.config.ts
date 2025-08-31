import * as dotenv from 'dotenv';
import path from 'node:path';

dotenv.config(); // Load the environment variables

export default {
  schema: path.join('prisma', 'schema'),
};
