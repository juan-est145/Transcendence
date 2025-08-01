import { FastifyInstance } from "fastify";
import { signInBody } from "./auth.dto";
import { type Static } from '@sinclair/typebox'

type SignInBody = Static<typeof signInBody>

export async function createUser(fastify: FastifyInstance, body: SignInBody) {
	try {
		return fastify.prisma.users.create({
			data: {
				username: body.username,
				password: body.password,
				email: body.email,
				profile: {
					create: {}
				}
			},
			select: {
				username: true,
				email: true,
			}
		});
	} catch (error) {
		console.error("Something went wrong");
	}
}
