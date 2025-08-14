import fp from "fastify-plugin";
import fastifyCookie from "@fastify/cookie";
import fastifySession, { FastifySessionOptions } from "@fastify/session";
//import { PrismaSessionStore } from "@quixo3/prisma-session-store";
import { PrismaClient } from '@prisma/client';

// Apparently creating a cookie in the browser fucks everything up. No idea why
// I despise all the bloody Typescript and Javascript ecosystem

export default fp<FastifySessionOptions>(async (fastify) => {
	//const prisma = new PrismaClient();
	const sessionOpts: FastifySessionOptions = {
		secret: process.env.COOKIE_SECRET!,
		cookie: {
			maxAge: 60 * 60 * 1000 * 24 * 7, // 7 days total,
			httpOnly: true,
			secure: true,
			sameSite: "lax",
		},
		saveUninitialized: false,
		// store: new PrismaSessionStore(
		// 	prisma,
		// 	{
		// 		checkPeriod: 2 * 60 * 1000,  //ms
		// 		dbRecordIdIsSessionId: true,
		// 		dbRecordIdFunction: undefined,
		// 	}
		// )
	};

	// await prisma.$connect();
	// fastify.decorate('prisma', prisma);

	// fastify.addHook('onClose', async () => {
	// 	await prisma.$disconnect();
	// });

	fastify.register(fastifyCookie);
	fastify.register(fastifySession, sessionOpts);
});


declare module 'fastify' {
	interface FastifyInstance {
		prisma: PrismaClient;
	}
}


declare module "fastify" {
    interface Session {
        user_id: string
        id?: number
    }
}