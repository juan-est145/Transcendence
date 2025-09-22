import { Type } from '@sinclair/typebox';

export const username = Type.String({ minLength: 3, maxLength: 50 });
export const email = Type.String({ format: "email" });
const password = Type.String({ minLength: 3, maxLength: 50 });

export const signInBody = Type.Object({
	username,
	password,
	email,
});

export const singInRes = Type.Object({
	username,
	email,
});

export const logInBody = Type.Object({
	email,
	password,
});

export const jwtPayload = Type.Object({
	username,
	email,
});

export const jwt = Type.Object({
	jwt: Type.String(),
	refreshJwt: Type.String(),
});