import fastifyMultipart, { FastifyMultipartOptions } from "@fastify/multipart";
import fp from "fastify-plugin";
import globals from "../../globals/globals";

export default fp<FastifyMultipartOptions>(async (fastify) => {
	const opts: FastifyMultipartOptions = {
		limits: {
			fileSize: globals.maxFileSize
		},
	};

	fastify.register(fastifyMultipart, opts);
});
