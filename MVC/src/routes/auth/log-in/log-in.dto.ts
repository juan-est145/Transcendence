import * as z from "zod";

const email = z.email();
const password = z.string().min(3).max(20);

export const logInBody = z.object({
	email,
	password
});

// //const email = Type.String({ format: "email"});
// const password = Type.String({ minLength: 3, maxLength: 20 });

// export const logInBody = Type.Object({
// 	email: Type.String({ format: "email" }),
// 	password,
// });