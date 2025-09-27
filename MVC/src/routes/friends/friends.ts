import { FastifyInstance } from "fastify";
import { SearchProfileParams } from "../search/search.type";
import { FriendsService } from "./friends.service";
import { SearchService } from "../search/search.service";
import { ZodError } from "zod";
import { AddFriendsError, RelationShipBody } from "./friends.type";
import { httpErrors } from "@fastify/sensible";


export async function friends(fastify: FastifyInstance) {
	fastify.addHook("onRequest", fastify.auth([fastify.verifyLoggedIn]));

	const friendsService = new FriendsService(fastify, new SearchService(fastify));

	fastify.post<{ Params: SearchProfileParams }>("/add/:username", async (req, res) => {
		const { username } = req.params;
		try {
			friendsService.validateUserParam(username);
			await friendsService.makeFriend(username);
			return res.redirect("/account");
		} catch (error) {
			const ejsVariables = {
				user: req.user,
				query: "",
				users: [],
				errors: [""],
			};
			if (error instanceof ZodError) {
				ejsVariables.errors = error.issues.map((element) => element.message);
				return res.status(400).view("search", ejsVariables);
			}
			else if ((error as AddFriendsError).statusCode && (error as AddFriendsError).statusCode === 404)
				throw httpErrors.notFound();
			else if ((error as AddFriendsError).statusCode && (error as AddFriendsError).statusCode === 409) {
				ejsVariables.errors = ["You are trying to add an established friendship or a pending one"];
				return res.status(409).view("search", ejsVariables);
			}
			throw error;
		}
	});

	fastify.post<{ Params: SearchProfileParams, Body: RelationShipBody }>("/friendRequest/:username", async (req, res) => {
		const { username } = req.params;
		try {
			friendsService.validateUserParam(username);
			friendsService.validateRelationShipBody(req.body);
			await friendsService.handleFriendShip(username, req.body);
			// This is temporal, only to see it in action. Might need to change it.
			return res.redirect("/account");
			} catch (error) {
			// TO DO: Make sure to display the appropiate error message if validation fails.
		}
	});
}