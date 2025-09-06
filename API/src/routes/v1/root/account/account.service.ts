import { FastifyInstance } from "fastify";
import { JwtPayload } from "../auth/auth.type";
import { AccountPostAvatarBody, AccountRes, GetAccntQuery } from "./account.type";
import { PrismaClientKnownRequestError } from "@prisma/client/runtime/library";
import { httpErrors } from "@fastify/sensible";
import { getUser } from "../auth/auth.service";

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
		const query = await fastify.prisma.users.findUniqueOrThrow({
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
		return addTourResults(query!);
	} catch (error) {
		if (error instanceof PrismaClientKnownRequestError && error.code == "P2025")
			throw httpErrors.notFound();
		throw error;
	}
}

export async function getAvatar(fastify: FastifyInstance, jwtPayload: JwtPayload) {
	try {
		const { username, email } = jwtPayload;
		const avatar = await fastify.prisma.avatar.findFirstOrThrow({
			where: {
				profile: {
					user: {
						email,
						username,
					}
				}
			}
		});
		return avatar;
	} catch (error) {
		if (error instanceof PrismaClientKnownRequestError && error.code === "P2025")
			throw httpErrors.notFound();
		throw error;
	}
}

export async function updateAvatar(fastify: FastifyInstance, email: string, avatar: AccountPostAvatarBody) {
	try {
		const { profile } = await getUser(fastify, email);
		const { name, contentType } = avatar;
		const result = await fastify.prisma.avatar.update({
			where: { id: profile?.id },
			data: {
				name,
				contentType,
			}
		});
		return result;
	} catch (error) {
		if (error instanceof PrismaClientKnownRequestError && error.code === "")
			throw httpErrors.notFound();
		throw error;
	}
}

function addTourResults(query: GetAccntQuery) {
	const tournaments = query!.profile!.tournaments || [];
	const victories = tournaments.filter(t => t.rank === 1).length;
	const defeats = tournaments.filter(t => t.rank !== 1).length;
	const result: AccountRes = {
		...query!,
		profile: {
			id: query!.profile!.id,
			createdAt: query!.profile!.createdAt.toISOString(),
			updatedAt: query!.profile!.updatedAt.toISOString(),
			online: query!.profile!.online,
			victories,
			defeats,
		}
	};
	return result;
}