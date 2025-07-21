import fastifySwagger, { SwaggerOptions } from "@fastify/swagger";
//import { FastifyInstance } from "fastify";
import fastifySwaggerUi, { FastifySwaggerUiOptions } from "@fastify/swagger-ui";
import fp from "fastify-plugin";

// async function swagger(fastify: FastifyInstance) {
	

	

// 	await fastify.register(fastifySwagger, swaggerOpt);
// 	await fastify.register(fastifySwaggerUi, swaggerUIOpt);
// }

export default fp<SwaggerOptions>(async (fastify) => {
	const swaggerOpt: SwaggerOptions = {
		openapi: {
			openapi: "3.0.0",
			info: {
				title: "Swagger test",
				description: "This is a test of fastify swagger with typebox",
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