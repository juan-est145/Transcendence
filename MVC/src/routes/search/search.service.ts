import { FastifyInstance } from 'fastify';
import { queryUsersSearch } from './search.dto';
import { SearchUserRes } from './search.type';

export class SearchService {
	private fastify: FastifyInstance;

	constructor(fastify: FastifyInstance) {
		this.fastify = fastify;
	}

	async searchUsers(query: string): Promise<SearchUserRes> {
		try {
			const { data, error, response } = await this.fastify.apiClient.GET("/v1/users/search", {
				params: {
					query: { q: query }
				}
			});
			if (error && response.status !== 404) {
				throw new Error(`API error: ${JSON.stringify(error)}`);
			} else if (error && response.status === 404) {
				return [];
			}
			return data!;
		} catch (error) {
			throw error;
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

	validateUserQuery(query: unknown) {
		queryUsersSearch.parse(query);
	}
}