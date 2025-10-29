import { FastifyInstance } from "fastify";
import { getAccountSchema, getAvatarSchema, getFriendRelation, getFriendsSchema, getUserAvatarSchema, makeFriendSchema, postAvatarSchema, putFriendShipSchema, putOnlineStatus } from "./account.swagger";
import { JwtPayload } from "../auth/auth.type";
import { AccountService } from "./account.service";
import { AccountGetAvatarParam, AccountPostAvatarBody, FriendShipStatusBody, SetOnlineBody } from "./account.type";
import { AuthService } from "../auth/auth.service";
import { GetUserParams } from "../users/users.type";
import { UsersService } from "../users/users.service";
import { Value } from "@sinclair/typebox/value";
import { accountGetAvatarParam } from "./account.dto";
import { TypeBoxError } from "@sinclair/typebox";
import { getUserParams } from "../users/users.dto";

/**
 * This module deals with the user's account
 */
export async function account(fastify: FastifyInstance) {
	const accountService = new AccountService(fastify, new AuthService(fastify));
	accountService.setUsersService(new UsersService(fastify, accountService));

	/**
	 * This entire module requires the user to be logged in in order to be able to access and
	 * interact with it.
	 */
	fastify.addHook("preHandler", fastify.auth([fastify.verifyJwt]));

	/**
	 * This route returns the data of a user profile.
	 * @param req - The fastify request instance.
	 * @param res - The fastify response instance.
	 * @returns In case of success, it resturns a 200 JSON response with the username,
	 * email and a profile object that includes the number of victories and defeats.
	 */
	fastify.get("/", getAccountSchema, async (req, res) => {
		try {
			const jwtPayload: JwtPayload = await req.jwtDecode();
			const account = await accountService.getAccount(jwtPayload);
			return res.send(account);
		} catch (error) {
			throw error;
		}
	});

	/**
	 * This route returns the avatar information of a user profile.
	 * @param req - The fastify request instance.
	 * @param res - The fastify response instance.
	 * @returns In case of success, it returns a 200 JSON response with
	 * the user's avatar data from the avatar table in the db. Else, it throws
	 * an error and send's a JSON with the details.
	 */
	fastify.get("/avatar", getAvatarSchema, async (req, res) => {
		try {
			const jwtPayload: JwtPayload = await req.jwtDecode();
			const avatar = await accountService.getAvatar(jwtPayload);
			return res.send(avatar);
		} catch (error) {
			throw error;
		}
	});

	/**
	 * This route allows to update the avatar information related to a user profile.
	 * @param req - The fastify request instance. It must have a body that conforms
	 * to the AccountPostAvatarBody type.
	 * @param res - The fastify response instance.
	 * @returns In case of success, it returns a 201 JSON resposnse with the new
	 * information of the user's avatar. Else, it throws
	 * an error and send's a JSON with the details.
	 */
	fastify.post<{ Body: AccountPostAvatarBody }>("/avatar", postAvatarSchema, async (req, res) => {
		try {
			const { email }: JwtPayload = await req.jwtDecode();
			const result = await accountService.updateAvatar(email, req.body);
			return res.status(201).send(result);
		} catch (error) {
			throw error;
		}
	});

	/**
	 * This route returns a user's avatar information whose username is equal to the url parameter.
	 * @param req - The fastify request instance.
	 * @param res - The fastify response instance.
	 * @returns In case of success, it returns a 200 JSON response with the data of the searched user's
	 * avatar data. Else, it throws an error and send's a JSON response with the details.
	 */
	fastify.get<{ Params: AccountGetAvatarParam }>("/avatar/:username", getUserAvatarSchema, async (req, res) => {
		try {
			Value.Assert(accountGetAvatarParam, req.params);
			const { username } = req.params;
			const result = await accountService.getUserAvatar(username);
			return res.send(result);
		} catch (error) {
			if (error instanceof TypeBoxError) {
				throw fastify.httpErrors.badRequest(error.message);
			}
			throw error;
		}
	});

	/**
	 * This route allows for the creation of a friend request between two users. The logged user sends the request
	 * to the user whose username matches the username url parameter.
	 * @param req - The fastify request instance.
	 * @param res - The fastify response instance.
	 * @returns In case of success, it returns a 201 JSON response with the new relation between the two users.
	 * Else, it throws an error and send's a JSON response with the details.
	 */
	fastify.post<{ Params: GetUserParams }>("/friends/:username", makeFriendSchema, async (req, res) => {
		try {
			Value.Assert(getUserParams, req.params);
			const { username } = req.params;
			const jwtPayload: JwtPayload = await req.jwtDecode();
			const result = await accountService.makeFriend(jwtPayload, username);
			return res.status(201).send(result);
		} catch (error) {
			if (error instanceof TypeBoxError) {
				throw fastify.httpErrors.badRequest(error.message);
			}
			throw error;
		}
	});

	/**
	 * This route allows for getting a list of all of the friends and friend requests of the logged in user.
	 * @param req - The fastify request instance.
	 * @param res - The fastify response instance.
	 * @returns In case of success, it returns a 200 JSON response with the aforementioned list.
	 * Else, it throws an error and send's a JSON response with the details.
	 */
	fastify.get("/friends", getFriendsSchema, async (req, res) => {
		try {
			const jwtPayload: JwtPayload = await req.jwtDecode();
			const result = await accountService.getFriends(jwtPayload);
			return res.send(result);
		} catch (error) {
			throw error;
		}
	});

	/**
	 * This route allows for checking the relation between the logged in user and a different user.
	 * The searched user will be the one specified under the username url path variable.
	 * @param req - The fastify request instance.
	 * @param res - The fastify response instance.
	 * @returns In case of success, it returns a 200 JSON response with basic data of both users and their
	 * relation. Else, it throws an error and send's a JSON response with the details.
	 */
	fastify.get<{ Params: GetUserParams }>("/friendship/:username", getFriendRelation, async (req, res) => {
		try {
			Value.Assert(getUserParams, req.params);
			const jwtPayload: JwtPayload = await req.jwtDecode();
			const { username } = req.params;
			const result = await accountService.checkFriendRelation(jwtPayload, username);
			return res.send(result);
		} catch (error) {
			if (error instanceof TypeBoxError) {
				throw fastify.httpErrors.badRequest(error.message);
			}
			throw error;
		}
	});

	/**
	 * This route allows the logged in user for modifying friendships and friend requests. You can accept, reject and delete.
	 * The user to which the operation will be applied will be the one specified under the username url variable.
	 * @param req - The fastify request instance. It's body must fulfill the FriendShipStatusBody object.
	 * @param res - The fastify response instance.
	 * @returns In case of sucess, it will return the new relation if a request was accepted or the old one if it has
	 * been deleted. Else, it throws an error and send's a JSON response with the details.
	 */
	fastify.put<{ Params: GetUserParams, Body: FriendShipStatusBody }>("/friendship/:username", putFriendShipSchema, async (req, res) => {
		try {
			Value.Assert(getUserParams, req.params);
			const jwtPayload: JwtPayload = await req.jwtDecode();
			const { username } = req.params;
			const result = await accountService.handleFriendRelation(jwtPayload, username, req.body);
			return res.send(result);
		} catch (error) {
			if (error instanceof TypeBoxError) {
				throw fastify.httpErrors.badRequest(error.message);
			}
			throw error;
		}
	});
	
	/**
	 * This route allows to update the logged user's online status.
	 * @param req - The fastify request instance. It must have a body according to the SetOnlineBody type.
	 * @param res - The fastify response instance.
	 * @returns In case of success, it returns a 200 JSON response with
	 * the user's avatar data from the avatar table in the db. Else, it throws
	 * an error and send's a JSON with the details.
	 */
	fastify.put<{ Body: SetOnlineBody }>("/online_status", putOnlineStatus, async (req, res) => {
		try {
			const { email }: JwtPayload = await req.jwtDecode();
			const { online } = await accountService.setOnlineStatus(req.body.online, email);
			return res.send({ online });
		} catch (error) {
			throw error;
		}
	});
}