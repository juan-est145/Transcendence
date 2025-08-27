import { FastifyInstance } from "fastify";
import { JwtPayload } from "../auth/auth.type";
import { AccountRes } from "./account.type";


export async function getAccount(fastify: FastifyInstance, jwtPayload: JwtPayload) {
	// TO DO: Later on, we must include tournaments, victories and friends.
	try {
		const query = await fastify.prisma.users.findUnique({
			where: {
				username: jwtPayload.username,
				email: jwtPayload.email,
			},
			select: {
				profile: {
					include: {
						tournaments: {
							select: { rank: true }
						}
					}
				},
				username: true,
				email: true
			}
		});

		const tournaments = query!.profile!.tournaments || [];
		const victories = tournaments.filter(t => t.rank === 1).length;
		const defeats = tournaments.filter(t => t.rank !== 1).length;
		const result: AccountRes = {
			...query!,
			profile: {
				id: query!.profile!.id,
				createdAt: query!.profile!.createdAt.toISOString(),
				updatedAt: query!.profile!.updatedAt.toISOString(),
				avatar: query!.profile!.avatar,
				online: query!.profile!.online,
				victories,
				defeats
			}
		};
		return result;
	} catch (error) {
		throw error;
	}
}