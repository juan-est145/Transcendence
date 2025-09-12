import { FastifyInstance } from "fastify";
import { UsersService } from "./users.service";
import { searchUsersSchema, getUserSchema } from "./users.swagger";
import { GetUserParams, SearchUsersQuery } from "./users.type";
import { httpErrors } from "@fastify/sensible";
import { AccountService } from "../account/account.service";
import { AuthService } from "../auth/auth.service";

export async function users(fastify: FastifyInstance): Promise<void> {
	const usersService = new UsersService(fastify, new AccountService(fastify, new AuthService(fastify)));

	/**
	 * This entire module requires the user to be logged in in order to be able to access and
	 * interact with it.
	 */
	fastify.addHook("preHandler", fastify.auth([fastify.verifyJwt]));
	
	fastify.get<{ Querystring: SearchUsersQuery }>('/search', searchUsersSchema, async (request, reply) => {
		const { q } = request.query;

		try {
			const users = await usersService.searchUsers(q.trim());
			return users.length > 0 ? reply.send(users) : reply.code(404).send(users);
		} catch (error) {
			throw error;
		}
	});
	
	fastify.get<{ Params: GetUserParams }>('/:username', getUserSchema, async (request, reply) => {
		const { username } = request.params
		try {
			const user = await usersService.getUserByUsername(username);
			
			if (!user) {
				throw httpErrors.notFound(`Username ${username} was not found`);
			}
			
			return reply.send(user);
		} catch (error) {
			throw error;
		}
	});
}