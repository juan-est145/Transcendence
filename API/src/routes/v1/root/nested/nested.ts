import { FastifyInstance } from "fastify";

async function prueba(fastify: FastifyInstance): Promise<void> {
	fastify.get("/", async (req, res) => {
		return { msg: "Hola desde prueba" }
	});
}

export { prueba };