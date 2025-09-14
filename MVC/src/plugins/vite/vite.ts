import fp from "fastify-plugin";
import FastifyVite, { FastifyViteOptions } from "@fastify/vite";
import path from "node:path";

export default fp<FastifyViteOptions>(async (fastify) => {
	const opts: FastifyViteOptions = {
		root: process.cwd(),
		distDir: path.resolve(process.cwd(), "client", "dist"),
		dev: process.env.NODE_ENV !== "production",
		spa: true,
	};
	fastify.register(FastifyVite, opts);
});