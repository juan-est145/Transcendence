import { Avatar } from '@prisma/client';
import { SearchUsersResponse, GetUserResponse } from './users.type';
import { FastifyInstance } from 'fastify';
import { AccountService } from '../account/account.service';

export class UsersService {
	constructor(
		private fastify: FastifyInstance,
		private account: AccountService,
	) {}
	
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