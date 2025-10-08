import * as z from "zod";

const token = z.string({ error: "Invalid token" })
	.length(6, { error: "Token must be exactly 6 digits" })
	.regex(/^\d+$/, { error: "Token must contain only numbers" });

const password = z.string({ error: "Invalid password" })
	.min(1, { error: "Password is required" });

const tempToken = z.string({ error: "Invalid temporary token" })
	.min(1, { error: "Temporary token is required" });

const secret = z.string({ error: "Invalid secret" })
	.min(1, { error: "Secret is required" });

export const disableTwoFactorBody = z.object({
	password
});

export const verifyTwoFactorBody = z.object({
	token
});

export const enableTwoFactorBody = z.object({
	secret,
	token
});

export const verifyLoginTwoFactorBody = z.object({
	code: token,
	tempToken
});