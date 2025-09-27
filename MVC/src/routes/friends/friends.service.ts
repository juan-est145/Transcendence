import { FastifyInstance } from "fastify";
import { SearchService } from "../search/search.service";
import { relationShipBody } from "./friends.dto";
import { RelationShipBody } from "./friends.type";

export class FriendsService {
	constructor(
		private fastify: FastifyInstance, 
		private searchService: SearchService,
	) {}

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

	validateRelationShipBody(param: unknown) {
		relationShipBody.parse(param);
	}

	async handleFriendShip(username: string, body: RelationShipBody) {
		const { data, error } = await this.fastify.apiClient.PUT("/v1/account/friendship/{username}", {
			params: {
				path: {
					username
				}				
			},
			body
		});
		if (error)
			throw error;
		return data;
	}
}