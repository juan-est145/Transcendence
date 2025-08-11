import { FastifyInstance } from "fastify";

export async function auth(fastify: FastifyInstance) {
	fastify.get("/login", async (req, res) => {
		return res.viewAsync("/log-in.ejs");
	});
}