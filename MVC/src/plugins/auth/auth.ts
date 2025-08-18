import fp from "fastify-plugin";
import auth, { FastifyAuthPluginOptions } from "@fastify/auth";
import { FastifyReply, FastifyRequest } from "fastify";

export default fp<FastifyAuthPluginOptions>(async (fastify) => {
	fastify.decorate("verifySession", async (req: FastifyRequest, res: FastifyReply) => {
		if (!(req.session.jwt && req.session.refreshJwt))
			return res.redirect("/");
	});

	fastify.decorate("refreshJwt", async (req: FastifyRequest, res: FastifyReply) => {
		try {
			fastify.jwt.verify(req.session.jwt!);
		} catch (err: any) {
			// If the error is JWT expired, try to refresh
			if (err && err.code === "FAST_JWT_EXPIRED") {
				const { data, error } = await fastify.apiClient.GET("/v1/auth/refresh-jwt");
				if (error) throw error;
				fastify.jwt.verify(data.jwt);
				req.session.set("jwt", data.jwt);
				req.session.set("refreshJwt", data.refreshJwt);
			} else {
				// If it's another error, rethrow
				throw err;
			}
		}
	});

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