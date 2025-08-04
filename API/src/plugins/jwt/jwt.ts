import fp from "fastify-plugin";
import fastifyJwt, { FastifyJWTOptions } from "@fastify/jwt"

export default fp<FastifyJWTOptions>(async (fastify) => {
	const jwtOptions: FastifyJWTOptions = {
		secret: {
			private: process.env.PRIVATE_JWT_KEY!,
			public: process.env.PUBLIC_JWT_KEY!,
		},
		verify: { extractToken: (request) => {
			const header = request.headers.authorization;
			const jwt = header?.split(" ")[1];
			return jwt;
		}},
	};

	fastify.register(fastifyJwt, jwtOptions)
});