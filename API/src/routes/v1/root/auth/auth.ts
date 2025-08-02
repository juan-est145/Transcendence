import { FastifyInstance, RouteShorthandOptions } from "fastify";
import { createUser } from "./auth.service";
import { signInBody, singInRes, signInError } from "./auth.dto";
import { type Static } from '@sinclair/typebox';
import bcrypt from "bcrypt";
import { type SignInError } from "./auth.type";
import { HttpError } from "../../v1.dto";

const signInSchema: RouteShorthandOptions = {
	schema: {
		body: signInBody,
		response: {
			201: singInRes,
			400: signInError,
			500: signInError
		},
		tags: ["Auth"],
		summary: "This endpoint allows for the creation of a user"
	}
}

export async function auth(fastify: FastifyInstance) {
	// This is the error catcher, we must work with it to handle appropiately. Must distinguish between
	// validation errors, 500 internal errors with the db and constraints errors.
	fastify.setErrorHandler((error, req, res) => {
		const response: SignInError = {
			statusCode: 500,
			httpError: HttpError.INTERNAL_SERVER_ERROR,
		};
		if (error.validation) {
			response.details = [{
				field: error.validation[0].params.missingProperty as string,
				msg: [error.message]
			}];
			return res.code(400).send(response)
		}
		return res.code(500).send(response);
	});

	fastify.post<{ Body: Static<typeof signInBody> }>("/sign-in", signInSchema, async (req, res) => {
		// TO DO: Need to enforce proper error handling
		try {
			req.body.password = await bcrypt.hash(req.body.password, 10);
			const response = await createUser(fastify, req.body);
			return res.code(201).send(response);
		} catch (error) {
			throw error;
		}
	});
}