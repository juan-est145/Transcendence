import { FastifyInstance } from "fastify";
import { JwtPayload } from "../auth/auth.type";


export async function getAccount(fastify: FastifyInstance, jwtPayload: JwtPayload) {
	// TO DO: Later on, we must include tournaments, victories and friends.
	try {
		const result = await fastify.prisma.users.findUnique({
			where: {
				username: jwtPayload.username,
				email: jwtPayload.email,
			},
			select: {
				profile: true,
				username: true,
				email: true
			}
		});
		return result;
	} catch (error) {
		throw error;
	}
}