import { FastifyInstance } from "fastify";
import { type SignInBody } from "./auth.type";
import { PrismaClientKnownRequestError } from "@prisma/client/runtime/library";
import { JwtPayload } from "./auth.type";
import { authenticator } from "otplib";
import bcrypt from "bcrypt";
import { EncryptionUtil } from "../../../../utils/encryption.util";


/**
 * This class acepts the following parameters:
 * @param fastify - The current fastify instance.
 */
export class AuthService {
	constructor(private fastify: FastifyInstance) { }

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
	 * Login with 2FA support.
	 * @param email - User email.
	 * @param password - User password.
	 * @returns JWT tokens or temp token if 2FA is enabled.
	 */
	async login(email: string, password: string) {
		try {
			const user = await this.fastify.prisma.users.findUniqueOrThrow({
				where: { email },
				select: {
					id: true,
					username: true,
					email: true,
					password: true,
					twoFactorEnabled: true,
					twoFactorSecret: true
				}
			});

			// Verify password
			const isValidPassword = await bcrypt.compare(password, user.password);
			if (!isValidPassword) {
				throw this.fastify.httpErrors.unauthorized("Invalid email or password");
			}

			// Check if 2FA is enabled
			if (user.twoFactorEnabled && user.twoFactorSecret) {
				// Generate a temporary token for 2FA verification
				const tempToken = this.fastify.jwt.sign(
					{ 
						id: user.id,
						username: user.username,
						email: user.email,
						temp: true,
						requires2FA: true
					},
					{ expiresIn: '5m' }
				);

				return {
					requires2FA: true,
					tempToken,
					message: 'Please provide 2FA code'
				};
			}

			// No 2FA, return normal tokens
			const tokens = this.signJwt({ username: user.username, email: user.email, id: user.id });
			return {
				requires2FA: false,
				...tokens,
				user: {
					username: user.username,
					email: user.email
				}
			};
		} catch (error) {
			if (error instanceof PrismaClientKnownRequestError && error.code == "P2025") {
				throw this.fastify.httpErrors.unauthorized("Invalid email or password");
			}
			throw error;
		}
	}

	/**
	 * Verify 2FA token and complete login.
	 * @param tempToken - Temporary token from initial login.
	 * @param code - 6-digit 2FA code.
	 * @returns JWT tokens.
	 */
	async verify2FALogin(tempToken: string, code: string) {
		try {
			// Verify the temporary token
			const decoded = this.fastify.jwt.verify(tempToken) as {
				id: number;
				username: string;
				email: string;
				temp: boolean;
				requires2FA: boolean;
			};

			// Validate token type
			if (!decoded.temp || !decoded.requires2FA) {
				throw this.fastify.httpErrors.badRequest("Invalid token type");
			}

			// Get user with 2FA secret
			const user = await this.fastify.prisma.users.findUniqueOrThrow({
				where: { id: decoded.id },
				select: {
					id: true,
					username: true,
					email: true,
					twoFactorEnabled: true,
					twoFactorSecret: true
				}
			});

			if (!user.twoFactorEnabled || !user.twoFactorSecret) {
				throw this.fastify.httpErrors.badRequest("2FA not configured");
			}

			// Verify the 2FA code
			const decryptedSecret = EncryptionUtil.decrypt(user.twoFactorSecret);
			const isValid = authenticator.verify({
				token: code,
				secret: decryptedSecret
			});

			if (!isValid) {
				throw this.fastify.httpErrors.unauthorized("Invalid 2FA code");
			}

			// Generate final tokens
			const tokens = this.signJwt({ username: user.username, email: user.email, id: user.id });
			return {
				...tokens,
				user: {
					username: user.username,
					email: user.email
				}
			};
		} catch (error) {
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
		const jwt = this.fastify.jwt.sign(
		{
			id: payload.id,
			username: payload.username,
			email: payload.email
		},
		{
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