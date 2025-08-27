import { FastifyInstance } from "fastify";
import { JwtPayload } from "../auth/auth.type";
import { AccountRes } from "./account.type";

/**
 * This function retrieves an user and it's profile from the database. It also modifies the object
 * to include the victories and defeats suffered in tournaments.
 * @param fastify - The fastify instance. It is decorated with the prisma client.
 * @param jwtPayload - An object representative of the JWT with the user credentials.
 * Needed to know which user is asking for the data.
 * @returns If successulf, it returns the information of the user. In case of error,
 * it throws it, for it to be catched elsewhere.
 */
export async function getAccount(fastify: FastifyInstance, jwtPayload: JwtPayload) {
	// TO DO: Later on, we must include friends.
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