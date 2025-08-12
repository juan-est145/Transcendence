import * as z from "zod";

const email = z.email();
const password = z.string().min(3).max(20);

export const logInBody = z.object({
	email,
	password
});