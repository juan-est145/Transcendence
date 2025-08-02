import { FastifyInstance, RouteShorthandOptions } from "fastify"
import { pingRes } from "./root.dto";
import { auth } from "./auth/auth";


const rootSchema: RouteShorthandOptions = {
	schema: {
		response: {
			200: {
				description: "It returns a message that says Pong",
				content: {
					"application/json": {
						schema: pingRes,
					},
				}
			}
		},
		tags: [ "Default" ],
		summary: "This endpoint tests the availability of the API"
	}
}

async function root(fastify: FastifyInstance): Promise<void> {
	fastify.get("/ping", rootSchema, async (req, res) => {
		return { msg: "Pong" }
	});

	fastify.register(auth, { prefix: "auth" });
}

export { root }