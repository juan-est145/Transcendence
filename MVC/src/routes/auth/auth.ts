import { FastifyInstance } from "fastify";
import { LogInBody, LogInError } from "./auth.type";
import { createSession, postLogin, validateLogInBody } from "./auth.service";
import { ZodError } from "zod";

/**
 * This module deals with everything relating to the login page.
 */
export async function auth(fastify: FastifyInstance) {
	/**
	 * This route sends to the client the login page. In case the user is already logged in,
	 * it redirects him.
	 * @param req - The fastify request instance.
	 * @param res - The fastify response instance.
	 * @returns The login page.
	 */
	fastify.get("/login", async (req, res) => {
		if (req.session.jwt) {
			// This is temporary so as to not loggin a user again.
			return res.redirect("/");
		}
		return res.viewAsync("/log-in.ejs");
	});

	/**
	 * This route logs the client if it's credentials are valid. If they aren't it sends
	 * back the login page with 
	 * it redirects him.
	 * @param req - The fastify request instance. It must have a body property according to the
	 * zod logInBody schema.
	 * @param res - The fastify response instance.
	 * @returns (Not yet implemented)
	 */
	fastify.post<{ Body: LogInBody }>("/login", async (req, res) => {
		try {
			validateLogInBody(req.body);
			const token = await postLogin(fastify, req.body);
			fastify.jwt.verify(token.jwt);
			createSession(req.session, token);
			return res.redirect("/");

		} catch (error) {
			if (error instanceof ZodError) {
				const ejsVariables = { errors: error.issues.map((element) => element.message) };
				return res.status(400).viewAsync("/log-in.ejs", ejsVariables);
			} else {
				const logInError = error as LogInError;
				const ejsVariables = { errors: logInError.details?.map((element) => element.msg) };
				return res.status(logInError.statusCode).viewAsync("/log-in.ejs", ejsVariables);
			}
		}
	});

	fastify.get("/log-out", async (req, res) => {
		if (req.session.jwt) {
			await req.session.destroy();
		}
		return res.redirect("/");
	});

	// Temporary route for testing protected routes. It will later on be deleted once we have a
	// profile page.
	fastify.get("/protected", { preHandler: fastify.auth([fastify.verifyLoggedIn]) }, async(req, res) => {
		return res.send({ message: "You are logged in" });
	});
}