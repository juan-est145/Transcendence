import path from "node:path";
import { access, mkdir, rename, rm } from "node:fs/promises";
import viteFastify from '@fastify/vite/plugin'

function relocateViteConfig() {
	const source = path.resolve(process.cwd(), "client", "vite.config.json");
	const target = path.resolve(process.cwd(), "client", "dist", "vite.config.json");

	return {
		name: "relocate-vite-config",
		async closeBundle() {
			try {
				await access(source);
			} catch {
				return
			}

			await mkdir(path.dirname(target), { recursive: true });
			await rm(target, { force: true });
			await rename(source, target);
		},
	}
}

export default {
	root: path.resolve(process.cwd(), "client"),
	plugins: [
		viteFastify({ spa: true, useRelativePaths: true }),
		relocateViteConfig(),
	],
	build: {
		emptyOutDir: true,
		outDir: path.resolve(process.cwd(), "client", "dist"),
		target: 'es2020',
		minify: 'terser',
		sourcemap: true,
		rollupOptions: {
			output: {
				manualChunks: {
					'babylon': ['@babylonjs/core', '@babylonjs/gui'],
					'earcut': ['earcut']
				}
			}
		}
	},
	optimizeDeps: {
		include: ['@babylonjs/core', '@babylonjs/gui', 'earcut'],
		force: true,
		esbuildOptions: {
			target: 'es2020'
		}
	},
	server: {
		fs: {
			strict: false,
			allow: ['..']
		},
		headers: {
			'Cross-Origin-Embedder-Policy': 'credentialless',
			'Cross-Origin-Opener-Policy': 'same-origin'
		}
	}
};