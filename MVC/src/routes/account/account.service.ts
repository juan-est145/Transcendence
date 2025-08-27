import { FastifyInstance } from "fastify";

export async function getProfileInfo(fastify: FastifyInstance) {

	const { data, error } = await fastify.apiClient.GET("/v1/account/");
	if (error)
		throw error;
	return data;
}