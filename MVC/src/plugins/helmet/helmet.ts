import helmet, { FastifyHelmetOptions } from "@fastify/helmet";
import fp from "fastify-plugin";

export default fp<FastifyHelmetOptions>(async(fastify) => {
	const opts: FastifyHelmetOptions = {
		global: true,
	};
	fastify.register(helmet, opts);
});