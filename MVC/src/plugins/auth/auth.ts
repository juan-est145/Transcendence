import fp from "fastify-plugin";
import auth, { FastifyAuthPluginOptions } from "@fastify/auth";
import { FastifyReply, FastifyRequest } from "fastify";

export default fp<FastifyAuthPluginOptions>(async (fastify) => {
	/**
	 * This function checks wether or not the user has logged in.
	 * @param req - The fastify request instance.
	 * @param res - The fastify response instance.
	 * @returns A redirection to the main page if the user has not logged in.
	 */
	fastify.decorate("verifySession", async (req: FastifyRequest, res: FastifyReply) => {
		if (!(req.session.jwt && req.session.refreshJwt))
			return res.redirect("/");
	});

	/**
	 * This function checks if the main jwt has expired, and if it has, it tries to
	 * get a new one using the refresh token.
	 * @param req - The fastify request instance.
	 * @param res - The fastify response instance.
	 * @returns It throws an error if there is a problem with the validation outside an expired
	 * jwt
	 */
	fastify.decorate("refreshJwt", async (req: FastifyRequest, res: FastifyReply) => {
		try {
			fastify.jwt.verify(req.session.jwt!);
		} catch (err: any) {
			// If the error is JWT expired, try to refresh
			if (err && err.code === "FAST_JWT_EXPIRED") {
				const { data, error } = await fastify.apiClient.GET("/v1/auth/refresh-jwt");
				if (error) {
					await req.session.destroy();
					throw error;
				} 
				fastify.jwt.verify(data.jwt);
				req.session.set("jwt", data.jwt);
				req.session.set("refreshJwt", data.refreshJwt);
			} else {
				// If it's another error, rethrow
				await req.session.destroy();
				throw err;
			}
		}
	});

	/**
	 * This is the main function to be used for checking if a user is logged in. It checks it's
	 * session and also refreshes it's token if it's valid and it has expired.
	 * @param req - The fastify request instance.
	 * @param res - The fastify response instance.
	 */
	fastify.decorate("verifyLoggedIn", async (req: FastifyRequest, res: FastifyReply) => {
		await fastify.verifySession(req, res);
		await fastify.refreshJwt(req, res);
	});

	fastify.register(auth);
});

declare module "fastify" {
	interface FastifyInstance {
		verifySession: (req: FastifyRequest, res: FastifyReply) => Promise<void>;
		refreshJwt: (req: FastifyRequest, res: FastifyReply) => Promise<void>;
		verifyLoggedIn: (req: FastifyRequest, res: FastifyReply) => Promise<void>;
	}
};