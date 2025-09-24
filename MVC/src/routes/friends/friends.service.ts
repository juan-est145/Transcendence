import { FastifyInstance } from "fastify";
import { SearchService } from "../search/search.service";

export class FriendsService {
	constructor(private fastify: FastifyInstance, private searchService: SearchService) {}

	validateUserParam(param: unknown) {
		this.searchService.validateSearchParam(param);
	}

	async makeFriend(username: string) {
		const { data, error } = await this.fastify.apiClient.POST("/v1/account/friends/{username}", {
			params: {
				path: { username },
			}
		});
		if (error)
			throw error;
		return data;
	}
}