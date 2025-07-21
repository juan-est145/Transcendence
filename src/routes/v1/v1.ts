import { FastifyInstance } from 'fastify'
import { root } from './root/root';

async function v1(fastify: FastifyInstance) {
  fastify.register(root);
}


// const root: FastifyPluginAsync = async (fastify, opts): Promise<void> => {
//   fastify.get('/', async function (request, reply) {
//     return { root: true }
//   })
// }

export default v1;
