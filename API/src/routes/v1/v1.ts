import { FastifyInstance } from 'fastify'
import { root } from './root/root';

async function v1(fastify: FastifyInstance) {
  fastify.register(root);
}

export default v1;
