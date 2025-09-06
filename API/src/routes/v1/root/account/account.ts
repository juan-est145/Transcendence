import { FastifyInstance } from "fastify";
import { getAccountSchema, getAvatarSchema, postAvatarSchema } from "./account.swagger";
import { JwtPayload } from "../auth/auth.type";
import { getAccount, getAvatar, updateAvatar } from "./account.service";
import { AccountPostAvatarBody } from "./account.type";

/**
 * This module deals with the user's account
 */
export async function account(fastify: FastifyInstance) {
	/**
	 * This entire module requires the user to be logged in in order to be able to access and
	 * interact with it.
	 */
	fastify.addHook("preHandler", fastify.auth([fastify.verifyJwt]));

	/**
	 * This route returns the data of a user profile.
	 * @param req - The fastify request instance.
	 * @param res - The fastify response instance.
	 * @returns In case of success, it resturns a 200 JSON response with the username,
	 * email and a profile object that includes the number of victories and defeats.
	 */
	fastify.get("/", getAccountSchema, async (req, res) => {
		try {
			const jwtPayload: JwtPayload = await req.jwtDecode();
			const account = await getAccount(fastify, jwtPayload);
			return res.send(account);
		} catch (error) {
			throw error;
		}
	});

	fastify.get("/avatar", getAvatarSchema, async (req, res) => {
		try {
			const jwtPayload: JwtPayload = await req.jwtDecode();
			const avatar = await getAvatar(fastify, jwtPayload);
			return res.send(avatar);
		} catch (error) {
			throw error;
		}
	});

	fastify.post<{ Body: AccountPostAvatarBody }>("/avatar", postAvatarSchema, async (req, res) => {
		try {
			const { email }: JwtPayload = await req.jwtDecode();
			const result = await updateAvatar(fastify, email, req.body);
			return res.status(201).send(result);
		} catch (error) {
			throw error;
		}
	});
}