import { RouteShorthandOptions } from "fastify";
import { 
	Generate2FASecretDto, 
	Generate2FASecretResponse,
	Enable2FADto, 
	Verify2FADto, 
	Disable2FADto,
	TwoFactorSuccessResponse,
	TwoFactorStatusResponse
} from "./2fa.dto";
import { generalError } from "../root.dto";

const twoFactorTag = "2FA";

export const generate2FASchema: RouteShorthandOptions = {
	schema: {
		security: [{ bearerAuth: [] }],
		body: Generate2FASecretDto,
		tags: [twoFactorTag],
		summary: "Generate 2FA secret and QR code",
		description: "Generates a new secret for 2FA setup and returns a QR code that can be scanned by authenticator apps",
		response: {
			200: {
				description: "Successfully generated 2FA secret and QR code",
				content: {
					"application/json": {
						schema: Generate2FASecretResponse
					}
				}
			},
			400: {
				description: "If the JWT is not present, it will send a 400 response.",
				content: {
					"application/json": {
						schema: generalError
					}
				}
			},
			401: {
				description: "It returns an error message if the credentials are not correct.",
				content: {
					"application/json": {
						schema: generalError
					}
				}
			},
			500: {
				description: "If something else went wrong with the server, it sends back this response.",
				content: {
					"application/json": {
						schema: generalError
					}
				}
			}
		}
	}
};

export const enable2FASchema: RouteShorthandOptions = {
	schema: {
		security: [{ bearerAuth: [] }],
		body: Enable2FADto,
		tags: [twoFactorTag],
		summary: "Enable 2FA for user account",
		description: "Enables 2FA after verifying the token from authenticator app",
		response: {
			200: {
				description: "2FA successfully enabled for the user account",
				content: {
					"application/json": {
						schema: TwoFactorSuccessResponse
					}
				}
			},
			400: {
				description: "If the JWT is not present or verification token is invalid, it will send a 400 response.",
				content: {
					"application/json": {
						schema: generalError
					}
				}
			},
			401: {
				description: "It returns an error message if the credentials are not correct.",
				content: {
					"application/json": {
						schema: generalError
					}
				}
			},
			500: {
				description: "If something else went wrong with the server, it sends back this response.",
				content: {
					"application/json": {
						schema: generalError
					}
				}
			}
		}
	}
};

export const verify2FASchema: RouteShorthandOptions = {
	schema: {
		security: [{ bearerAuth: [] }],
		body: Verify2FADto,
		tags: [twoFactorTag],
		summary: "Verify 2FA token",
		description: "Verifies a 2FA token from authenticator app",
		response: {
			200: {
				description: "Token verification completed successfully",
				content: {
					"application/json": {
						schema: TwoFactorSuccessResponse
					}
				}
			},
			400: {
				description: "If the JWT is not present, 2FA is not enabled, or token format is invalid.",
				content: {
					"application/json": {
						schema: generalError
					}
				}
			},
			401: {
				description: "It returns an error message if the credentials are not correct.",
				content: {
					"application/json": {
						schema: generalError
					}
				}
			},
			500: {
				description: "If something else went wrong with the server, it sends back this response.",
				content: {
					"application/json": {
						schema: generalError
					}
				}
			}
		}
	}
};

export const disable2FASchema: RouteShorthandOptions = {
	schema: {
		security: [{ bearerAuth: [] }],
		body: Disable2FADto,
		tags: [twoFactorTag],
		summary: "Disable 2FA for user account",
		description: "Disables 2FA after password verification",
		response: {
			200: {
				description: "2FA successfully disabled for the user account",
				content: {
					"application/json": {
						schema: TwoFactorSuccessResponse
					}
				}
			},
			400: {
				description: "If the JWT is not present or 2FA is not enabled.",
				content: {
					"application/json": {
						schema: generalError
					}
				}
			},
			401: {
				description: "It returns an error message if the credentials are not correct.",
				content: {
					"application/json": {
						schema: generalError
					}
				}
			},
			404: {
				description: "If the user does not exist, it sends a 404 response.",
				content: {
					"application/json": {
						schema: generalError
					}
				}
			},
			500: {
				description: "If something else went wrong with the server, it sends back this response.",
				content: {
					"application/json": {
						schema: generalError
					}
				}
			}
		}
	}
};

export const get2FAStatusSchema: RouteShorthandOptions = {
	schema: {
		security: [{ bearerAuth: [] }],
		tags: [twoFactorTag],
		summary: "Get 2FA status",
		description: "Returns whether 2FA is enabled for the current user",
		response: {
			200: {
				description: "Current 2FA status for the authenticated user",
				content: {
					"application/json": {
						schema: TwoFactorStatusResponse
					}
				}
			},
			400: {
				description: "If the JWT is not present, it will send a 400 response.",
				content: {
					"application/json": {
						schema: generalError
					}
				}
			},
			401: {
				description: "It returns an error message if the credentials are not correct.",
				content: {
					"application/json": {
						schema: generalError
					}
				}
			},
			500: {
				description: "If something else went wrong with the server, it sends back this response.",
				content: {
					"application/json": {
						schema: generalError
					}
				}
			}
		}
	}
};