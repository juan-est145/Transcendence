import { FastifyInstance } from 'fastify';
import { paramSearchProfile, queryUsersSearch } from './search.dto';
import { SearchProfileRes, SearchUserRes } from './search.type';

/**
 * This class accepts the following parameters
 * @param fastify - The current fastify instance
 */
export class SearchService {
	constructor(private fastify: FastifyInstance) { }

	/**
	 * This function sends a GET request with a query string as a parameter to the API
	 * to get a collection of user's whose username contains the query string. If the response
	 * it is not a 404 or a 200, it throws an error.
	 * @param query - A string of the username to search for.
	 * @returns An array of all the users that match that query string or an empty array if none
	 * are found.
	 */
	async searchUsers(query: string): Promise<SearchUserRes> {
		const { data, error, response } = await this.fastify.apiClient.GET("/v1/users/search", {
			params: {
				query: { q: query }
			}
		});
		if (error && response.status !== 404) {
			throw error;
		} else if (error && response.status === 404) {
			return [];
		}
		return data!;
	}

	/**
	 * This function sends a GET request with a string parameter as a parameter to the API
	 * to get the information of a user whose username is equal to the url parameter. If the
	 * response is not a 200 response it throws an error.
	 * @param username - A string of the username to search for.
	 * @returns The information of the searched user.
	 */
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

	/**
	 * This function validates that the query parameter conforms to the zod object
	 * queryUsersSearch. If the object is not valid, it throws a zod error.
	 * @param query - A string to be evaluated.
	 */
	validateUserQuery(query: unknown) {
		queryUsersSearch.parse(query);
	}

	/**
	 * This function validates that the param parameter conforms to the zod object
	 * paramSearchProfile. If the object is not valid, it throws a zod error.
	 * @param param - A string to be evaluated.
	 */
	validateSearchParam(param: unknown) {
		paramSearchProfile.parse(param);
	}

	/**
	 * This function takes a response object from the API with the relation between two 
	 * users and it use's the information in it to determine the status between the two user's.
	 * Depending on which user is pending in accepting the friend request, we compare the result's
	 * to know what value to return.
	 * @param username - A string of the username to whose relation is going to be compared to the
	 * logged in user.
	 * @returns A string literal. PENDING means that the other user must accept or reject the friend request.
	 * FRIENDS mean that both user's are friends. AWAITING means that the logged in user sent the request
	 * and is waiting for a response. NOT_FRIENDS mean that they have no relation.
	 */
	async determineRelation(username: string) {
		try {
			const result = await this.getFriendShipStatus(username);
			let status: "PENDING" | "NOT_FRIENDS" | "FRIENDS" | "AWAITING" = 'NOT_FRIENDS';
			if (result.status === "FRIENDS") {
				status = "FRIENDS";
			} else if (
				result.status === "FIRST_PENDING" && result.user1.username === username ||
				result.status === "SECOND_PENDING" && result.user2.username === username
			) {
				status = "AWAITING";
			} else if (
				result.status === "FIRST_PENDING" && result.user1.username !== username ||
				result.status === "SECOND_PENDING" && result.user2.username !== username
			) {
				status = "PENDING";
			}
			return status;
		} catch (error) {
			if (error instanceof Error && Object.hasOwn(error, "statusCode") && (error as any).statusCode === 404)
				return "NOT_FRIENDS";
			throw error;
		}
	}

	/**
	 * This function makes a GET request to the API to get the relationship between the
	 * logged in user and a username to be searched. If the response it is not a 200 response,
	 * it throws an error.
	 * @param username - The user's username to be compared with the logged in user and check their relation.
	 * @returns Both user's id's and usernames and their relation.
	 */
	async getFriendShipStatus(username: string) {
		const { data, error } = await this.fastify.apiClient.GET("/v1/account/friendship/{username}", {
			params: {
				path: {
					username
				}
			}
		});
		if (error) {
			throw error;
		}
		return data;
	}
}