import fp from "fastify-plugin";
import fastifyJwt, { FastifyJWTOptions } from "@fastify/jwt";

interface JwtPayload {
	email: string,
	exp: number,
	iat: number,
	iss: string,
	username: string,
};

export default fp<FastifyJWTOptions>(async (fastify) => {
	const jwtOptions: FastifyJWTOptions = {
		secret: { public: process.env.PUBLIC_JWT_KEY! },
		verify: { extractToken: (request) => {
			const jwt = request.session.get("jwt");
			return jwt;
		}},
	}

	fastify.register(fastifyJwt, jwtOptions);
});

declare module "@fastify/jwt" {
	interface FastifyJWT {
		user: JwtPayload | null;
	}
};