import { FastifyInstance } from "fastify";
import { logInBody, signInBody } from "./auth.dto";
import { JwtBody, LogInBody, SignInBody } from "./auth.type";
import { FastifySessionObject } from "@fastify/session";

/**
 * This function validates that the request body conforms to the zod object logInBody. If
 * the request body is not valid, it throws a zod error.
 * @param body - A fastify request body to be evaluated.
 */
export function validateLogInBody(body: unknown) {
	logInBody.parse(body);
}

/**
 * This function sends the user's credential to the REST API for loggin in. If the response
 * code is between 400 or 500 it throws an exception.
 * @param fastify - The fastify instance. It is decorated with the API client.
 * @param body - A fastify request body with a username and password.
 * @returns If successful it returns a JWT with some user data.
 */
export async function postLogin(fastify: FastifyInstance, body: LogInBody) {
	const { email, password } = body;

	const { data, error } = await fastify.apiClient.POST("/v1/auth/log-in", {
		body: {
			email,
			password,
		},
	});
	if (error) {
		throw error;
	}
	return data;
}

export function createSession(session: FastifySessionObject, token: JwtBody) {
	session.jwt = token.jwt;
	session.refreshJwt = token.refreshJwt;
}

export function validateSignInBody(body: unknown) {
	signInBody.parse(body);
}

export async function postSignIn(fastify: FastifyInstance, body: SignInBody) {
	const { username, email, password } = body;

	const { data, error } = await fastify.apiClient.POST("/v1/auth/sign-in", {
		body: {
			username,
			email,
			password
		},
	});
	if (error) {
		throw error;
	}
	return data;
}