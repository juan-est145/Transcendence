import { FastifyInstance } from "fastify";
import { LogInBody, LogInError } from "./log-in.type";
import { postLogin, validateLogInBody } from "./log-in.service";
import { ZodError } from "zod";
// import type { LogInError } from "./log-in.type";

export async function auth(fastify: FastifyInstance) {
	fastify.get("/login", async (req, res) => {
		return res.viewAsync("/log-in.ejs");
	});

	fastify.post<{ Body: LogInBody }>("/login", async (req, res) => {
		// TO DO: Add try catch
		//Value.Assert(logInBody, req.body);
		try {
			validateLogInBody(req.body);
			const jwt = await postLogin(fastify, req.body);
			// Temp: Later we must create a session with the jwt.
			return jwt;
			
		} catch (error) {
			if (error instanceof ZodError) {
				return res.status(400).send({ msg: error.issues.map((element) => element.message) });
			} else {
				const logInError = error as LogInError;
				return res.status(logInError.statusCode).send(logInError.details);
			}
		}
	});
}