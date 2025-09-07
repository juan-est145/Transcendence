import { FastifyInstance } from "fastify";
import { getProfileAvatar, getProfileInfo, storeAvatar, validateAvatar } from "./account.service";
import { ZodError } from "zod";
import globals from "../../globals/globals";

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
		try {
			const data = await req.file();
			const buffer = await data?.toBuffer()
			validateAvatar(data);
			await storeAvatar(fastify, req.user!.username, data!, buffer!);
			return res.redirect("/account");
		} catch (error) {
			const user = req.user;
			const profile = (await getProfileInfo(fastify)).profile;
			if (error instanceof ZodError) {
				const ejsVariables = { 
					errors: error.issues.map((element) => element.message),
					user,
					profile,
				};
				return res.status(400).view("account.ejs", ejsVariables);
			}
			else if (error instanceof Error && error.message === "request file too large")
			{
				const ejsVariables = {
					errors: [`Max file size is ${Math.floor(globals.maxFileSize / 1000000)} mbs`],
					user,
					profile,
				}
				return res.status(413).view("account.ejs", ejsVariables);
			}
			throw error;
		}
	});
}