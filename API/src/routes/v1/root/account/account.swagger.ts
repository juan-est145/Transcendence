import { RouteShorthandOptions } from "fastify";

const accountTag = "Account";

export const getAccountSchema: RouteShorthandOptions = {
	schema: {
		security: [{ bearerAuth: [] }],
		tags: [accountTag],
	}
}