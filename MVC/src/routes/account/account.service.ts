import { MultipartFile } from "@fastify/multipart";
import { httpErrors } from "@fastify/sensible";
import { FastifyInstance } from "fastify";
import { S3Error } from "minio";
import crypto from "crypto";
import globals from "../../globals/globals";
import { avatarBody } from "./account.dto";

/**
 * This class acepts the following parameters:
 * @param fastify - The current fastify instance.
 */
export class AccountService {
	private fastify: FastifyInstance;

	constructor(fastify: FastifyInstance) {
		this.fastify = fastify;
	}

	/**
	 * This function sends a GET request using a JWT to get the account and profile information.
	 * If the response is between 400 and 500 it throws an exception.
	 * @returns If successful, it returns a JSON object with the profile info of the user.
	 */
	async getProfileInfo() {
		const { data, error } = await this.fastify.apiClient.GET("/v1/account/");
		if (error)
			throw error;
		return data;
	}

	/**
	 * This function retrieves the name of the avatar of the user and it returns it to the user.
	 * @returns In case there is an error in the minio s3 server, it send's back a default image or a 404 
	 * error if that one also fails. In normal circunstances, it sends the user's image as a stream.
	 */
	async getProfileAvatar() {
		const { avatarBucketName, defaultAvatarName, defaultcontentType } = globals;
		try {
			const avatar = await this.findAvatarName();
			const stream = await this.fastify.minioClient.getObject(avatarBucketName, avatar.name);
			return { stream, contentType: avatar.contentType };
		} catch (error) {
			if (error instanceof S3Error) {
				try {
					const defaultAvatar = await this.fastify.minioClient.getObject(avatarBucketName, defaultAvatarName);
					return { stream: defaultAvatar, contentType: defaultcontentType };
				} catch (error) {
					throw httpErrors.notFound("Avatar location was not found");
				}
			}
			throw error;
		}
	}

	/**
	 * This function searches for the avatar data associated with the user present in the session.
	 * @returns It returns a JSON object that conforms with the avatar's table in the database. Else,
	 * it throws an error with the details of it.
	 */
	async findAvatarName() {
		const { data, error } = await this.fastify.apiClient.GET("/v1/account/avatar");
		if (error)
			throw error;
		return data;
	}

	/**
	 * This function validaties that the avatar field retrieved from fastify multipart connforms to the
	 * zod object avatarBody. If the object is not valid, it throws a zod error.
	 * @param avatar - A avatar fastify multipart object to be evaluated.
	 */
	validateAvatar(avatar: unknown) {
		avatarBody.parse(avatar);
	}

	/**
	 * This function generates a random name for a new avatar image and stores it inside the s3 server,
	 * deleting the old image as well. It also updates the information of the database through the 
	 * API of the new image, it's name and it's mime type.
	 * @param username - The username of the account. It is used as a directory for the image in the
	 * minio server.
	 * @param avatar - The fastify multipart file instance of the image. It contains information like
	 * a stream of the file and the original filename among other things.
	 * @param buffer - The actual image in a buffer format. It is loaded into memory and stored in the
	 * minio server.
	 * @remarks If there is an error with the API, the function will delete the uploaded image from the server.
	 * In any other case of error, it will just throw said error.
	 */
	async storeAvatar(username: string, avatar: MultipartFile, buffer: Buffer<ArrayBufferLike>) {
		const { avatarBucketName } = globals;
		const fileExtension = this.getFileExtension(avatar.filename);
		const name = `${username}/${crypto.randomUUID()}${fileExtension}`;
		try {
			await this.fastify.minioClient.removeObject(avatarBucketName, username, { forceDelete: true });
			await this.fastify.minioClient.putObject(avatarBucketName, name, buffer, buffer.length, { "Content-Type": avatar.mimetype, });
			await this.updateProfileAvatar(name, avatar.mimetype);
		} catch (error) {
			if (error instanceof Object && error.hasOwnProperty("statusCode") && error.hasOwnProperty("httpError")) {
				await this.fastify.minioClient.removeObject(avatarBucketName, username, { forceDelete: true });
			}
			throw (error);
		}
	}

	/**
	 * This function finds the extension name of the name of a file and returns it. In case there
	 * isn't a extension name, it returns an empty string.
	 * @param name - The name of the file.
	 * @returns The extension name or an empty string if there isn't one.
	 */
	getFileExtension(name: string) {
		const index = name.lastIndexOf(".");
		return index !== -1 ? name.substring(index) : "";
	}

	/**
	 * This function updates a specific record of the avatar table in the database through the API
	 * with the paramters passed to the function. It uses the user's JWT to know which record must
	 * be updated.
	 * @param name - The new name for the image.
	 * @param contentType - The mime type of the image.
	 * @returns The data of the new record. In case of error, it throws that specific error.
	 */
	async updateProfileAvatar(name: string, contentType: string) {
		const { data, error } = await this.fastify.apiClient.POST("/v1/account/avatar", {
			body: { name, contentType }
		});
		if (error)
			throw error;
		return data;
	}

	async getUsersAvatar(username: string) {
		const { avatarBucketName, defaultAvatarName, defaultcontentType } = globals;
		try {
			const avatar = await this.findUserAvatar(username);
			const stream = await this.fastify.minioClient.getObject(avatarBucketName, avatar.name);
			return { stream, contentType: avatar.contentType };
		} catch (error) {
			if (error instanceof S3Error) {
				try {
					const defaultAvatar = await this.fastify.minioClient.getObject(avatarBucketName, defaultAvatarName);
					return { stream: defaultAvatar, contentType: defaultcontentType };
				} catch (error) {
					throw httpErrors.notFound("Avatar location was not found");
				}
			}
			throw error;
		}
	}

	async findUserAvatar(username: string) {
		const { data, error } = await this.fastify.apiClient.GET("/v1/account/avatar/{username}", {
			params: {
				path: { username }
			}
		});
		if (error)
			throw error;
		return data;
	}
}
