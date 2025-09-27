import { FastifyInstance } from "fastify";
import { AccountService } from "./account.service";
import { ZodError } from "zod";
import globals from "../../globals/globals";
import { AvatarUsernameParam } from "./account.type";

/**
 * This module deals with the user's account page
 */
export async function account(fastify: FastifyInstance) {
	/**
	 * This entire module requires the user to be logged in in order to be able to access and
	 * interact with it.
	 */
	fastify.addHook("onRequest", fastify.auth([fastify.verifyLoggedIn]));

	const accountService = new AccountService(fastify);

	/**
	 * This route sends to the client the user profile page. It uses the jwt 
	 * stored in the session to identiy the user and load the correct data.
	 * @param req - The fastify request instance.
	 * @param res - The fastify response instance.
	 * @returns The account page page.
	 * @remarks The page requires both a user property for the header and a profile
	 * property for adding data like victories.
	 */
	fastify.get("/", async (req, res) => {
		const { profile } = await accountService.getProfileInfo();
		const friends = await accountService.getFriends();
		return res.view("account.ejs", { user: req.user, profile, friends });
	});

	/**
	 * This route loads the avatar associated with the user's account. It checks the database
	 * through the API to find the the name of the avatar and then retrieves it and send's it to the
	 * user from the minio s3 store.
	 * @param req - The fastify request instance.
	 * @param res - The fastify response instance.
	 * @returns The avatar image alongise it's content type in the header.
	 */
	fastify.get("/avatar", async (req, res) => {
		try {
			const avatar = await accountService.getProfileAvatar();
			res.type(avatar.contentType);
			return res.send(avatar.stream);
		} catch (error) {
			throw error;
		}
	});

	/**
	 * This route stores an avatar for the user account. It accepts files no bigger than
	 * 2 mb and that are either png, jpeg or gif.
	 * @param req - The fastify request instance.
	 * @param res - The fastify response instance.
	 * @returns A redirect to the user account in case of success. In case of a validation error,
	 * it will re-render the account page with a message displaying the errors that are present.
	 */
	fastify.post("/avatar", async (req, res) => {
		try {
			const data = await req.file();
			const buffer = await data?.toBuffer();
			accountService.validateAvatar(data);
			await accountService.storeAvatar(req.user!.username, data!, buffer!);
			return res.redirect("/account");
		} catch (error) {
			const user = req.user;
			const profile = (await accountService.getProfileInfo()).profile;
			if (error instanceof ZodError) {
				const ejsVariables = {
					errors: error.issues.map((element) => element.message),
					user,
					profile,
				};
				return res.status(400).view("account.ejs", ejsVariables);
			}
			else if (error instanceof Error && error.message === "request file too large") {
				const ejsVariables = {
					errors: [`Max file size is ${Math.floor(globals.maxFileSize / 1000000)} mbs`],
					user,
					profile,
				};
				return res.status(413).view("account.ejs", ejsVariables);
			}
			throw error;
		}
	});

	/**
	 * This route loads the avatar associated with searched user's account. It checks the database
	 * through the API to find the the name of the avatar and then retrieves it and send's it to the
	 * user from the minio s3 store.
	 * @param req - The fastify request instance. It has a username url parameter to know which
	 * user's avatar it should search for.
	 * @param res - The fastify response instance.
	 * @returns The avatar image alongise it's content type in the header.
	 */
	fastify.get<{ Params: AvatarUsernameParam }>("/avatar/:username", async (req, res) => {
		const { username } = req.params;
		try {
			const avatar = await accountService.getProfileAvatar(username);
			res.type(avatar.contentType);
			return res.send(avatar.stream);
		} catch (error) {
			throw error;
		}
	});
}