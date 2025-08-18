import { signInBody, singInRes, authError, logInBody, jwt } from "./auth.dto";
import { RouteShorthandOptions } from "fastify";

const authTag = "Auth"

export const signInSchema: RouteShorthandOptions = {
	schema: {
		body: signInBody,
		tags: [authTag],
		summary: "This endpoint allows for the creation of a user",
		response: {
			201: {
				description: "It returns the username and email of the new account",
				content: {
					"application/json": {
						schema: singInRes,
					}
				}
			},
			400: {
				description: "If a field is invalid or missing, it will return a message with the field that is invalid",
				content: {
					"application/json": {
						schema: authError,
					}
				}
			},
			409: {
				description: "If a username or email are already registered, it sends back this response",
				content: {
					"application/json": {
						schema: authError,
					}
				}
			},
			500: {
				description: "If something else went wrong with the server, it sends back this response",
				content: {
					"application/json": {
						schema: authError,
					}
				}
			},
		},
	}
}

export const logInSchema: RouteShorthandOptions = {
	schema: {
		body: logInBody,
		tags: [authTag],
		summary: "This endpoint allows an user to log in",
		response: {
			201: {
				description: "It returns an object with a jwt and a refresh token.",
				content: {
					"application/json": {
						schema: jwt,
					}
				}
			},
			400: {
				description: "If a field is invalid or missing, it will return a message with the field that is invalid.",
				content: {
					"application/json": {
						schema: authError,
					}
				}
			},
			401: {
				description: "It returns an error message if the credentials are not correct.",
				content: {
					"application/json": {
						schema: authError,
					}
				}
			},
			500: {
				description: "If something else went wrong with the server, it sends back this response.",
				content: {
					"application/json": {
						schema: authError,
					}
				}
			},
		}
	},
}

export const refreshSchema: RouteShorthandOptions = {
	schema: {
		security: [{ bearerAuth: [] }],
		tags: [authTag],
		summary: "This endpoint returns new tokens if a refresh token is provided.",
		response: {
			201: {
				description: "It returns an object with a jwt and a refresh token.",
				content: {
					"application/json": {
						schema: jwt,
					}
				}
			},
			400: {
				description: "If a field is invalid or missing, it will return a message with the field that is invalid.",
				content: {
					"application/json": {
						schema: authError,
					}
				}
			},
			401: {
				description: "It returns an error message if the credentials are not correct.",
				content: {
					"application/json": {
						schema: authError,
					}
				}
			},
			500: {
				description: "If something else went wrong with the server, it sends back this response.",
				content: {
					"application/json": {
						schema: authError,
					}
				}
			},
		}
	},
};