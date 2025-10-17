import { FastifyInstance, FastifyRequest, FastifyReply } from "fastify";
import { AuthService } from "./auth.service";
import { logInSchema, refreshSchema, signInSchema, verify2FALoginSchema } from "./auth.swagger";
import bcrypt from "bcrypt";
import { LogInBody, SignInBody, Verify2FALoginBody } from "./auth.type";

/**
 * All auth endpoints are processed here.
 */
export async function auth(fastify: FastifyInstance) {
	const authService = new AuthService(fastify);

	/**
	 * This route allows for the creation of new users
	 * @param req - The fastify request instance. It must have a body property according to the SignInBody type
	 * @param res - The fastify response instance.
	 * @returns In case of success, it returns a 201 JSON response including the email and username of the new user.
	 * In case of error, an error is thrown and catched by the route's error handler.
	 * @remarks
	 * The password field must ALWAYS be hashed using bcrypt before passing it to the createUser
	 * function. 
	 * 
	 */
	fastify.post<{ Body: SignInBody }>("/sign-in", signInSchema, async (req, res) => {
		try {
			req.body.password = await bcrypt.hash(req.body.password, 10);
			const response = await authService.createUser(req.body);
			return res.code(201).send(response);
		} catch (error) {
			throw error;
		}
	});

	/**
	 * This route allows for users to log in.
	 * @param req - The fastify request instance. It must have a body property according to the LogInBody type
	 * @param res - The fastify response instance.
	 * @returns In case of success, it returns a 201 json response including a JWT and a refresh JWT. In case of error, an error is thrown
	 * and catched by the route's error handler.
	 */
	fastify.post<{ Body: LogInBody }>("/log-in", logInSchema, async (req, res) => {
		try {
			const result = await authService.login(req.body.email, req.body.password);
			return res.code(201).send(result);
		} catch (error) {
			throw error;
		}
	});

	/**
	 * This route verifies 2FA code and completes the login process.
	 * @param req - The fastify request instance with tempToken and code in the body.
	 * @param res - The fastify response instance.
	 * @returns JWT tokens after successful 2FA verification.
	 */
	fastify.post<{ Body: Verify2FALoginBody }>("/verify-2fa", verify2FALoginSchema, async (req: FastifyRequest<{ Body: Verify2FALoginBody }>, res: FastifyReply) => {
		try {
			const result = await authService.verify2FALogin(req.body.tempToken, req.body.code);
			return res.code(201).send(result);
		} catch (error) {
			throw error;
		}
	});

	/**
	 * This route allows for a user to get a new JWT and refresh JWT. USeful for updating the session with valid tokens if they expire.
	 * @param req - The fastify request instance. The user property must be populated with the refresh token payload
	 * once it has been validated.
	 * @param res - The fastify response instance.
	 * @returns In case of success, it returns a 201 json response with the new pair of tokens.
	 * In case of error, an error is thrown and catched by the route's error handler.
	 */
	fastify.get("/refresh-jwt", {
		schema: refreshSchema.schema,
		preHandler: fastify.auth([fastify.verifyRefreshJwt])
	}, async (req, res) => {
		try {
			const user = await authService.getUser((req.user as any).email);
			const jwt = authService.signJwt({ id: user.id, username: user.username, email: user.email });
			return res.code(201).send(jwt);
		} catch (error) {
			throw error;
		}
	});
}