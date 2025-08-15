import fp from "fastify-plugin";
import fastifyJwt, { FastifyJWTOptions } from "@fastify/jwt"

export default fp<FastifyJWTOptions>(async (fastify) => {
	const jwtOptions: FastifyJWTOptions = {
		secret: { public: process.env.PUBLIC_JWT_KEY! },
	}

	fastify.register(fastifyJwt, jwtOptions);
});