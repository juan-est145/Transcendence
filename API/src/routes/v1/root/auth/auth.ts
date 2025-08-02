import { FastifyInstance, } from "fastify";
import { createUser } from "./auth.service";
import { logInSchema, signInSchema } from "./auth.swagger";
import bcrypt from "bcrypt";
import { SignInBody, type SignInError } from "./auth.type";
import { HttpError, HttpMap } from "../../v1.dto";
import { getErrorHttpValues } from "./auth.aux";

export async function auth(fastify: FastifyInstance) {
	fastify.setErrorHandler((error, req, res) => {
		const statusCode = error.statusCode ?? 500;
		const httpError = HttpMap.get(statusCode) ?? HttpError.INTERNAL_SERVER_ERROR;
		const errorMsg: SignInError = {
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

	fastify.post<{ Body: SignInBody }>("/sign-in", signInSchema, async (req, res) => {
		try {
			req.body.password = await bcrypt.hash(req.body.password, 10);
			const response = await createUser(fastify, req.body);
			return res.code(201).send(response);
		} catch (error) {
			throw error;
		}
	});

	fastify.post("/log-in", logInSchema, async (req, res) => {

	});
}