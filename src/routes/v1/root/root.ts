import { FastifyInstance } from "fastify"
import { prueba } from "./prueba/prueba";

async function root(fastify: FastifyInstance): Promise<void> {
	fastify.get("/", async (req, res) => {
		return { msg: "Hola caracola" }
	});

	fastify.get("/route", async (req, res) => {
		return { msg: "Another route" }
	});

	fastify.register(prueba, { prefix: "prueba" })
}

export { root }