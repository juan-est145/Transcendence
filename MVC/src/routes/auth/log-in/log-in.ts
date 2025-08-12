import { FastifyInstance } from "fastify";
import { LogInBody } from "./log-in.type";

export async function auth(fastify: FastifyInstance) {
	fastify.get("/login", async (req, res) => {
		return res.viewAsync("/log-in.ejs");
	});

	fastify.post<{ Body: LogInBody }>("/login", async (req, res) => {
		// TO DO: Add try catch
		const { data } = await fastify.apiClient.POST("/v1/auth/log-in", {
			body: {
				email: req.body.email,
				password: req.body.password,
			},
		});
		return data;
	});
}