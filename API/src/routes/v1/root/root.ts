import { FastifyInstance, RouteShorthandOptions } from "fastify"
import { prueba } from "./nested/nested";
import { Req, Res } from "./root.dto";
import { type Static } from '@sinclair/typebox';


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

	fastify.get("/db-test", async (req, res) => {
		try {
			const pings = await fastify.prisma.ping.findMany();
			return { db: "connected", entries: pings };
		} catch (error) {
			return res.status(500).send({ db: "error", message: (error as Error).message });
		}
	});

	fastify.register(prueba, { prefix: "nested" })
}

export { root }