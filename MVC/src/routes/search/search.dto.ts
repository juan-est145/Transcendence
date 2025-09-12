import z from "zod";

const queryMinLength = 2;
const queryMaxLength = 50;

export const queryUsersSearch = z.string({ error: "Query must be a string" })
	.min(queryMinLength, { error: `Query length must have at least a length of ${queryMinLength}` })
	.max(queryMaxLength, { error: `Maximum query length is ${queryMaxLength}` });

const paramMinLength = 1;
const paramMaxLength = 50;
	
export const paramSearchProfile = z.string({ error: "Parameter must be a string" })
	.min(paramMinLength, { error: `Parameter must have at least a length of ${paramMinLength}` })
	.max(paramMaxLength, { error: `Maximum parameter length is ${paramMaxLength}` })
	.regex(/^[a-zA-Z0-9_-]+$/)
