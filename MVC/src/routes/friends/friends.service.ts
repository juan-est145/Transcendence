import { FastifyInstance } from "fastify";
import { SearchService } from "../search/search.service";
import { relationShipBody } from "./friends.dto";
import { RelationShipBody } from "./friends.type";

export class FriendsService {
	constructor(
		private fastify: FastifyInstance,
		private searchService: SearchService,
	) { }

	/**
	 * This function validates that the param parameter conforms to the zod object
	 * paramSearchProfile. If the object is not valid, it throws a zod error.
	 * @param param - A string to be evaluated.
	 */
	validateUserParam(param: unknown) {
		this.searchService.validateSearchParam(param);
	}

	/**
	 * This function sends a POST request to create a new friendship request between the logged in
	 * user and another user. If the response is not a 200 response, it throws an error.
	 * @param username - The username of the new user to befriend.
	 * @returns An object with both the id's of the user's and the status of the new relationship.
	 */
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

	/**
	 * This function validates that the param parameter conforms to the zod object
	 * relationShipBody. If the object is not valid, it throws a zod error.
	 * @param param - An element to be evaluated.
	 */
	validateRelationShipBody(param: unknown) {
		relationShipBody.parse(param);
	}

	/**
	 * This function sends a PUT request to the API to either accept or decline a friend request or delete a 
	 * friendship. If the response is not a 200 response, it throws an error.
	 * @param username - The username on to modify the relation to the logged in user.
	 * @param body - A body for the request with a union literal between ACCEPT and DELETE to know what to do with the relation.
	 * @returns It always sends an object with both user's id and a status element. If the petition accepted
	 * the new relationship, the response object will reflect the new relationship. If the petition was to delete a friendship or reject
	 * a petition, the response object will reflect the previous relation prior to being deleted.
	 */
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