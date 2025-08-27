import { FastifyInstance } from "fastify";
import { getProfileInfo } from "./account.service";

/**
 * This module deals with the user profile page
 */
export async function account(fastify: FastifyInstance) {
	fastify.addHook("onRequest", fastify.auth([fastify.verifyLoggedIn]));

	fastify.get("/", async (req, res) => {
		const profile = await getProfileInfo(fastify);
		return res.view("account.ejs", { user: req.user, profile: profile.profile });
	});
}