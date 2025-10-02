import { Type } from '@sinclair/typebox';

export const generate2FASchema = {
	tags: ['2FA'],
	summary: 'Generate 2FA secret and QR code',
	description: 'Generates a new secret for 2FA setup and returns a QR code',
	security: [{ bearerAuth: [] }],
	response: {
		200: Type.Object({
			secret: Type.String(),
			qrCode: Type.String({ description: 'Base64 encoded QR code image' })
		}),
		401: Type.Object({
			error: Type.String()
		})
	}
};

export const enable2FASchema = {
	tags: ['2FA'],
	summary: 'Enable 2FA for user account',
	description: 'Enables 2FA after verifying the token from authenticator app',
	security: [{ bearerAuth: [] }],
	response: {
		200: Type.Object({
			success: Type.Boolean()
		}),
		400: Type.Object({
			error: Type.String()
		}),
		401: Type.Object({
			error: Type.String()
		})
	}
};

export const verify2FASchema = {
	tags: ['2FA'],
	summary: 'Verify 2FA token',
	description: 'Verifies a 2FA token from authenticator app',
	security: [{ bearerAuth: [] }],
	response: {
		200: Type.Object({
			success: Type.Boolean()
		}),
		400: Type.Object({
			error: Type.String()
		}),
		401: Type.Object({
			error: Type.String()
		})
	}
};

export const disable2FASchema = {
	tags: ['2FA'],
	summary: 'Disable 2FA for user account',
	description: 'Disables 2FA after password verification',
	security: [{ bearerAuth: [] }],
	response: {
		200: Type.Object({
			success: Type.Boolean()
		}),
		401: Type.Object({
			error: Type.String()
		})
	}
};

export const get2FAStatusSchema = {
	tags: ['2FA'],
	summary: 'Get 2FA status',
	description: 'Returns whether 2FA is enabled for the current user',
	security: [{ bearerAuth: [] }],
	response: {
		200: Type.Object({
			enabled: Type.Boolean()
		}),
		401: Type.Object({
			error: Type.String()
		})
	}
};