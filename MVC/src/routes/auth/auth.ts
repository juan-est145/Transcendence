import { FastifyInstance } from "fastify";
import { LogInBody, LogInError, SigInError, SignInBody } from "./auth.type";
import { createSession, postLogin, postSignIn, validateLogInBody } from "./auth.service";
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
		if (req.session.jwt)
			return res.redirect("/");
		return res.view("/log-in.ejs");
	});

	/**
	 * This route logs the client if it's credentials are valid. If they aren't it sends
	 * back the login page with 
	 * it redirects him.
	 * @param req - The fastify request instance. It must have a body property according to the
	 * zod logInBody schema.
	 * @param res - The fastify response instance.
	 * @returns A redirection to the main page.
	 */
	fastify.post<{ Body: LogInBody }>("/login", async (req, res) => {
		try {
			if (req.session.jwt)
				return res.redirect("/");
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
				return res.status(logInError.statusCode).view("/log-in.ejs", ejsVariables);
			}
		}
	});

	/**
	 * This route logs the client out.
	 * @param req - The fastify request instance.
	 * @param res - The fastify response instance.
	 * @returns A redirection to the main page.
	 */
	fastify.get("/log-out", async (req, res) => {
		if (req.session.jwt) {
			await req.session.destroy();
		}
		return res.redirect("/");
	});

	fastify.get("/sign-in", async (req, res) => {
		if (req.session.jwt)
			return res.redirect("/");
		return res.view("/sign-in.ejs");
	});

	fastify.post<{ Body: SignInBody }>("/sign-in", async (req, res) => {
		try {
			if (req.session.jwt)
				return res.redirect("/");
			else if (req.body.password !== req.body.repeatPasswd)
				return res.status(400).view("/sign-in.ejs", { errors: ["Passwords do not match"] });
			await postSignIn(fastify, req.body);
			// This is temporal for now, later on we should redirect perhaps to the user home page.
			return res.redirect("/");
		} catch (error) {
			if (error instanceof ZodError) {
				const ejsVariables = { errors: error.issues.map((element) => element.message) };
				return res.status(400).viewAsync("/sign-in.ejs", ejsVariables);
			} else {
				const logInError = error as SigInError;
				const ejsVariables = { errors: logInError.details?.map((element) => element.msg) };
				return res.status(logInError.statusCode).view("/sign-in.ejs", ejsVariables);
			}
		}
	});

	// Temporary route for testing protected routes. It will later on be deleted once we have a
	// profile page.
	fastify.get("/protected", { preHandler: fastify.auth([fastify.verifyLoggedIn]) }, async (req, res) => {
		return res.send({ message: "You are logged in" });
	});
}