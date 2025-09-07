import { FastifyPluginAsync } from 'fastify'
import { auth } from './auth/auth';
import { Middleware } from 'openapi-fetch';
import { account } from './account/account';

const root: FastifyPluginAsync = async (fastify, opts): Promise<void> => {
  // 404 - Not Found handler
  fastify.setNotFoundHandler(async (request, reply) => {
    return reply.code(404).view("errors/404.ejs");
  });

  // 500 - Internal Server Error handler for generic errors.
  // 401 - Unauthorized for not logged error's.
  fastify.setErrorHandler(async (error, request, reply) => {
    fastify.log.error(error);
    if (error.statusCode === 401) {
      if (request.session)
        await request.session.destroy();
      return reply.code(error.statusCode).viewAsync("errors/401.ejs");
    }
    return reply.code(500).view("errors/500.ejs");
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
    return reply.view("index.ejs", { user: request.user });
  });

  fastify.register(auth, { prefix: "/auth" });
  fastify.register(account, { prefix: "/account" });

}

export default root
