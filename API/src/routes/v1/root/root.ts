import { FastifyError, FastifyInstance, FastifyReply, FastifyRequest } from "fastify"
import { auth } from "./auth/auth";
import { account } from "./account/account";
import { users } from "./users/users";
import { twoFactor } from "./2FA/2fa";
import { games } from "./games/games";
import { HttpError, HttpMap } from "../v1.dto";
import { RootService } from "./root.service";
import { GeneralError } from "./root.type";
import { rootSchema } from "./root.schema";

async function root(fastify: FastifyInstance): Promise<void> {
	const rootService = new RootService();

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

	fastify.setErrorHandler((error: FastifyError, req: FastifyRequest, res: FastifyReply) => {
		const statusCode = error.statusCode ?? 500;
		const httpError = HttpMap.get(statusCode) ?? HttpError.INTERNAL_SERVER_ERROR;
		const errorMsg: GeneralError = {
			statusCode,
			httpError,
			details: [{ msg: [error.message] }]
		};

		if (error.validation) {
			rootService.getErrorHttpValues(errorMsg, 400);
			errorMsg.details = [{
				field: error.validation[0].params.missingProperty as string,
				msg: [error.message]
			}];
		}
		console.error(`- An error of type ${errorMsg.statusCode} occurred. The details are as follow:\n ${rootService.getErrorDetails(errorMsg)}`);
		return res.code(errorMsg.statusCode).send(errorMsg);
	});

	fastify.register(auth, { prefix: "auth" });
	fastify.register(account, { prefix: "account" });
	fastify.register(users, { prefix: "users" });
	fastify.register(twoFactor, { prefix: "2fa" });
	fastify.register(games, { prefix: "games" });
}

export { root }