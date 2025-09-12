import { FastifyInstance } from 'fastify';
import { SearchService } from './search.service';
import { SearchProfileError, SearchProfileParams, SearchUsersQuery } from './search.type';
import { ZodError } from 'zod';
import { httpErrors } from '@fastify/sensible';

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

	// User profile page
	fastify.get<{ Params: SearchProfileParams }>('/user/:username', async (request, reply) => {
		const { username } = request.params;
		const currentUser = request.user;

		try {
			searchService.validateSearchParam(username);
			const userProfile = await searchService.getUserByUsername(username);
			if (userProfile.username === currentUser?.username)
				return reply.redirect("/account");
			return reply.view('profile', {
				title: `${userProfile.username}'s Profile`,
				userProfile,
				user: currentUser,
			});
		} catch (error) {
			if (error instanceof ZodError || (error as SearchProfileError).statusCode && (error as SearchProfileError).statusCode === 404) {
				throw httpErrors.notFound();
			} else {
				throw error;
			}
		}
	});
};