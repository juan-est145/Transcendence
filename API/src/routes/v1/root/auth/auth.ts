import { FastifyInstance, } from "fastify";
import { createUser, getUser, signJwt } from "./auth.service";
import { logInSchema, signInSchema } from "./auth.swagger";
import bcrypt from "bcrypt";
import { LogInBody, SignInBody, type AuthError } from "./auth.type";
import { HttpError, HttpMap } from "../../v1.dto";
import { getErrorHttpValues } from "./auth.aux";

export async function auth(fastify: FastifyInstance) {
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
		return res.code(errorMsg.statusCode).send(errorMsg);
	});

	// TO DO: Implement testing for both routes and do proper documentation. Also add jwt to logging
	// and do an console.error of the error type for both routes.
	fastify.post<{ Body: SignInBody }>("/sign-in", signInSchema, async (req, res) => {
		try {
			req.body.password = await bcrypt.hash(req.body.password, 10);
			const response = await createUser(fastify, req.body);
			return res.code(201).send(response);
		} catch (error) {
			throw error;
		}
	});

	fastify.post<{ Body: LogInBody }>("/log-in", logInSchema, async (req, res) => {
		try {
			const user = await getUser(fastify, req.body.email);
			if (!user || !(await bcrypt.compare(req.body.password, user.password)))
				throw fastify.httpErrors.unauthorized("Invalid username or password");
			const jwt = signJwt(fastify, { username: user.username, email: user.email });
			return res.code(201).send({ jwt });
		} catch (error) {
			throw error;
		}
	});

	fastify.post<{ Body: { jwt: string } }>("/jwt-test", {
		schema: {
			security: [{ bearerAuth: [] }],
			tags: ["Auth"],
			summary: "A temporary endpoint to test the validity of the jwt. Will be deleted"
		}
	}, async (req, res) => {
		try {
			await req.jwtVerify();
			return res.code(201).send({ msg: "Everything went okay" });
		} catch (error) {
			throw error;
		} 
	});
}