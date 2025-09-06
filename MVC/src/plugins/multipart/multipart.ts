import fastifyMultipart, { FastifyMultipartOptions } from "@fastify/multipart";
import fp from "fastify-plugin";

export default fp<FastifyMultipartOptions>(async (fastify) => {
	const opts: FastifyMultipartOptions = {};

	fastify.register(fastifyMultipart, opts);
});
