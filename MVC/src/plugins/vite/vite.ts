import fp from "fastify-plugin";
import type { FastifyViteOptions } from "@fastify/vite";
import path from "node:path";

export default fp<FastifyViteOptions>(async (fastify) => {
	const { default: FastifyVite } = await import("@fastify/vite");

	const opts: FastifyViteOptions = {
		root: process.cwd(),
		distDir: path.resolve(process.cwd(), "client", "dist"),
		dev: false,
		spa: true,
	};
	
	fastify.register(FastifyVite, opts);
});