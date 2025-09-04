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
	
	fastify.get('/:username', getUserSchema, async (request, reply) => {
		const { username } = request.params as { username: string };
		
		try {
			const user = await usersService.getUserByUsername(username);
			
			if (!user) {
				return reply.code(404).send({ 
					statusCode: 404,
					error: 'Not Found',
					message: `User with username '${username}' not found`
				});
			}
			
			return reply.send(user);
		} catch (error) {
			fastify.log.error(`Error fetching user '${username}':`, error);
			return reply.code(500).send({ 
				statusCode: 500,
				error: 'Internal Server Error',
				message: 'Internal server error'
			});
		}
	});
}

export { users };