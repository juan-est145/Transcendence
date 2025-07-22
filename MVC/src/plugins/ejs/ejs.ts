import fastifyView, { FastifyViewOptions } from "@fastify/view";
import fp from "fastify-plugin";
import ejs from "ejs";
import path from "path";

// export default fp<FastifySensibleOptions>(async (fastify) => {
//   fastify.register(sensible)
// })

export default fp<FastifyViewOptions>(async (fastify) => {
	const options: FastifyViewOptions = {
		engine: {
			ejs: ejs,
		},
		root: path.join(process.cwd(), "src/templates")
	};
	fastify.register(fastifyView, options)
});

// async function view(fastify: FastifyInstance) {
// 	const engine {
// 		engine: {
// 			ejs
// 		}
// 	}

// 	await fastify.register(fastifyView, engine);
// }

//export default view;