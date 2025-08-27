import { FastifyInstance } from "fastify";
import { getAccountSchema } from "./account.swagger";

export async function account(fastify: FastifyInstance) {
	fastify.addHook("preHandler", fastify.auth([fastify.verifyJwt]));

	fastify.get("/", getAccountSchema, async (req, res) => {
		return res.send({ msg: "Hola caracola" });
	});
}