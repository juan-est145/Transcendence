import { FastifyInstance } from "fastify";
import { LogInBody, LogInError } from "./log-in.type";
import { postLogin, validateLogInBody } from "./log-in.service";
import { ZodError } from "zod";

export async function auth(fastify: FastifyInstance) {
	fastify.get("/login", async (req, res) => {
		return res.viewAsync("/log-in.ejs");
	});

	fastify.post<{ Body: LogInBody }>("/login", async (req, res) => {
		try {
			validateLogInBody(req.body);
			const jwt = await postLogin(fastify, req.body);
			// TO DO: Later we must create a session with the jwt.
			return jwt;

		} catch (error) {
			if (error instanceof ZodError) {
				const ejsVariables = { errors: error.issues.map((element) => element.message) }
				return res.status(400).viewAsync("/log-in.ejs", ejsVariables);
			} else {
				const logInError = error as LogInError;
				const ejsVariables = { errors: logInError.details?.map((element) => element.msg) }
				return res.status(logInError.statusCode).viewAsync("/log-in.ejs", ejsVariables);
			}
		}
	});
}