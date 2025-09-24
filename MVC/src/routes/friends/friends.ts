import { FastifyInstance } from "fastify";


export async function friends(fastify: FastifyInstance) {
	fastify.addHook("onRequest", fastify.auth([fastify.verifyLoggedIn]));

	fastify.post("/add/:username", async (req, res) => {

	});
}