import { Type } from '@sinclair/typebox';

const token = Type.String({
	minLength: 6,
	maxLength: 6,
	pattern: '^[0-9]{6}$',
	description: 'Six-digit TOTP code from authenticator app'
});

const secret = Type.String({
	minLength: 16,
	description: 'Base32 encoded secret for TOTP generation'
});

export const Generate2FASecretDto = Type.Object({});

export const Generate2FASecretResponse = Type.Object({
	secret: Type.String({ description: 'Base32 encoded secret for manual entry' }),
	qrCode: Type.String({ description: 'Base64 encoded QR code data URL' })
});

export const Enable2FADto = Type.Object({
	secret,
	token
});

export const TwoFactorSuccessResponse = Type.Object({
	success: Type.Boolean()
});

export const Verify2FADto = Type.Object({
	token,
	userId: Type.Optional(Type.Number({ description: 'User ID (for OAuth login)' }))
});

export const Verify2FAWithJWTResponse = Type.Object({
	success: Type.Boolean(),
	jwt: Type.Optional(Type.String({ description: 'JWT token (only for OAuth login)' })),
	refreshJwt: Type.Optional(Type.String({ description: 'Refresh JWT token (only for OAuth login)' })),
	user: Type.Optional(Type.Object({
		id: Type.Number(),
		email: Type.String(),
		username: Type.String()
	}))
});

export const Disable2FADto = Type.Object({
	token
});

export const TwoFactorStatusResponse = Type.Object({
	enabled: Type.Boolean()
});