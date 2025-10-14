import { FastifyInstance, FastifyReply, FastifyRequest } from "fastify";
import { TwoFactorService } from "./2fa.service";
import { Generate2FASecretDto, Enable2FADto, Verify2FADto, Disable2FADto } from "./2fa.dto";
import { Generate2FASecretType, Enable2FAType, Verify2FAType, Disable2FAType } from "./2fa.type";
import { generate2FASchema, enable2FASchema, verify2FASchema, disable2FASchema, get2FAStatusSchema } from "./2fa.swagger";
import bcrypt from "bcrypt";

async function twoFactor(fastify: FastifyInstance): Promise<void> {
	const twoFactorService = new TwoFactorService(fastify.prisma);

	/**
	 * Generates a new 2FA secret and QR code for the authenticated user.
	 * @param request - The Fastify request object, which includes the authenticated user's details.
	 * @param reply - The Fastify reply object used to send the response.
	 * @returns An object containing the generated secret and QR code data URL.
	 */
	fastify.post<{ Body: Generate2FASecretType }>(
		'/generate',
		{
			...generate2FASchema,
			onRequest: [fastify.authenticate]
		},
		async (request: FastifyRequest, reply: FastifyReply) => {
			const userId = request.user.id;
			const email = request.user.email;
			const { secret, qrCode } = await twoFactorService.generateSecret(
				userId,
				email
			);
			return reply.send({
				secret,
				qrCode
			});
		}
	);

	/**
	 * Enables 2FA for the authenticated user after verifying the provided TOTP code.
	 * @param request - The Fastify request object, which includes the authenticated user's details and the request body.
	 * @param reply - The Fastify reply object used to send the response.
	 * @returns An object indicating whether 2FA was successfully enabled.
	 */
	fastify.post<{ Body: Enable2FAType }>(
		'/enable',
		{
			...enable2FASchema,
			onRequest: [fastify.authenticate]
		},
		async (request: FastifyRequest<{ Body: Enable2FAType }>, reply: FastifyReply) => {
			const userId = request.user.id;
			const { secret, token } = request.body;
			try {
				const result = await twoFactorService.enable2FA(userId, secret, token);
				return reply.send(result);
			} catch (error) {
				return reply.status(400).send({
					error: error instanceof Error ? error.message : 'Invalid verification code'
				});
			}
		}
	);

	/**
	 * Verifies a 2FA token for the authenticated user.
	 * @param request - The Fastify request object, which includes the authenticated user's details and the request body.
	 * @param reply - The Fastify reply object used to send the response.
	 * @returns An object indicating whether the token is valid.
	 */
	fastify.post<{ Body: Verify2FAType }>(
		'/verify',
		{
			...verify2FASchema,
			onRequest: [fastify.authenticate]
		},
		async (request: FastifyRequest<{ Body: Verify2FAType }>, reply: FastifyReply) => {
			const userId = request.user.id;
			const { token } = request.body;
			const user = await fastify.prisma.users.findUnique({
				where: { id: userId },
				select: { twoFactorSecret: true }
			});
			if (!user?.twoFactorSecret) {
				return reply.status(400).send({
					error: '2FA not enabled'
				});
			}
			const isValid = twoFactorService.verifyToken(user.twoFactorSecret, token);
			if (!isValid) {
				return reply.status(400).send({
					error: 'Invalid verification code'
				});
			}
			return reply.send({ success: true });
		}
	);

	/**
	 * Disables 2FA for the authenticated user after verifying their password.
	 * @param request - The Fastify request object, which includes the authenticated user's details and the request body.
	 * @param reply - The Fastify reply object used to send the response.
	 * @returns An object indicating whether 2FA was successfully disabled.
	 */
	fastify.post<{ Body: Disable2FAType }>(
		'/disable',
		{
			...disable2FASchema,
			onRequest: [fastify.authenticate]
		},
		async (request: FastifyRequest<{ Body: Disable2FAType }>, reply: FastifyReply) => {
			const userId = request.user.id;
			const { password } = request.body;
			try {
				const user = await fastify.prisma.users.findUnique({
					where: { id: userId },
					select: {
						password: true,
						twoFactorEnabled: true
					}
				});
				if (!user) {
					return reply.status(404).send({ error: 'User not found' });
				}
				const isPasswordValid = await bcrypt.compare(password, user.password);
				if (!isPasswordValid) {
					return reply.status(401).send({
						error: 'Invalid password'
					});
				}
				if (!user.twoFactorEnabled) {
					return reply.status(400).send({
						error: '2FA is not enabled'
					});
				}
				const result = await twoFactorService.disable2FA(userId);
				return reply.send(result);
			} catch (error) {
				console.error('Error disabling 2FA:', error);
				return reply.status(500).send({
					error: 'An error occurred while disabling 2FA'
				});
			}
		}
	);

	/**
	 * Gets the 2FA status for the authenticated user.
	 * @param request - The Fastify request object, which includes the authenticated user's details.
	 * @param reply - The Fastify reply object used to send the response.
	 * @returns An object indicating whether 2FA is enabled for the user.
	 */
	fastify.get(
		'/status',
		{
			...get2FAStatusSchema,
			onRequest: [fastify.authenticate]
		},
		async (request: FastifyRequest, reply: FastifyReply) => {
			const userId = request.user.id;
			const enabled = await twoFactorService.is2FAEnabled(userId);
			return reply.send({ enabled });
		}
	);
};

export { twoFactor };