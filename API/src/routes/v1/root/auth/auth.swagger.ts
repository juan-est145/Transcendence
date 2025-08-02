import { signInBody, singInRes, signInError } from "./auth.dto";
import { RouteShorthandOptions } from "fastify";

export const signInSchema: RouteShorthandOptions = {
	schema: {
		body: signInBody,
		response: {
			201: {
				description: "It returns the username and email of the new account",
				content: {
					"application/json": {
						schema: singInRes
					}
				}
			},
			400: {
				description: "If a field is invalid or missing, it will return a message with the field that is invalid",
				content: {
					"application/json": {
						schema: signInError
					}
				}
			},
			409: {
				description: "If a username or email are already registered, it sends back this response",
				content: {
					"application/json": {
						schema: signInError
					}
				}
			},
			500: {
				description: "If something else went wrong with the server, it sends back this response",
				content: {
					"application/json": {
						schema: signInError
					}
				}
			},
		},
		tags: ["Auth"],
		summary: "This endpoint allows for the creation of a user"
	}
}