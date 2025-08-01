import { FastifyInstance, RouteShorthandOptions } from "fastify";
import { createUser } from "./auth.service";
import { signInBody, singInRes } from "./auth.dto";
import { type Static } from '@sinclair/typebox';
import bcrypt from "bcrypt";

const signInSchema: RouteShorthandOptions = {
	schema: {
		body: signInBody,
		response: {
			201: singInRes
		},
		tags: [ "Auth" ],
		summary: "This endpoint allows for the creation of a user"
	}
}

export async function auth(fastify: FastifyInstance) {
	fastify.post<{ Body: Static<typeof signInBody> }>("/sign-in", signInSchema, async (req, res) => {
		// TO DO: Need to enforce proper error handling
		try {
			req.body.password = await bcrypt.hash(req.body.password, 10);
			const response = await createUser(fastify, req.body);
			return res.code(201).send(response);
		} catch (error) {
			console.error(error);
		}
	});
}