import { FastifyPluginAsync } from 'fastify'
import { auth } from './auth/log-in/log-in';
import { DecodePayloadType } from '@fastify/jwt';

const root: FastifyPluginAsync = async (fastify, opts): Promise<void> => {
  fastify.addHook("onRequest", async (req, res) => {
    let user: DecodePayloadType | null = null;
    if (req.session.jwt) {
      user = fastify.jwt.decode(req.session.jwt);
    }
    (req as any).user = user ? user : null;
  });

  fastify.get('/', async function (request, reply) {
    return reply.viewAsync("index.ejs", { user: request.user });
  });

  fastify.register(auth, { prefix: "/auth" });
}

export default root
