import fastifyView, { FastifyViewOptions } from "@fastify/view";
import fp from "fastify-plugin";
import ejs from "ejs";
import path from "path";

export default fp<FastifyViewOptions>(async (fastify) => {
	const options: FastifyViewOptions = {
		engine: {
			ejs: ejs,
		},
		root: path.join(process.cwd(), "src/templates")
	};
	fastify.register(fastifyView, options)
});