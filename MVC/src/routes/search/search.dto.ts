import z from "zod";

const minLength = 2;
const maxLength = 50;

export const queryUsersSearch = z.string({ error: "Query must be a string" })
	.min(minLength, { error: `Query length must have at least a length of ${minLength}` })
	.max(maxLength, { error: `Maximum query length is ${maxLength}` });