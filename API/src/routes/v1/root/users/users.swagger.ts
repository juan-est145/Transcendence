import { RouteShorthandOptions } from "fastify";
import { SearchUsersQuery, GetUserParams, SearchUsersResponse, GetUserResponse } from "./users.dto";

export const searchUsersSchema: RouteShorthandOptions = {
	schema: {
		querystring: SearchUsersQuery,
		response: {
			200: {
				description: "List of users matching the search query",
				content: {
					"application/json": {
						schema: SearchUsersResponse,
					},
				}
			}
		},
		tags: ["Users"],
		summary: "Search users by username"
	}
};

export const getUserSchema: RouteShorthandOptions = {
	schema: {
		params: GetUserParams,
		response: {
			200: {
				description: "User profile information",
				content: {
					"application/json": {
						schema: GetUserResponse,
					}
				}
			}
		},
		tags: ["Users"],
		summary: "Get user profile by username"
	}
};