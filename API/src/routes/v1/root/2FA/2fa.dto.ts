import { Type } from '@sinclair/typebox';

export const Generate2FASecretDto = Type.Object({});

export const Enable2FADto = Type.Object({
	secret: Type.String({ minLength: 1}),
	token: Type.String({
		minLength: 6,
		maxLength: 6,
		pattern: '^[0-9]{6}$'
	})
});

export const Verify2FADto = Type.Object({
	token: Type.String({
		minLength: 6,
		maxLength: 6,
		pattern: '^[0-9]{6}$'
	})
});

export const Disable2FADto = Type.Object({
	password: Type.String({ minLength: 1 })
});