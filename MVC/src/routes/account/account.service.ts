import { FastifyInstance } from "fastify";

/**
 * This function sends a GET request using a JWT to get the account and profile information.
 * If the response is between 400 and 500 it throws an exception.
 * @param fastify - The fastify instance. It is decorated with the API client.
 * @returns If successful, it returns a JSON object with the profile info of the user.
 */
export async function getProfileInfo(fastify: FastifyInstance) {
	const { data, error } = await fastify.apiClient.GET("/v1/account/");
	if (error)
		throw error;
	return data;
}