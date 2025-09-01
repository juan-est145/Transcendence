import { httpErrors } from "@fastify/sensible";
import fp from "fastify-plugin";
import { Client } from "minio";
import * as fs from "node:fs";

export default fp(async (fastify) => {
	const minioClient = new Client({
		endPoint: "minio",
		port: 9000,
		useSSL: true,
		accessKey: process.env.MINIO_NODE_USER!,
		secretKey: process.env.MINIO_NODE_PASSWORD!,
	});

	const bucket = fastify.globals.avatarBucketName;
	const defaultAvatar = {
		name: fastify.globals.defaultAvatarName,
		fsRoute: `${process.cwd()}/public/images/${fastify.globals.defaultAvatarName}`
	};

	if (!fs.existsSync(defaultAvatar.fsRoute)) {
		throw httpErrors.internalServerError(`A default image must be provided at ${defaultAvatar.fsRoute}`);
	}

	const exits = await minioClient.bucketExists(bucket);
	if (!exits) {
		await minioClient.makeBucket(bucket);
	}
	try {
		await minioClient.statObject(bucket, defaultAvatar.name);
	} catch (error) {
		await minioClient.fPutObject(bucket, defaultAvatar.name, defaultAvatar.fsRoute, {"Content-Type": "image/png",});
	}
	fastify.decorate("minioClient", minioClient);
});

declare module "fastify" {
	interface FastifyInstance {
		minioClient: Client,
	}
}