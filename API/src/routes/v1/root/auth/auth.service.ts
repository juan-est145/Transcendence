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

/**
 * This function finds an existing user by id42 or creates a new one for OAuth2 authentication.
 * @param fastify - The fastify instance. It is decorated with the prisma client.
 * @param userData - An object containing OAuth2 user data (id42, email, username)
 * @returns If successful, it returns the user data. Creates a new user if one doesn't exist.
 */
export async function findOrCreateUser(fastify: FastifyInstance, userData: {
    id42: string;
    email: string;
    username: string;
}) {
    try {
        // Primero intentar encontrar el usuario por id42
        let user = await fastify.prisma.users.findUnique({
            where: {
                id42: userData.id42
            },
            include: {
                profile: true
            }
        });

        // Si no existe, intentar encontrar por email
        if (!user) {
            user = await fastify.prisma.users.findUnique({
                where: {
                    email: userData.email
                },
                include: {
                    profile: true
                }
            });

            // Si existe por email, actualizar con id42
            if (user) {
                user = await fastify.prisma.users.update({
                    where: {
                        email: userData.email
                    },
                    data: {
                        id42: userData.id42
                    },
                    include: {
                        profile: true
                    }
                });
            }
        }

        // Si no existe, crear nuevo usuario
        if (!user) {
            user = await fastify.prisma.users.create({
                data: {
                    id42: userData.id42,
                    email: userData.email,
                    username: userData.username,
                    password: null, // Cambiar a null en lugar de string vacío
                    profile: {
                        create: {}
                    }
                },
                include: {
                    profile: true
                }
            });
        }

        return user;
    } catch (error) {
        if (error instanceof PrismaClientKnownRequestError && error.code == "P2002") {
            throw fastify.httpErrors.conflict("Username already exists");
        }
        throw error;
    }
}