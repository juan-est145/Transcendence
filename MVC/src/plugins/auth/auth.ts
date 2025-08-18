import fp from "fastify-plugin";
import auth, { FastifyAuthPluginOptions } from "@fastify/auth";
import { FastifyReply, FastifyRequest } from "fastify";

export default fp<FastifyAuthPluginOptions>(async (fastify) => {
	fastify.decorate("verifySession", async (req: FastifyRequest, res: FastifyReply) => {
		if (!(req.session.jwt && req.session.refreshJwt))
			return res.redirect("/");
	});

	fastify.decorate("refreshJwt", async (req: FastifyRequest, res: FastifyReply) => {
		fastify.jwt.verify(req.session.jwt!, async (err) => {
			if (err && err.hasOwnProperty("code") && (err as any).code === "FAST_JWT_EXPIRED") {
				//fastify.apiClient.GET()
			}
		});
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