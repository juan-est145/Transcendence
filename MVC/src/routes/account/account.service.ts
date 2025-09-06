import { httpErrors } from "@fastify/sensible";
import { FastifySessionObject } from "@fastify/session";
import { FastifyInstance } from "fastify";
import { InvalidObjectNameError } from "minio";

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

export async function getProfileAvatar(fastify: FastifyInstance, session: FastifySessionObject) {
	const { avatarBucketName, defaultAvatarName, defaultcontentType } = fastify.globals;
	try {
		const avatar = await findAvatarName(fastify);
		const stream = await fastify.minioClient.getObject(avatarBucketName, avatar.name);
		return { stream, contentType: avatar.contentType };
	} catch (error) {
		if (error instanceof InvalidObjectNameError) {
			try {
				const defaultAvatar = await fastify.minioClient.getObject(avatarBucketName, defaultAvatarName);
				return { stream: defaultAvatar, contentType: defaultcontentType };
			} catch (error) {
				throw httpErrors.notFound("Avatar location was not found");
			}
		}
		throw error;
	}
}

async function findAvatarName(fastify: FastifyInstance) {
	const { data, error } = await fastify.apiClient.GET("/v1/account/avatar");
	if (error)
		throw error;
	return data;
}