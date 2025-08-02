import { FastifyInstance } from "fastify";
import { signInBody } from "./auth.dto";
import { type Static } from '@sinclair/typebox'
import { PrismaClientKnownRequestError } from "@prisma/client/runtime/library";

type SignInBody = Static<typeof signInBody>

export async function createUser(fastify: FastifyInstance, body: SignInBody) {
	try {
		const result = await fastify.prisma.users.create({
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
		return result;
	} catch (error) {
		if (error instanceof PrismaClientKnownRequestError && error.code == "P2002") {
			throw fastify.httpErrors.conflict("Username or email already exits ");
		}
		throw (error);
	}
}
