import { FastifyPluginAsync } from 'fastify'

const root: FastifyPluginAsync = async (fastify, opts): Promise<void> => {
  fastify.get('/', async function (request, reply) {
    return reply.viewAsync("index.ejs", { value: "Hola caracola" });
  });
}

export default root
