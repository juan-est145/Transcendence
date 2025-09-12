import { RouteShorthandOptions } from "fastify";
import { pingRes } from "./root.dto";

export const rootSchema: RouteShorthandOptions = {
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
		tags: ["Default"],
		summary: "This endpoint tests the availability of the API"
	}
}