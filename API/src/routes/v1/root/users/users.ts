import { FastifyInstance } from "fastify";
import { UsersService } from "./users.service";
import { searchUsersSchema, getUserSchema } from "./users.swagger";

async function users(fastify: FastifyInstance): Promise<void> {
	const usersService = new UsersService(fastify.prisma);
	
	fastify.get('/search', searchUsersSchema, async (request, reply) => {
		const { q } = request.query as { q: string };
		
		try {
			const users = await usersService.searchUsers(q.trim());
			return reply.send(users);
		} catch (error) {
			fastify.log.error(error);
			throw new Error('Internal server error');
		}
	});
	
	fastify.get('/:userId', getUserSchema, async (request, reply) => {
		const { userId } = request.params as { userId: string };
		
		try {
			const user = await usersService.getUserById(parseInt(userId));
			
			if (!user) {
				return reply.code(404).send({ 
					statusCode: 404,
					httpError: 'NOT_FOUND',
					details: [{ msg: ['User not found'] }]
				});
			}
			
			return reply.send(user);
		} catch (error) {
			fastify.log.error(error);
			throw new Error('Internal server error');
		}
	});
}

export { users };