import { FastifyInstance } from "fastify";

/**
 * This module deals with everything relating to the settings page.
 */
export async function settings(fastify: FastifyInstance) {

	/**
	 * This route sends to the client the settings page.
	 * @param req - The fastify request instance.
	 * @param res - The fastify response instance.
	 * @returns The settings page.
	 */
	fastify.get("/", async (req, res) => {
		if (!req.session.jwt) {
			return res.redirect("/auth/login");
		}

		try {
			const userPayload = fastify.jwt.verify(req.session.jwt) as any;
			return res.view("/settings.ejs", { 
				user: userPayload
			});
		} catch (error) {
			console.error('Invalid JWT in settings:', error);
			await req.session.destroy();
			return res.redirect("/auth/login");
		}
	});
}