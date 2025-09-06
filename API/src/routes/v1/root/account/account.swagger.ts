import { RouteShorthandOptions } from "fastify";
import { accountAvatarRes, accountRes } from "./account.dto";
import { generalError } from "../root.dto";

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
						schema: generalError,
					}
				}
			},
			404: {
				description: "In the rare instance that the user in the jwt no longer exists, it will send a 404 response",
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
	}
}

export const getAvatarSchema: RouteShorthandOptions = {
	schema: {
		security: [{ bearerAuth: [] }],
		tags: [accountTag],
		summary: "This endpoint returns the avatar information of the logged in user",
		response: {
			200: {
				description: "It returns data non-confidential data of the user's profile and user table",
				content: {
					"application/json": {
						schema: accountAvatarRes,
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
				description: "In the rare instance that the user in the jwt no longer exists, it will send a 404 response",
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
	}
};