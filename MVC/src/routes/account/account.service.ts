import { MultipartFile } from "@fastify/multipart";
import { httpErrors } from "@fastify/sensible";
import { FastifyInstance } from "fastify";
import { S3Error } from "minio";
import crypto from "crypto";
import globals from "../../globals/globals";
import { avatarBody } from "./account.dto";

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

export async function getProfileAvatar(fastify: FastifyInstance) {
	const { avatarBucketName, defaultAvatarName, defaultcontentType } = globals;
	try {
		const avatar = await findAvatarName(fastify);
		const stream = await fastify.minioClient.getObject(avatarBucketName, avatar.name);
		return { stream, contentType: avatar.contentType };
	} catch (error) {
		if (error instanceof S3Error) {
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

export function validateAvatar(avatar: unknown) {
	avatarBody.parse(avatar);
}

export async function storeAvatar(fastify: FastifyInstance, username: string, avatar: MultipartFile, buffer: Buffer<ArrayBufferLike>) {
	const { avatarBucketName } = globals;
	const name = `${username}/${crypto.randomUUID()}`;
	try {
		await fastify.minioClient.removeObject(avatarBucketName, username, { forceDelete: true });
		await fastify.minioClient.putObject(avatarBucketName, name, buffer, buffer.length, { "Content-Type": avatar.mimetype, });
		await updateProfileAvatar(fastify, name, avatar.mimetype);
	} catch (error) {
		if (error instanceof Object && error.hasOwnProperty("statusCode") && error.hasOwnProperty("httpError")) {
			await fastify.minioClient.removeObject(avatarBucketName, username, { forceDelete: true });
		}
		throw (error);
	}
}

async function updateProfileAvatar(fastify: FastifyInstance, name: string, contentType: string) {
	const { data, error } = await fastify.apiClient.POST("/v1/account/avatar", {
		body: { name, contentType }
	});
	if (error)
		throw error;
	return data;
}
