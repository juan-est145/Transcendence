import { RouteShorthandOptions } from "fastify";
import { accountRes } from "./account.dto";
import { accountError } from "./account.dto";

const accountTag = "Account";

export const getAccountSchema: RouteShorthandOptions = {
	schema: {
		security: [{ bearerAuth: [] }],
		tags: [accountTag],
		summary: "This endpoint returns the information of the logged in user",
		response: {
			200: {
				description: "It returns data non-confidential data of the user's profile and user table",
				content: {
					"application/json": {
						schema: accountRes,
					}
				}
			},
			400: {
				description: "If the jwt is not present, it will send a 400 response.",
				content: {
					"application/json": {
						schema: accountError,
					}
				}
			},
			401: {
				description: "It returns an error message if the credentials are not correct.",
				content: {
					"application/json": {
						schema: accountError,
					}
				}
			},
			500: {
				description: "If something else went wrong with the server, it sends back this response.",
				content: {
					"application/json": {
						schema: accountError,
					}
				}
			},
		}
	}
}