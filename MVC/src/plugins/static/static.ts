import fastifyStatic, { FastifyStaticOptions } from "@fastify/static";
import path from "path";
import fp from "fastify-plugin";

export default fp<FastifyStaticOptions>(async (fastify) => {
	const options: FastifyStaticOptions = {
		root: path.join(process.cwd(), "public"),
		allowedPath: (pathName, root, req) => {	return pathName === "/tsconfig.json" ? false : true; },
	};
	fastify.register(fastifyStatic, options);
});