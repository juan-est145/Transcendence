import { FastifyPluginAsync } from 'fastify'
import { auth } from './auth/auth';
import { DecodePayloadType } from '@fastify/jwt';
import { Middleware } from 'openapi-fetch';

const root: FastifyPluginAsync = async (fastify, opts): Promise<void> => {
  fastify.addHook("onRequest", async (req, res) => {
    let user: DecodePayloadType | null = null;
    if (req.session.jwt) {
      user = fastify.jwt.decode(req.session.jwt);
    }
    (req as any).user = user ? user : null;
  });

  fastify.addHook("onRequest", async (req, res) => {
    const authMiddleware: Middleware = {
      onRequest({ schemaPath, request }) {
        if (!req.session)
          return request;
        const token = schemaPath === "/v1/auth/refresh-jwt" ? req.session.get("refreshJwt") : req.session.get("jwt");
        request.headers.set("Authorization", `Bearer ${token}`);
        return request;
      }
    };

    fastify.apiClient.use(authMiddleware);
  });

  fastify.get('/', async function (request, reply) {
    return reply.viewAsync("index.ejs", { user: request.user });
  });

  fastify.register(auth, { prefix: "/auth" });
}

export default root
