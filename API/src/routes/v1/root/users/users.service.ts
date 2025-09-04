import { PrismaClient } from '@prisma/client';
import { SearchUsersResponse, GetUserResponse } from './users.type';

export class UsersService {
	constructor(private prisma: PrismaClient) {}
	
	async searchUsers(query: string): Promise<SearchUsersResponse[]> {
		const users = await this.prisma.users.findMany({
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
		
		return users.map(user => ({
			id: user.id,
			username: user.username,
			email: user.email,
			avatar: user.profile?.avatar || null,
			createdAt: user.profile?.createdAt.toISOString() || new Date().toISOString()
		}));
	}
	
	async getUserByUsername(username: string): Promise<GetUserResponse | null> {
		const user = await this.prisma.users.findUnique({
			where: {
				username: username
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
			}
		});
		
		if (!user) {
			return null;
		}

		// Add game statistics
		return {
			id: user.id,
			username: user.username,
			email: user.email,
			avatar: user.profile?.avatar || null,
			createdAt: user.profile?.createdAt.toISOString() || new Date().toISOString(),
			gamesPlayed: 0, // Not implemented
			wins: 0,        // Not implemented
			losses: 0       // Not implemented
		};
	}
}