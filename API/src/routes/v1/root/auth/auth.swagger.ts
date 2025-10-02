import { signInBody, singInRes, logInBody, jwt, verify2FALoginBody } from "./auth.dto";
import { RouteShorthandOptions } from "fastify";
import { generalError } from "../root.dto";
import { Type } from "@sinclair/typebox";

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
						schema: generalError,
					}
				}
			},
			409: {
				description: "If a username or email are already registered, it sends back this response",
				content: {
					"application/json": {
						schema: generalError,
					}
				}
			},
			500: {
				description: "If something else went wrong with the server, it sends back this response",
				content: {
					"application/json": {
						schema: generalError,
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
						schema: Type.Union([
							Type.Object({
								requires2FA: Type.Literal(false),
								jwt: Type.String(),
								refreshJwt: Type.String(),
								user: Type.Object({
									username: Type.String(),
									email: Type.String()
								})
							}),
							Type.Object({
								requires2FA: Type.Literal(true),
								tempToken: Type.String(),
								message: Type.String()
							})
						])
					}
				}
			},
			400: {
				description: "If a field is invalid or missing, it will return a message with the field that is invalid.",
				content: {
					"application/json": {
						schema: generalError,
					}
				}
			},
			401: {
				description: "It returns an error message if the credentials are not correct.",
				content: {
					"application/json": {
						schema: generalError,
					}
				}
			},
			500: {
				description: "If something else went wrong with the server, it sends back this response.",
				content: {
					"application/json": {
						schema: generalError,
					}
				}
			},
		}
	},
}

export const verify2FALoginSchema: RouteShorthandOptions = {
	schema: {
		body: verify2FALoginBody,
		tags: [authTag],
		summary: "This endpoint verifies a 2FA token and completes the login process",
		response: {
			201: {
				description: "It returns JWT tokens after successful 2FA verification",
				content: {
					"application/json": {
						schema: Type.Object({
							jwt: Type.String(),
							refreshJwt: Type.String(),
							user: Type.Object({
								username: Type.String(),
								email: Type.String()
							})
						}),
					}
				}
			},
			400: {
				description: "If the token is invalid or 2FA is not configured.",
				content: {
					"application/json": {
						schema: generalError,
					}
				}
			},
			401: {
				description: "If the 2FA token is incorrect.",
				content: {
					"application/json": {
						schema: generalError,
					}
				}
			},
			500: {
				description: "If something else went wrong with the server.",
				content: {
					"application/json": {
						schema: generalError,
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
						schema: generalError,
					}
				}
			},
			401: {
				description: "It returns an error message if the credentials are not correct.",
				content: {
					"application/json": {
						schema: generalError,
					}
				}
			},
			500: {
				description: "If something else went wrong with the server, it sends back this response.",
				content: {
					"application/json": {
						schema: generalError,
					}
				}
			},
		}
	},
};