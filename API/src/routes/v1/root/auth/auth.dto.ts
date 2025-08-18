import { Type } from '@sinclair/typebox';
import { baseHttpError } from '../../v1.dto';

const username = Type.String({ minLength: 3, maxLength: 20 });
const email = Type.String({ format: "email" });
const password = Type.String({ minLength: 3, maxLength: 20 });

export const signInBody = Type.Object({
	username,
	password,
	email,
});

export const singInRes = Type.Object({
	username,
	email,
});

export const authError = Type.Intersect([
	baseHttpError,
	Type.Object({
		details: Type.Optional(
			Type.Array(
				Type.Object({
					field: Type.Optional(Type.String()),
					msg: Type.Optional(Type.Array(Type.String())),
				}),
			)
		)
	}
	)
]);

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