import { FastifyPluginAsync } from 'fastify'

const root: FastifyPluginAsync = async (fastify, opts): Promise<void> => {
  fastify.get('/', async function (request, reply) {
    const user = null;
    return reply.viewAsync("index.ejs", { user });
  });
}

export default root
