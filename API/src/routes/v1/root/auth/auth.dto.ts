import { Type } from '@sinclair/typebox';
import { baseHttpError } from '../../v1.dto';

export const signInBody = Type.Object({
	username: Type.String({ minLength: 3, maxLength: 20 }),
	password: Type.String({ minLength: 3, maxLength: 20 }),
	email: Type.String({ format: "email" })
});

export const singInRes = Type.Object({
	username: Type.String({ minLength: 3, maxLength: 20 }),
	email: Type.String({ format: "email" })
});

export const signInError = Type.Intersect([
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