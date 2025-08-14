import { FastifyInstance } from "fastify";
import { LogInBody, LogInError } from "./log-in.type";
import { postLogin, validateLogInBody } from "./log-in.service";
import { ZodError } from "zod";

/**
 * This module deals with everything relating to the login page.
 */
export async function auth(fastify: FastifyInstance) {
	// TO DO: When sessions have been implemented, we must redirect the user if it is
	// already logged in in all of these routes. We probably will need a hook for that.

	/**
	 * This route sends to the client the login page. In case the user is already logged in,
	 * it redirects him.
	 * @param req - The fastify request instance.
	 * @param res - The fastify response instance.
	 * @returns The login page.
	 */
	fastify.get("/login", async (req, res) => {
		// if (req.session.jwt) {
		// 	await req.session.destroy();
		// }
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
			// TO DO: Later we must create a session with the jwt.
			//const test = req.session as any;
			// test.jwt = jwt
			// req.session.jwt as any = jwt;
			// return jwt;
			// return { msg: "prueba" };
			//
			req.session.jwt = token.jwt;
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
}