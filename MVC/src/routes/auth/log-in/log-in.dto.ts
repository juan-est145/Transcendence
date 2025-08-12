import * as z from "zod";

const passwordOpt = {
	minLength: 3,
	maxLength: 20,
};

const email = z.email({ error: "Email does not have an email format" });

const password = z.string({ error: "Invalid password" })
	.min(passwordOpt.minLength, { error: `Password minimum length must be ${passwordOpt.minLength}` })
	.max(passwordOpt.maxLength, { error: `Password maximum length must be ${passwordOpt.maxLength}` });

export const logInBody = z.object({
	email,
	password
});