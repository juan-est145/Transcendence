import helmet, { FastifyHelmetOptions } from "@fastify/helmet";
import fp from "fastify-plugin";

export default fp<FastifyHelmetOptions>(async(fastify) => {
	const opts: FastifyHelmetOptions = {
		global: true,
		contentSecurityPolicy: {
			directives: {
				defaultSrc: ["'self'"],
				connectSrc: ["'self'", "wss://localhost:8000", "wss://localhost:8443", "ws://localhost:5173"],
				workerSrc: ["'self'", "blob:"],
			}
		}
	};
	fastify.register(helmet, opts);
});