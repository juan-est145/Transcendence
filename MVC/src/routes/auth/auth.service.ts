import { FastifyInstance } from "fastify";
import { logInBody, signInBody } from "./auth.dto";
import { JwtBody, LogInBody, SignInBody } from "./auth.type";
import { FastifySessionObject } from "@fastify/session";

/**
 * This class acepts the following parameters:
 * @param fastify - The current fastify instance.
 */
export class AuthService {
	constructor(private fastify: FastifyInstance) {	}

	/**
	 * This function validates that the request body conforms to the zod object logInBody. If
	 * the request body is not valid, it throws a zod error.
	 * @param body - A fastify request body to be evaluated.
	 */
	validateLogInBody(body: unknown) {
		logInBody.parse(body);
	}

	/**
	 * This function sends the user's credential to the REST API for loggin in. If the response
	 * code is between 400 or 500 it throws an exception.
	 * @param body - A fastify request body with a username and password.
	 * @returns If successful it returns a JWT with some user data or 2FA challenge.
	 */
	async postLogin(body: LogInBody) {
		const { email, password } = body;

		const { data, error } = await this.fastify.apiClient.POST("/v1/auth/log-in", {
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

	/**
	 * This function checks if the login response requires 2FA.
	 * @param loginResponse - The response from the login API.
	 * @returns True if 2FA is required, false otherwise.
	 */
	requires2FA(loginResponse: JwtBody): loginResponse is { requires2FA: true; tempToken: string; message: string; } {
		return 'requires2FA' in loginResponse && loginResponse.requires2FA === true;
	}

	/**
	 * This function creates a session. Useful for loggin in a user.
	 * @param session - The fastify session object. You must set a value in both it's properties jwt and refreshJwt.
	 * @param token - A JWT object with both a JWT field and a refresh token field. They must be set in the session.
	 */
	createSession(session: FastifySessionObject, token: JwtBody | { jwt: string; refreshJwt: string; user: { username: string; email: string; } }) {
		// Verificar que el token tiene las propiedades necesarias para crear una sesión completa
		if ('jwt' in token && 'refreshJwt' in token) {
			session.jwt = token.jwt;
			session.refreshJwt = token.refreshJwt;
		} else {
			throw new Error("Invalid token");
		}
	}

	/**
	 * This function creates a temporary session for 2FA verification.
	 * @param session - The fastify session object.
	 * @param tempToken - The temporary token for 2FA verification.
	 */
	createTempSession(session: FastifySessionObject, tempToken: string) {
		session.tempToken = tempToken;
		session.requires2FA = true;
	}

	/**
	 * This function validates that the request body conforms to the zod object signInBody. If
	 * the request body is not valid, it throws a zod error.
	 * @param body - A fastify request body to be evaluated.
	 */
	validateSignInBody(body: unknown) {
		signInBody.parse(body);
	}

	/**
	 * This function sends the user's credential to the REST API for signin in. If the response
	 * code is between 400 and 500 it throws an exception.
	 * @param body - A fastify request body with a username, password, email and a repeat password field.
	 * 				With the exception of the repeat password field, the rest of them are sent to the API.
	 * @returns If successful it returns some JSON with the email and username of the new user.
	 */
	async postSignIn(body: SignInBody) {
		const { username, email, password } = body;

		const { data, error } = await this.fastify.apiClient.POST("/v1/auth/sign-in", {
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
}