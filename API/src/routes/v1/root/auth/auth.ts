import { FastifyInstance, } from "fastify";
import { createUser, getUser, signJwt } from "./auth.service";
import { logInSchema, signInSchema } from "./auth.swagger";
import bcrypt from "bcrypt";
import { LogInBody, SignInBody, type AuthError } from "./auth.type";
import { HttpError, HttpMap } from "../../v1.dto";
import { getErrorDetails, getErrorHttpValues } from "./auth.aux";

/**
 * All auth endpoints are processed here. The route also has a default error handler that will catch all
 * the different http errors and send the appropiate response.
 */
export async function auth(fastify: FastifyInstance) {
	/**
	 * The /auth route error catcher.
	 * 
	 * @remarks
	 * This function assigns the appropiate error code and message (500 internal server error if none are provided).
	 * @param error - The fastify error instance.
	 * @param req - The fastify request instance. This request object does not have any custom properties.
	 * @param res- The fastify response instance.
	 * @returns Returns a json response in the format of the type AuthError. If the error is of type 400,
	 * in the details object there will be a field value indicating which property is not valid.
	 * ```ts
	 * type AuthError = {
	 *	statusCode: number;
	 * 	httpError: HttpError;
	 *	} & {
	 *	details?: {
	 *		field?: string | undefined;
	 *		msg?: string[] | undefined;
	 *	}[] | undefined;
	 *	}
	 * ```
	 */
	fastify.setErrorHandler((error, req, res) => {
		const statusCode = error.statusCode ?? 500;
		const httpError = HttpMap.get(statusCode) ?? HttpError.INTERNAL_SERVER_ERROR;
		const errorMsg: AuthError = {
			statusCode,
			httpError,
			details: [{ msg: [error.message] }]
		};

		if (error.validation) {
			getErrorHttpValues(errorMsg, 400);
			errorMsg.details = [{
				field: error.validation[0].params.missingProperty as string,
				msg: [error.message]
			}];
		}
		console.error(`- An error of type ${errorMsg.statusCode} occurred. The details are as follow:\n ${getErrorDetails(errorMsg)}`);
		return res.code(errorMsg.statusCode).send(errorMsg);
	});

	/**
	 * This route allows for the creation of new users
	 * @param req - The fastify request instance. It must have a body property according to the SignInBody type
	 * @param res - The fastify response instance.
	 * @returns In case of success, it returns a 201 json response including the email and username of the new user.
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
	 * @returns In case of success, it returns a 201 json response including a JWT. In case of error, an error is thrown
	 * and catched by the route's error handler.
	 */
	fastify.post<{ Body: LogInBody }>("/log-in", logInSchema, async (req, res) => {
		try {
			const user = await getUser(fastify, req.body.email);
			if (!user || !(await bcrypt.compare(req.body.password, user.password)))
				throw fastify.httpErrors.unauthorized("Invalid email or password");
			const jwt = signJwt(fastify, { username: user.username, email: user.email });
			return res.code(201).send(jwt);
		} catch (error) {
			throw error;
		}
	});

	// This is a temporary endpoint to test the API's capability of verifying jwt's. It will be deleted
	// later on
	fastify.post<{ Body: { jwt: string } }>("/jwt-test", {
		schema: {
			security: [{ bearerAuth: [] }],
			tags: ["Auth"],
			summary: "A temporary endpoint to test the validity of the jwt. Will be deleted"
		},
		preHandler: async (req, res) => {
			try {
				await req.jwtVerify();
				if (!(req.user.hasOwnProperty("email") && req.user.hasOwnProperty("username")))
					throw (fastify.httpErrors.badRequest("You need the jwt token, not the refresh one"));
			} catch (error) {
				throw error;
			}
		} 
	}, async (req, res) => {
		return res.code(201).send({ msg: "Everything went okay" }); 
	});
}