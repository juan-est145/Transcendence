import fp from "fastify-plugin";
import fastifyFormbody, { FastifyFormbodyOptions } from "@fastify/formbody";

export default fp<FastifyFormbodyOptions>(async (fastify) => {
	fastify.register(fastifyFormbody)
});