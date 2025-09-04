import { FastifyPluginAsync } from 'fastify';
import { SearchService } from './search.service';

interface SearchUser {
	id: number;
	username: string;
	email: string;
	avatar: string | null;
	createdAt: string;
}

const search: FastifyPluginAsync = async (fastify, opts): Promise<void> => {
	const searchService = new SearchService(fastify);
	
	// Search page
	fastify.get('/search', async (request, reply) => {
		const { q } = request.query as { q?: string };
		const currentUser = (request as any).user;
		
		let users: SearchUser[] = [];
		let error: string | null = null;
		
		if (q && q.trim().length >= 2) {
			try {
				users = await searchService.searchUsers(q.trim());
			} catch (err) {
				error = 'Error searching users';
				fastify.log.error(err);
			}
		}
		
		return reply.view('search', { 
			title: 'Search Users',
			user: currentUser,
			query: q || '',
			users,
			error
		});
	});
	
	// API endpoint for user search (proxy to API)
	fastify.get('/api/users/search', async (request, reply) => {
		const { q } = request.query as { q?: string };
		
		if (!q || q.trim().length < 2) {
			return reply.code(400).send({ error: 'Query must be at least 2 characters' });
		}
		
		try {
			const users = await searchService.searchUsers(q.trim());
			return reply.send(users);
		} catch (error: unknown) {
			const errorMessage = error instanceof Error ? error.message : 'Unknown error';
			fastify.log.error(errorMessage);
			return reply.code(500).send({ error: 'Internal server error' });
		}
	});
	
	// API endpoint to get user profile
	fastify.get('/api/users/:username', async (request, reply) => {
		const { username } = request.params as { username: string };

		try {
			const user = await searchService.getUserByUsername(username);
			return reply.send(user);
		} catch (error: unknown) {
			const errorMessage = error instanceof Error ? error.message : 'Unknown error';
			if (errorMessage === 'User not found') {
				return reply.code(404).send({ error: 'User not found' });
			}
			fastify.log.error(errorMessage);
			return reply.code(500).send({ error: 'Internal server error' });
		}
	});

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

export default search;