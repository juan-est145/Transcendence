import { FastifyInstance, RouteShorthandOptions } from "fastify"
import { pingRes } from "./root.dto";
import { auth } from "./auth/auth";
import { account } from "./account/account";
import { users } from "./users/users";
import { HttpError, HttpMap } from "../v1.dto";
import { getErrorDetails, getErrorHttpValues } from "./root.service";
import { GeneralError } from "./root.type";


const rootSchema: RouteShorthandOptions = {
	schema: {
		response: {
			200: {
				description: "It returns a message that says Pong",
				content: {
					"application/json": {
						schema: pingRes,
					},
				}
			}
		},
		tags: ["Default"],
		summary: "This endpoint tests the availability of the API"
	}
}

async function root(fastify: FastifyInstance): Promise<void> {
	fastify.get("/ping", rootSchema, async (req, res) => {
		return { msg: "Pong" }
	});

	/**
	 * The base error catcher
	 * 
	 * @remarks
	 * This function assigns the appropiate error code and message (500 internal server error if none are provided).
	 * @param error - The fastify error instance.
	 * @param req - The fastify request instance. This request object does not have any custom properties.
	 * @param res- The fastify response instance.
	 * @returns Returns a json response in the format of the type GeneralError. If the error is of type 400,
	 * in the details object there will be a field value indicating which property is not valid.
	 * ```ts
	 * type GeneralError = {
		statusCode: number;
		httpError: HttpError;
	} & {
		details?: {
			   msg?: string[] | undefined;
		field?: string | undefined;
	}[] | undefined;
}
		* ```
		*/

	fastify.setErrorHandler((error, req, res) => {
		const statusCode = error.statusCode ?? 500;
		const httpError = HttpMap.get(statusCode) ?? HttpError.INTERNAL_SERVER_ERROR;
		const errorMsg: GeneralError = {
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

	fastify.register(auth, { prefix: "auth" });
	fastify.register(account, { prefix: "account" });
	fastify.register(users, { prefix: "users" });
}

export { root }