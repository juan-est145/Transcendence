import fastifyAuth, { FastifyAuthPluginOptions } from "@fastify/auth";
import { FastifyReply, FastifyRequest } from "fastify";
import fp from "fastify-plugin";

export default fp<FastifyAuthPluginOptions>(async (fastify) => {
	/**
	 * This function checks wether or not the JWT is correct.
	 * @param req - The fastify request instance.
	 * @param res - The fastify response instance.
	 * @returns A 401 error if the provided JWT is the refresh one.
	 */
	fastify.decorate("verifyJwt", async (req: FastifyRequest, res: FastifyReply) => {
		try {
			await req.jwtVerify();
			if (!(req.user.hasOwnProperty("email") && req.user.hasOwnProperty("username")))
				throw (fastify.httpErrors.badRequest("Invalid JWT. You need the JWT token, not the refresh one"));
		} catch (error) {
			throw error;
		}
	});

	/**
	 * This function checks wether or not the refresh JWT is correct.
	 * @param req - The fastify request instance.
	 * @param res - The fastify response instance.
	 * @returns A 401 error if the provided JWT is the base one instead of the refresh one.
	 */
	fastify.decorate("verifyRefreshJwt", async (req: FastifyRequest, res: FastifyReply) => {
		try {
			await req.jwtVerify();
			if (!(req.user.hasOwnProperty("refresh") && (req.user as any).refresh === true))
				throw (fastify.httpErrors.badRequest("Invalid JWT. You need the refresh token, not the jwt one"));
		} catch (error) {
			throw error;
		}
	});

	/**
	 * Alias for verifyJwt - used in 2FA routes.
	 * @param req - The fastify request instance.
	 * @param res - The fastify response instance.
	 */
	fastify.decorate("authenticate", async (req: FastifyRequest, res: FastifyReply) => {
		await fastify.verifyJwt(req, res);
	});

	fastify.register(fastifyAuth);
});

declare module "fastify" {
	interface FastifyInstance {
		verifyJwt: (req: FastifyRequest, res: FastifyReply) => Promise<void>;
		verifyRefreshJwt: (req: FastifyRequest, res: FastifyReply) => Promise<void>;
		authenticate: (req: FastifyRequest, res: FastifyReply) => Promise<void>;
	}

	interface FastifyRequest {
		user: {
			id: number;
			username: string;
			email: string;
			[key: string]: any;
		};
	}
}