import { FastifyInstance, } from "fastify";
import { createUser, getUser, signJwt } from "./auth.service";
import { logInSchema, refreshSchema, signInSchema } from "./auth.swagger";
import bcrypt from "bcrypt";
import { LogInBody, SignInBody } from "./auth.type";
import oauth42Routes from './oauth42';

/**
 * All auth endpoints are processed here.
 */
export async function auth(fastify: FastifyInstance) {
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
			const response = await createUser(fastify, req.body);
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
			const user = await getUser(fastify, req.body.email);
			if (!user || !user.password || !(await bcrypt.compare(req.body.password, user.password)))
				throw fastify.httpErrors.unauthorized("Invalid email or password");
			const jwt = signJwt(fastify, { username: user.username, email: user.email });
			return res.code(201).send(jwt);
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
			const user = await getUser(fastify, (req.user as any).email);
			const jwt = signJwt(fastify, { username: user.username, email: user.email });
			return res.code(201).send(jwt);
		} catch (error) {
			throw error;
		}
	});

	await fastify.register(oauth42Routes);
}