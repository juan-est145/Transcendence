import { FastifyInstance } from "fastify";

export async function pong(fastify: FastifyInstance) {
	await fastify.vite.ready();

	fastify.get("/", async (req, res) => {
		return res.html();
	});
}