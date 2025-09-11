import { FastifyInstance } from "fastify";
import { type SignInBody } from "./auth.type";
import { PrismaClientKnownRequestError } from "@prisma/client/runtime/library";
import { JwtPayload } from "./auth.type";

/**
 * This function allows for the creation of a new user in the database, alongside it's profile.
 * @param fastify - The fastify instance. It is decorated with the prisma client. 
 * @param body - An object containing the values of the POST request. Must have the type SignInBody
 * @returns If successful, it returns the username and email of the new user. In case of error,
 * it throws a fastify http 409 error if there is already a user with that username or email
 * registered. Otherwise, it just sends the default prisma error.
 */
export async function createUser(fastify: FastifyInstance, body: SignInBody) {
	try {

		const result = await fastify.prisma.users.create({
			data: {
				username: body.username,
				password: body.password,
				email: body.email,
				profile: {
					create: {}
				}
			},
			select: {
				username: true,
				email: true,
			}
		});
		return result;
	} catch (error) {
		if (error instanceof PrismaClientKnownRequestError && error.code == "P2002") {
			throw fastify.httpErrors.conflict("Username or email already exits");
		}
		throw error;
	}
}

/**
 * This function finds a user by username.
 * @param fastify - The fastify instance. It is decorated with the prisma client.
 * @param email - A string representing the email of the user to search.
 * @returns If successful, it returns the data of the user and it's profile. In case
 * of error, if the email does not exist it returns a fastify http 401 error.
 * Otherwise, it just sends the default prisma error.
 */
export async function getUser(fastify: FastifyInstance, email: string) {
	try {
		const result = await fastify.prisma.users.findUniqueOrThrow({
			where: {
				email
			},
			include: {
				profile: true
			},
		});
		return result;
	} catch (error) {
		if (error instanceof PrismaClientKnownRequestError && error.code == "P2025") {
			throw fastify.httpErrors.unauthorized("Invalid email or password");
		}
		throw error;
	}
}

/**
 * This function creates a JWT.
 * @param fastify - The fastify instance. It is decorated with the jwt fastify package.
 * @param payload - An object containing the payload to pass to sign into the jwt. It
 * must have the JwtPayload type.
 * @returns It returns the JWT as a string.
 */
export function signJwt(fastify: FastifyInstance, payload: JwtPayload) {
	const jwt = fastify.jwt.sign(payload, {
		expiresIn: "1h",
		iss: "https://api:4343"
	});

	const refreshJwt = fastify.jwt.sign({ email: payload.email, refresh: true }, {
		expiresIn: "3h",
		iss: "https://api:4343"
	});

	return { jwt, refreshJwt };
}