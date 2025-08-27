import { RouteShorthandOptions } from "fastify";
import { accountRes } from "./account.dto";

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
			}
		}
	}
}