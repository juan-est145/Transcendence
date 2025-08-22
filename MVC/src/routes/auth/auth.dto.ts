import * as z from "zod";

const passwordOpt = {
	minLength: 3,
	maxLength: 20,
};

const usernameOpt = {
	minLength: 3,
	maxLength: 20,
};

const email = z.email({ error: "Email does not have an email format" });
const username = z.string().min(usernameOpt.minLength, { error: `Username minimum length must be ${usernameOpt.minLength}` })
	.max(usernameOpt.maxLength, { error: `Username maximum length must be ${usernameOpt.maxLength}` });
const password = z.string({ error: "Invalid password" })
	.min(passwordOpt.minLength, { error: `Password minimum length must be ${passwordOpt.minLength}` })
	.max(passwordOpt.maxLength, { error: `Password maximum length must be ${passwordOpt.maxLength}` });

export const logInBody = z.object({
	email,
	password
});

export const signInBody = z.object({
	email,
	password,
	username,
});