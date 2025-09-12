import { FastifyInstance } from 'fastify';
import { SearchService } from './search.service';
import { SearchUsersQuery } from './search.type';
import { ZodError } from 'zod';

export async function search(fastify: FastifyInstance) {
	const searchService = new SearchService(fastify);

	/**
	 * This entire module requires the user to be logged in in order to be able to access and
	 * interact with it.
	 */
	fastify.addHook("onRequest", fastify.auth([fastify.verifyLoggedIn]));

	// Search page
	fastify.get<{ Querystring: SearchUsersQuery }>('/users', async (request, reply) => {
		const { q } = request.query;
		const currentUser = request.user;
		try {
			searchService.validateUserQuery(q.trim());
			const users = await searchService.searchUsers(q.trim());
			return reply.view('search', {
				user: currentUser,
				query: q,
				users,
			});
		} catch (error) {
			const ejsVariables = {
				user: currentUser,
				query: q,
				users: [],
				errors: [""],
			};
			if (error instanceof ZodError) {
				ejsVariables.errors = error.issues.map((element) => element.message);
				return reply.status(400).view("search", ejsVariables);
			}
			throw error;
		}
	});

	// API endpoint for user search (proxy to API)
	// fastify.get('/api/users/search', async (request, reply) => {
	// 	const { q } = request.query as { q?: string };

	// 	if (!q || q.trim().length < 2) {
	// 		return reply.code(400).send({ error: 'Query must be at least 2 characters' });
	// 	}

	// 	try {
	// 		const users = await searchService.searchUsers(q.trim());
	// 		return reply.send(users);
	// 	} catch (error: unknown) {
	// 		const errorMessage = error instanceof Error ? error.message : 'Unknown error';
	// 		fastify.log.error(errorMessage);
	// 		return reply.code(500).send({ error: 'Internal server error' });
	// 	}
	// });

	// // API endpoint to get user profile
	// fastify.get('/api/users/:username', async (request, reply) => {
	// 	const { username } = request.params as { username: string };

	// 	try {
	// 		const user = await searchService.getUserByUsername(username);
	// 		return reply.send(user);
	// 	} catch (error: unknown) {
	// 		const errorMessage = error instanceof Error ? error.message : 'Unknown error';
	// 		if (errorMessage === 'User not found') {
	// 			return reply.code(404).send({ error: 'User not found' });
	// 		}
	// 		fastify.log.error(errorMessage);
	// 		return reply.code(500).send({ error: 'Internal server error' });
	// 	}
	// });

	// User profile page
	fastify.get('/user/:username', async (request, reply) => {
		const { username } = request.params as { username: string };
		const currentUser = (request as any).user;

		try {
			const userProfile = await searchService.getUserByUsername(username);
			return reply.view('profile', {
				title: `${userProfile.username}'s Profile`,
				userProfile,
				user: currentUser,
			});
		} catch (error: unknown) {
			const errorMessage = error instanceof Error ? error.message : 'Unknown error';

			if (errorMessage === 'User not found' ||
				errorMessage.includes('404') ||
				errorMessage.toLowerCase().includes('not found')) {

				return reply.code(404).view('errors/404', {
					title: 'User not found',
					user: currentUser,
					message: `User with username '${username}' not found`
				});
			}

			fastify.log.error(error);
			return reply.view('errors/500', {
				title: 'Error',
				user: currentUser,
				message: 'Internal server error'
			});
		}
	});
};