import { FastifyInstance } from "fastify";
import { LogInBody, LogInError, SigInError, SignInBody } from "./auth.type";
import { AuthService } from "./auth.service";
import { ZodError } from "zod";

/**
 * This module deals with everything relating to the login page.
 */
export async function auth(fastify: FastifyInstance) {

	const authService = new AuthService(fastify);

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
	 * back the login page with a message explaining the errors.
	 * @param req - The fastify request instance. It must have a body property according to the
	 * zod logInBody schema.
	 * @param res - The fastify response instance.
	 * @returns A redirection to the main page. Later on, it must be the user's profile page.
	 */
	fastify.post<{ Body: LogInBody }>("/login", async (req, res) => {
		try {
			if (req.session.jwt)
				return res.redirect("/");
			authService.validateLogInBody(req.body);
			const token = await authService.postLogin(req.body);
			fastify.jwt.verify(token.jwt);
			authService.createSession(req.session, token);
			return res.redirect("/account");
		} catch (error) {
			if (error instanceof ZodError) {
				const ejsVariables = { errors: error.issues.map((element) => element.message) };
				return res.status(400).view("/log-in.ejs", ejsVariables);
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

	/**
	 * This route sends the sign in form to the client.
	 * @param req - The fastify request instance.
	 * @param res - The fastify response instance.
	 * @returns The sign-in page.
	 */
	fastify.get("/sign-in", async (req, res) => {
		if (req.session.jwt)
			return res.redirect("/");
		return res.view("/sign-in.ejs");
	});

	/**
	 * This route creates an account if the credentials are valid. If they aren't it sends
	 * back the sign in page with a message explaining the error's in the form.
	 * @param req - The fastify request instance. It must have a body property according to the
	 * zod signInBody schema.
	 * @param res - The fastify response instance.
	 * @returns A redirection to the main page. Later on, it must be the sign in page.
	 */
	fastify.post<{ Body: SignInBody }>("/sign-in", async (req, res) => {
		try {
			if (req.session.jwt)
				return res.redirect("/");
			else if (req.body.password !== req.body.repeatPasswd)
				return res.status(400).view("/sign-in.ejs", { errors: ["Passwords do not match"] });
			authService.validateSignInBody(req.body);
			await authService.postSignIn(req.body);
			return res.status(201).view("/sign-in.ejs", { success: ["Your account was created successfully"] });
		} catch (error) {
			if (error instanceof ZodError) {
				const ejsVariables = { errors: error.issues.map((element) => element.message) };
				return res.status(400).view("/sign-in.ejs", ejsVariables);
			} else {
				const signInError = error as SigInError;
				const ejsVariables = { errors: signInError.details?.map((element) => element.msg) };
				return res.status(signInError.statusCode).view("/sign-in.ejs", ejsVariables);
			}
		}
	});
}