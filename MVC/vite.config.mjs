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