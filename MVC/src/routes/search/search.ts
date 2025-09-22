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

	
	/**
	 * This route sends to the client the search page. It takes a query parameter to know
	 * which users it should look for.
	 * @param req - The fastify request instance. It has a q query string property.
	 * @param res - The fastify response instance.
	 * @returns The search page.
	 * @remarks The page requires a user property for avoiding that the user add's himself
	 * as a friend or tries to see his account page as an external user.
	 */
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

	/**
	 * This route sends to the client the account page of another user. It takes a dynamic
	 * path parameter of type string to know which user it should search for.
	 * @param req - The fastify request instance. It has a username url parameter to know
	 * which user's page it should search for.
	 * @param res - The fastify response instance.
	 * @returns The searched user's account page.
	 * @remarks The route will redirect to the user's account page if it tries to access his account
	 * page as if it where a different user.
	 */
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