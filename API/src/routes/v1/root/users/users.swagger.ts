import { RouteShorthandOptions } from "fastify";
import { searchUsersQuery, getUserParams, searchUsersResponse, getUserResponse } from "./users.dto";
import { generalError } from "../root.dto";
import { Type } from '@sinclair/typebox';

export const searchUsersSchema: RouteShorthandOptions = {
	schema: {
		security: [{ bearerAuth: [] }],
		querystring: searchUsersQuery,
		tags: ["Users"],
		summary: "Search users by username",
		response: {
			200: {
				description: "List of users matching the search query",
				content: {
					"application/json": {
						schema: searchUsersResponse,
					},
				}
			},
			400: {
				description: "If the jwt is not present, it will send a 400 response.",
				content: {
					"application/json": {
						schema: generalError,
					}
				}
			},
			404: {
				description: "If there are no users, it sends a 404 response with an empty array",
				content: {
					"application/json": {
						schema: Type.Array(Type.Any(), { minItems: 0, maxItems: 0 }),
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
		},
	}
};

export const getUserSchema: RouteShorthandOptions = {
	schema: {
		security: [{ bearerAuth: [] }],
		params: getUserParams,
		response: {
			200: {
				description: "User profile information",
				content: {
					"application/json": {
						schema: getUserResponse,
					}
				}
			},
			400: {
				description: "If the jwt is not present, it will send a 400 response.",
				content: {
					"application/json": {
						schema: generalError,
					}
				}
			},
			404: {
				description: "If the user does not exist, it sends a 404 response",
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
		},
		tags: ["Users"],
		summary: "Get user profile by username"
	}
};