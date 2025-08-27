import { FastifyInstance } from "fastify";
import { getAccountSchema } from "./account.swagger";
import { JwtPayload } from "../auth/auth.type";
import { getAccount } from "./account.service";

export async function account(fastify: FastifyInstance) {
	fastify.addHook("preHandler", fastify.auth([fastify.verifyJwt]));

	fastify.get("/", getAccountSchema, async (req, res) => {
		try {
			const jwtPayload: JwtPayload = await req.jwtDecode();
			const account = await getAccount(fastify, jwtPayload);
			return res.send(account);
		} catch (error) {
			throw error;
		}
	});
}