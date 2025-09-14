import path from "node:path";
import viteFastify from '@fastify/vite/plugin'

export default {
	root: path.resolve(process.cwd(), "client"),
	plugins: [
		viteFastify({ spa: true, useRelativePaths: true }),
	],
	build: {
		emptyOutDir: true,
		outDir: path.resolve(process.cwd(), "client", "dist"),
	}
};