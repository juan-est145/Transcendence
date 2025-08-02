import fastifySwagger, { SwaggerOptions } from "@fastify/swagger";
import fastifySwaggerUi, { FastifySwaggerUiOptions } from "@fastify/swagger-ui";
import fp from "fastify-plugin";

export default fp<SwaggerOptions>(async (fastify) => {
	const swaggerOpt: SwaggerOptions = {
		openapi: {
			openapi: "3.0.0",
			info: {
				title: "Transcendence API",
				description: "This is a REST API to perform CRUD operations and account managament",
				version: "1.0.0",
			}
		},
		mode: "dynamic",
	};
	const swaggerUIOpt: FastifySwaggerUiOptions = {
		routePrefix: "/docs"
	};

	fastify.register(fastifySwagger, swaggerOpt);
	fastify.register(fastifySwaggerUi, swaggerUIOpt);
});