import { RouteShorthandOptions } from "fastify";
import { accountAvatarRes, accountPostAvatarBody, accountPostAvatarRes, accountRes } from "./account.dto";
import { generalError } from "../root.dto";

const accountTag = "Account";

export const getAccountSchema: RouteShorthandOptions = {
	schema: {
		security: [{ bearerAuth: [] }],
		tags: [accountTag],
		summary: "This endpoint returns the information of the logged in user",
		response: {
			200: {
				description: "It returns non-confidential data of the user's profile and user table",
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
				description: "It returns data of the logged in user's avatar",
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

export const postAvatarSchema: RouteShorthandOptions = {
	schema: {
		body: accountPostAvatarBody,
		security: [{ bearerAuth: [] }],
		tags: [accountTag],
		summary: "This endpoint updates the avatar information of the logged in user",
		response: {
			201: {
				description: "Returns the new values of the avatar instance",
				content: {
					"application/json": {
						schema: accountPostAvatarRes,
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

export const getUserAvatarSchema: RouteShorthandOptions = {
	schema: {
		security: [{ bearerAuth: [] }],
		tags: [accountTag],
		summary: "This endpoint returns the avatar information of the requested user",
		response: {
			200: {
				description: "It returns the data of the searched user's avatar",
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
				description: "If the username does not exist, it returns a 404 response.",
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