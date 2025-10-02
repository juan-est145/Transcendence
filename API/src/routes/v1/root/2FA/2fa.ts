import { FastifyInstance, FastifyReply, FastifyRequest } from "fastify";
import { TwoFactorService } from "./2fa.service";
import { Generate2FASecretDto, Enable2FADto, Verify2FADto, Disable2FADto } from "./2fa.dto";
import { Generate2FASecretType, Enable2FAType, Verify2FAType, Disable2FAType } from "./2fa.type";
import { generate2FASchema, enable2FASchema, verify2FASchema, disable2FASchema, get2FAStatusSchema } from "./2fa.swagger";

async function twoFactor(fastify: FastifyInstance): Promise<void> {
	const twoFactorService = new TwoFactorService(fastify.prisma);

	// POST /api/v1/2fa/generate - Generate secret and QR code
	fastify.post<{ Body: Generate2FASecretType }>(
		'/generate',
		{
			schema: {
				body: Generate2FASecretDto,
				...generate2FASchema
			},
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

	// POST /api/v1/2fa/enable - Enable 2FA
	fastify.post<{ Body: Enable2FAType }>(
		'/enable',
		{
			schema: {
				body: Enable2FADto,
				...enable2FASchema
			},
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

	// POST /api/v1/2fa/verify - Verify 2FA token
	fastify.post<{ Body: Verify2FAType }>(
		'/verify',
		{
			schema: {
				body: Verify2FADto,
				...verify2FASchema
			},
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

	// POST /api/v1/2fa/disable - Disable 2FA
	fastify.post<{ Body: Disable2FAType }>(
		'/disable',
		{
			schema: {
				body: Disable2FADto,
				...disable2FASchema
			},
			onRequest: [fastify.authenticate]
		},
		async (request: FastifyRequest<{ Body: Disable2FAType }>, reply: FastifyReply) => {
			const userId = request.user.id;

			// Verify password before disabling 2FA
			const user = await fastify.prisma.users.findUnique({
				where: { id: userId },
				select: { password: true }
			});

			if (!user) {
				return reply.status(404).send({ error: 'User not found' });
			}

			const result = await twoFactorService.disable2FA(userId);
			return reply.send(result);
		}
	);

	// GET /api/v1/2fa/status - Get 2FA status
	fastify.get(
		'/status',
		{
			schema: get2FAStatusSchema,
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