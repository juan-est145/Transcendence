import { FastifyInstance, RouteShorthandOptions } from "fastify"
import { prueba } from "./nested/nested";
import { Req, Res } from "./root.dto";
import { type Static } from '@sinclair/typebox';
import { auth } from "./auth/auth";


const rootSchema: RouteShorthandOptions = {
	schema: {
		response: {
			200: Res
		}
	}
}

const postSchema: RouteShorthandOptions = {
	schema: {
		body: Req,
		response: {
			200: Res,
		}
	}
}

async function root(fastify: FastifyInstance): Promise<void> {
	fastify.get("/", rootSchema, async (req, res) => {
		return { msg: "Hola caracola" }
	});

	fastify.get("/route/", rootSchema, async (req, res) => {
		return { msg: "Another route" }
	});

	fastify.post<{ Body: Static<typeof Req>}>("/", postSchema, async (req, res) => {
		return { msg: `The number you entered was ${req.body.number}`}
	});

	//fastify.register(prueba, { prefix: "nested" })
	fastify.register(auth, { prefix: "auth" });
}

export { root }