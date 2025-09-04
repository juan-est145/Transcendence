import { FastifyInstance } from 'fastify';

interface UserProfile {
	id: number;
	username: string;
	email: string;
	avatar: string | null;
	createdAt: string;
	gamesPlayed: number;
	wins: number;
	losses: number;
}

interface SearchUser {
	id: number;
	username: string;
	email: string;
	avatar: string | null;
	createdAt: string;
}

export class SearchService {
	private fastify: FastifyInstance;

	constructor(fastify: FastifyInstance) {
		this.fastify = fastify;
	}

	async searchUsers(query: string): Promise<SearchUser[]> {
		try {
			const { data, error } = await this.fastify.apiClient.GET("/v1/users/search", {
				params: { 
					query: { q: query } 
				}
			});
			
			if (error) {
				throw new Error(`API error: ${JSON.stringify(error)}`);
			}
			
			return data;
		} catch (error: unknown) {
			const errorMessage = error instanceof Error ? error.message : 'Unknown error';
			throw new Error(`Error searching users: ${errorMessage}`);
		}
	}

	async getUserByUsername(username: string): Promise<UserProfile> {
		try {
			const { data, error } = await this.fastify.apiClient.GET("/v1/users/{username}", {
				params: { 
					path: { username }
				}
			});
			
			if (error) {
				const statusCode = (error as any)?.statusCode || (error as any)?.status;

 				if (statusCode === 404) {
 				   throw new Error('User not found');
 			   }
			
 			   throw new Error(`API error: ${statusCode}`);
			}
			
			return data;
		} catch (error: unknown) {
			if (error instanceof Error && error.message === 'User not found') {
				throw error;
			}
		
			if (error instanceof Error && error.message.includes('404')) {
				throw new Error('User not found');
			}
		
			const errorMessage = error instanceof Error ? error.message : 'Unknown error';
			throw new Error(`Error fetching user: ${errorMessage}`);
		}
	}
}