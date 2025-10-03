import helmet, { FastifyHelmetOptions } from "@fastify/helmet";
import fp from "fastify-plugin";

export default fp<FastifyHelmetOptions>(async(fastify) => {
	const opts: FastifyHelmetOptions = {
		global: true,
		contentSecurityPolicy: {
			directives: {
				defaultSrc: ["'self'"],
				scriptSrc: ["'self'", "https://cdn.jsdelivr.net", "https://cdn.skypack.dev", "https://cdn.babylonjs.com", "https://unpkg.com"],
				connectSrc: ["'self'", "wss://localhost:8000", "wss://localhost:8443", "ws://localhost:5173", "ws://localhost:4343", "wss://localhost:4343"],
				workerSrc: ["'self'", "blob:"],
				imgSrc: ["'self'", "data:", "blob:"],
				fontSrc: ["'self'", "https://fonts.gstatic.com"],
				styleSrc: ["'self'", "'unsafe-inline'", "https://fonts.googleapis.com"],
			}
		}
	};
	fastify.register(helmet, opts);
});