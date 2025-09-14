import { FastifyInstance } from "fastify";

export async function pong(fastify: FastifyInstance) {

	fastify.get("/", async (req, res) => {
		return res.html();
	});
}