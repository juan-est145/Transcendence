import { FastifyInstance } from "fastify";
import { logInBody } from "./log-in.dto";
import { LogInBody } from "./log-in.type";

export function validateLogInBody(body: unknown) {
	logInBody.parse(body);
}

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