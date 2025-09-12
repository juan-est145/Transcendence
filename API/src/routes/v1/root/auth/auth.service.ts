import { FastifyInstance } from "fastify";
import { type SignInBody } from "./auth.type";
import { PrismaClientKnownRequestError } from "@prisma/client/runtime/library";
import { JwtPayload } from "./auth.type";


/**
 * This class acepts the following parameters:
 * @param fastify - The current fastify instance.
 */
export class AuthService {
	private fastify: FastifyInstance;

	constructor(fastify: FastifyInstance) {
		this.fastify = fastify;
	}

	/**
	 * This function allows for the creation of a new user in the database, alongside it's profile.
	 * @param body - An object containing the values of the POST request. Must have the type SignInBody
	 * @returns If successful, it returns the username and email of the new user. In case of error,
	 * it throws a fastify http 409 error if there is already a user with that username or email
	 * registered. Otherwise, it just sends the default prisma error.
	 */
	async createUser(body: SignInBody) {
		try {
			const result = await this.fastify.prisma.users.create({
				data: {
					username: body.username,
					password: body.password,
					email: body.email,
					profile: {
						create: {
							avatar: {
								create: {}
							}
						}
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
				throw this.fastify.httpErrors.conflict("Username or email already exits");
			}
			throw error;
		}
	}

	/**
	 * This function finds a user by email.
	 * @param email - A string representing the email of the user to search.
	 * @returns If successful, it returns the data of the user and it's profile. In case
	 * of error, if the email does not exist it returns a fastify http 401 error.
	 * Otherwise, it just sends the default prisma error.
	 */
	async getUser(email: string) {
		try {
			const result = await this.fastify.prisma.users.findUniqueOrThrow({
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
				throw this.fastify.httpErrors.unauthorized("Invalid email or password");
			}
			throw error;
		}
	}

	/**
	 * This function creates a JWT.
	 * @param payload - An object containing the payload to pass to sign into the jwt. It
	 * must have the JwtPayload type.
	 * @returns It returns the JWT as a string.
	 */
	signJwt(payload: JwtPayload) {
		const jwt = this.fastify.jwt.sign(payload, {
			expiresIn: "1h",
			iss: "https://api:4343"
		});

		const refreshJwt = this.fastify.jwt.sign({ email: payload.email, refresh: true }, {
			expiresIn: "3h",
			iss: "https://api:4343"
		});

		return { jwt, refreshJwt };
	}
}