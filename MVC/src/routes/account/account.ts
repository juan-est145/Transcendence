import { FastifyInstance } from "fastify";
import { getProfileAvatar, getProfileInfo, storeAvatar } from "./account.service";

/**
 * This module deals with the user's account page
 */
export async function account(fastify: FastifyInstance) {
	/**
	 * This entire module requires the user to be logged in in order to be able to access and
	 * interact with it.
	 */
	fastify.addHook("onRequest", fastify.auth([fastify.verifyLoggedIn]));

	/**
	 * This route sends to the client the user profile page. It uses the jwt 
	 * stored in the session to identiy the user and load the correct data.
	 * @param req - The fastify request instance.
	 * @param res - The fastify response instance.
	 * @returns The account page page.
	 * @remarks The page requires both a user property for the header and a profile
	 * property for adding data like victories or the avatar route.
	 */
	fastify.get("/", async (req, res) => {
		const profile = await getProfileInfo(fastify);
		return res.view("account.ejs", { user: req.user, profile: profile.profile });
	});

	fastify.get("/avatar", async (req, res) => {
		try {
			const avatar = await getProfileAvatar(fastify);
			res.type(avatar.contentType);
			return res.send(avatar.stream);
		} catch (error) {
			throw error;
		}
	});

	fastify.post("/avatar", async (req, res) => {
		const data = await req.file();
		// TO DO: Add validation to make sure that the data is not missing
		await storeAvatar(fastify, data!, (req.user as any).username);
		return res.redirect("/account");
	});
}