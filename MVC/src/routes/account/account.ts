import { FastifyInstance } from "fastify";

// TO DO: This entire module must be auth protected. For now it isn't because the frontend is being built.

/**
 * This module deals with the user profile page
 */
export async function account(fastify: FastifyInstance) {
	fastify.get("/", async (req, res) => {
		return res.send({ msg: "You are at the profile page" });
	});
}