import fp from "fastify-plugin";
import fastifyCookie from "@fastify/cookie";
import fastifySession, { FastifySessionOptions } from "@fastify/session";
import knex from "knex";
import { ConnectSessionKnexStore } from "connect-session-knex";

export default fp<FastifySessionOptions>(async (fastify) => {
	
	const knexIntance = knex({
		client: 'sqlite3',
		connection: {
			filename: "/app/db/Sessions.db",
		},
		useNullAsDefault: true
	});

	const sessionOpts: FastifySessionOptions = {
		secret: process.env.COOKIE_SECRET!,
		cookie: {
			maxAge: 60 * 60 * 1000 * 24 * 7, // 7 days total,
			httpOnly: true,
			secure: true,
			sameSite: "lax",
		},
		saveUninitialized: false,
		store: new ConnectSessionKnexStore({
			createTable: true,
			knex: knexIntance,
			tableName: "sessions"
		}),
	};

	fastify.register(fastifyCookie);
	fastify.register(fastifySession, sessionOpts);
});