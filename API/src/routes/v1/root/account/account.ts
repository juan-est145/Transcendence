import { FastifyInstance } from "fastify";
import { getAccountSchema } from "./account.swagger";
import { JwtPayload } from "../auth/auth.type";
import { getAccount } from "./account.service";
import { HttpError, HttpMap } from "../../v1.dto";
import { AccountError } from "./account.type";

export async function account(fastify: FastifyInstance) {
	fastify.addHook("preHandler", fastify.auth([fastify.verifyJwt]));

	fastify.setErrorHandler((error, req, res) => {
		const statusCode = error.statusCode ?? 500;
		const httpError = HttpMap.get(statusCode) ?? HttpError.INTERNAL_SERVER_ERROR;
		const errorMsg: AccountError = {
			statusCode,
			httpError,
			details: [{ msg: [error.message] }],
		};
		return res.code(errorMsg.statusCode).send(errorMsg);
	});

	fastify.get("/", getAccountSchema, async (req, res) => {
		const jwtPayload: JwtPayload = await req.jwtDecode();
		const user = await getAccount(fastify, jwtPayload);
		return res.send(user);
	});
}