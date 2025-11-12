import { FastifyInstance } from "fastify";
import { UsersService } from "./users.service";
import { searchUsersSchema, getUserSchema } from "./users.swagger";
import { GetUserParams, SearchUsersQuery } from "./users.type";
import { httpErrors } from "@fastify/sensible";

export async function users(fastify: FastifyInstance): Promise<void> {
	const usersService = new UsersService(fastify);

	/**
	 * This entire module requires the user to be logged in in order to be able to access and
	 * interact with it.
	 */
	fastify.addHook("preHandler", fastify.auth([fastify.verifyJwt]));

	/**
	 * This route returns a collection of users whose username contains the string in the query string.
	 * @param req - The fastify request instance. It has a query string of the username to use.
	 * @param res - The fastify response instance.
	 * @returns In case of sucess, it returns a 200 JSON response with an array of all the
	 * found users.
	 */
	fastify.get<{ Querystring: SearchUsersQuery }>('/search', searchUsersSchema, async (request, reply) => {
		const { q } = request.query;
		try {
			const users = await usersService.searchUsers(q.trim());
			return users.length > 0 ? reply.send(users) : reply.code(404).send(users);
		} catch (error) {
			throw error;
		}
	});

	/**
	 * This route returns non-confidential information of a user whose username is equal to the
	 * username in the url parameter.
	 * @param req - The fastify request instance. It has a url parameter of the username to find.
	 * @param res - The fastify response instance.
	 * @returns In case of success, it returns a 200 JSON response with the user's information.
	 */
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