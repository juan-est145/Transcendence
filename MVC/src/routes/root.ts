import { FastifyPluginAsync } from 'fastify'
import { auth } from './auth/log-in';

const root: FastifyPluginAsync = async (fastify, opts): Promise<void> => {
  fastify.get('/', async function (request, reply) {
    const user = null;
    return reply.viewAsync("index.ejs", { user });
  });

  fastify.register(auth, { prefix: "/auth" })
}

export default root
