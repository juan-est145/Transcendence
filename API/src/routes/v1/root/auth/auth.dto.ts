import { Type } from '@sinclair/typebox';

export const signInBody = Type.Object({
	username: Type.String({ minLength: 3, maxLength: 20 }),
	password: Type.String({ minLength: 3, maxLength: 20 }),
	email: Type.String({ format: "email" })
});
