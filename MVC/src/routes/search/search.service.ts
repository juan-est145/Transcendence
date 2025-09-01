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

	/**
	* Search users by username query
	* @param query - The search term to look for in usernames
	* @returns Array of users matching the search criteria
	*/
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

	/**
	* Get user profile by user ID
	* @param userId - The ID of the user to fetch
	* @returns User profile data
	*/
	async getUserById(userId: number): Promise<UserProfile> {
		try {
			const { data, error } = await this.fastify.apiClient.GET("/v1/users/{userId}", {
				params: { 
					path: { userId: userId.toString() } // Convertir a string
				}
			});
			
			if (error) {
				// Verificar el tipo de error de manera más segura
				if ((error as any)?.status === 404) {
					throw new Error('User not found');
				}
				throw new Error(`API error: ${JSON.stringify(error)}`);
			}
			
			return data;
		} catch (error: unknown) {
			const errorMessage = error instanceof Error ? error.message : 'Unknown error';
			throw new Error(`Error fetching user: ${errorMessage}`);
		}
	}
}