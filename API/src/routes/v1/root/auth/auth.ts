import { FastifyInstance, RouteShorthandOptions } from "fastify";
import { createUser } from "./auth.service";
import { signInBody } from "./auth.dto";
import { type Static } from '@sinclair/typebox';

const signInSchema: RouteShorthandOptions = {
	schema: {
		body: signInBody,
		response: {
			201: {}
		},
		tags: [ "Auth" ],
		summary: "This endpoint allows for the creation of a user"
	}
}

export async function auth(fastify: FastifyInstance) {
	fastify.post<{ Body: Static<typeof signInBody> }>("/sign-in", signInSchema, async (req, res) => {
		const response = await createUser(fastify, req.body);
		return response;
	});
}