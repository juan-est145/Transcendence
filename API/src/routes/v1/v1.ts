import { FastifyInstance } from 'fastify'
import { root } from './root/root';
import { pong2dRoutes } from './pong/2d/pong'

/**
 * This is the base route of the API. On the current version, all other routes are derived from this one.
 */

async function v1(fastify: FastifyInstance) {
  fastify.register(root);
  await pong2dRoutes(fastify);
}

export default v1;
