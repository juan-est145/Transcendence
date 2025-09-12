import { FastifyInstance } from 'fastify';
import { paramSearchProfile, queryUsersSearch } from './search.dto';
import { SearchProfileRes, SearchUserRes } from './search.type';

export class SearchService {
	private fastify: FastifyInstance;

	constructor(fastify: FastifyInstance) {
		this.fastify = fastify;
	}

	async searchUsers(query: string): Promise<SearchUserRes> {
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
	}

	async getUserByUsername(username: string): Promise<SearchProfileRes> {
		const { data, error } = await this.fastify.apiClient.GET("/v1/users/{username}", {
			params: {
				path: { username }
			}
		});
		if (error) {
			throw error;
		}

		return data;
	}

	validateUserQuery(query: unknown) {
		queryUsersSearch.parse(query);
	}

	validateSearchParam(param: unknown) {
		paramSearchProfile.parse(param);
	}
}