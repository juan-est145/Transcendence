import fp from "fastify-plugin";
import createClient from "openapi-fetch";
import type { paths } from "../../../schema/api-schema";

export default fp(async (fastify) => {
	const client = createClient<paths>({ baseUrl: "https://api:4343" });
	fastify.decorate("apiClient", client);
});

declare module "fastify" {
	interface FastifyInstance {
		apiClient: createClient.Client<paths, `${string}/${string}`>
	}
};