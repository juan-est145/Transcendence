import { Avatar } from '@prisma/client';
import { SearchUsersResponse, GetUserResponse } from './users.type';
import { FastifyInstance } from 'fastify';
import { AccountService } from '../account/account.service';

/**
 * This class accepts the following parameters:
 * @param fastify - The current fastify instance.
 * @param account - The Account service class.
 */
export class UsersService {
	constructor(
		private fastify: FastifyInstance,
		private account: AccountService,
	) { }

	/**
	 * This function searches all users whose username contains the string found in the
	 * query parameter and returns an array with all the matches.
	 * @param query - The username to use to find the users.
	 * @returns If successful, it returns an array with all the found users inside an array.
	 * In case of an error, it throws it, for it to be catched elsewhere
	 */
	async searchUsers(query: string): Promise<SearchUsersResponse> {
		const users = await this.fastify.prisma.users.findMany({
			where: {
				username: {
					contains: query
				}
			},
			select: {
				id: true,
				username: true,
				email: true,
				profile: {
					select: {
						avatar: true,
						createdAt: true
					}
				}
			},
			take: 10,
			orderBy: {
				username: 'asc'
			}
		});

		return users.map((user) => {
			return {
				id: user.id,
				username: user.username,
				email: user.email,
				avatar: user.profile!.avatar as Avatar,
				createdAt: user.profile!.createdAt.toISOString(),
			}
		});
	}

	/**
	 * This function searches a user by it's username from the database and send's back it's
	 * profile and avatar information.
	 * @param username - The username associated to the user to search for.
	 * @returns If successful, it returns the information of the searched user. In case of error,
	 * it throws it, for it to be catched elsewhere.
	 */
	async getUserByUsername(username: string): Promise<GetUserResponse | null> {
		const user = await this.fastify.prisma.users.findUnique({
			where: {
				username: username
			},
			select: {
				id: true,
				username: true,
				email: true,
				profile: {
					include: {
						tournaments: {
							select: { rank: true }
						},
						avatar: true,
					},
				}
			}
		});

		if (!user) {
			return null;
		}

		const { victories, defeats } = this.account.addTourResults(user).profile;

		return {
			...user,
			avatar: user.profile?.avatar as Avatar,
			createdAt: user.profile!.createdAt.toISOString(),
			gamesPlayed: user.profile!.tournaments.length,
			wins: victories,
			losses: defeats,
		};
	}
}