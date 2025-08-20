import { FastifyPluginAsync } from 'fastify'
import { auth } from './auth/auth';
import { DecodePayloadType } from '@fastify/jwt';
import { Middleware } from 'openapi-fetch';

const root: FastifyPluginAsync = async (fastify, opts): Promise<void> => {
  /**
   * This hook populates the user property in request with the basic data of the user,
   * so it may be used elsewhere. This data is the payload of the jwt.
   */
  fastify.addHook("onRequest", async (req, res) => {
    let user: DecodePayloadType | null = null;
    if (req.session.jwt) {
      user = fastify.jwt.decode(req.session.jwt);
    }
    (req as any).user = user ? user : null;
  });

  /**
   * This hooks handles the auth headers necessary for accesing our API's protected routes.
   * If the user is logged in, it adds it's jwt to every request, except if the route is
   * meant for refreshing the jwt, in which it's case, it uses the the refresh jwt token instead.
   */
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

  // 404 - Not Found handler
  fastify.setNotFoundHandler(async (request, reply) => {
    return reply.code(404).viewAsync("errors/404.ejs");
  });

  // 500 - Internal Server Error handler
  fastify.setErrorHandler(async (error, request, reply) => {
    fastify.log.error(error);
    return reply.code(500).viewAsync("errors/500.ejs");
  });

}

export default root
