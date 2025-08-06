import { FastifyInstance } from 'fastify'
import { root } from './root/root';

/**
 * This is the base route of the API. On the current version, all other routes are derived from this one.
 */

async function v1(fastify: FastifyInstance) {
  fastify.register(root);
}

export default v1;
