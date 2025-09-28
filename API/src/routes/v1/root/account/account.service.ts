import { FastifyInstance } from "fastify";
import { JwtPayload } from "../auth/auth.type";
import { AccountPostAvatarBody, AccountRes, FriendRelation, FriendShipStatusBody, FriendWithProfiles, GetAccntQuery } from "./account.type";
import { PrismaClientKnownRequestError } from "@prisma/client/runtime/library";
import { AuthService } from "../auth/auth.service";
import { UsersService } from "../users/users.service";

/**
 * This class acepts the following parameters:
 * @param fastify - The current fastify instance.
 * @param authService - The Auth service class.
 */
export class AccountService {
	private usersService?: UsersService;
	constructor(
		private fastify: FastifyInstance,
		private authService: AuthService,
	) { }

	/**
	 * This function retrieves an user and it's profile from the database. It also modifies the object
	 * to include the victories and defeats suffered in tournaments.
	 * @param jwtPayload - An object representative of the JWT with the user credentials.
	 * Needed to know which user is asking for the data.
	 * @returns If successful, it returns the information of the user. In case of error,
	 * it throws it, for it to be catched elsewhere.
	 */
	async getAccount(jwtPayload: JwtPayload) {
		try {
			const query = await this.fastify.prisma.users.findUniqueOrThrow({
				where: {
					username: jwtPayload.username,
					email: jwtPayload.email,
				},
				select: {
					profile: {
						include: {
							tournaments: {
								select: { rank: true }
							}
						}
					},
					username: true,
					email: true
				}
			});
			return this.addTourResults(query!);
		} catch (error) {
			if (error instanceof PrismaClientKnownRequestError && error.code == "P2025")
				throw this.fastify.httpErrors.notFound();
			throw error;
		}
	}

	/**
	 * This function finds the information of the avatar related to the user and send's it back.
	 * @param jwtPayload - An object representative of the JWT with the user credentials.
	 * Needed to know which user is asking for the data.
	 * @returns If successful, it returns the information of the user's avatar. In case of error,
	 * it throws it, for it to be catched elsewhere. In case it can't find said avatar, it throws
	 * a 404 error.
	 */
	async getAvatar(jwtPayload: JwtPayload) {
		try {
			const { username, email } = jwtPayload;
			const avatar = await this.fastify.prisma.avatar.findFirstOrThrow({
				where: {
					profile: {
						user: {
							email,
							username,
						}
					}
				}
			});
			return avatar;
		} catch (error) {
			if (error instanceof PrismaClientKnownRequestError && error.code === "P2025")
				throw this.fastify.httpErrors.notFound();
			throw error;
		}
	}

	/**
	 * This function updates the user's avatar information and send's back the updated information.
	 * @param email - The email of the user. It is needed for finding the profile associated with
	 * the avatar.
	 * @param avatar - An object with the new properties to update to the user.
	 * @returns If successful, it returns the updated avatar information. In case of error,
	 * it throws it, for it to be catched elsewhere. In case it can't find said avatar, it throws
	 * a 404 error.
	 */
	async updateAvatar(email: string, avatar: AccountPostAvatarBody) {
		try {
			const { profile } = await this.authService.getUser(email);
			const { name, contentType } = avatar;
			const result = await this.fastify.prisma.avatar.update({
				where: { id: profile?.id },
				data: {
					name,
					contentType,
				}
			});
			return result;
		} catch (error) {
			if (error instanceof PrismaClientKnownRequestError && error.code === "P2025")
				throw this.fastify.httpErrors.notFound();
			throw error;
		}
	}

	/**
	 * This function adds the properties victories and defeats to an object that implements the 
	 * GetAccntQuery interface.
	 * @param query - An object that implements GetAccntQuery. In general contains user and profile
	 * info.
	 * @returns The object with the properties victories and defeats added to it.
	 */
	addTourResults(query: GetAccntQuery) {
		const tournaments = query!.profile!.tournaments || [];
		const victories = tournaments.filter(t => t.rank === 1).length;
		const defeats = tournaments.filter(t => t.rank !== 1).length;
		const result: AccountRes = {
			...query!,
			profile: {
				id: query!.profile!.id,
				createdAt: query!.profile!.createdAt.toISOString(),
				updatedAt: query!.profile!.updatedAt.toISOString(),
				online: query!.profile!.online,
				victories,
				defeats,
			}
		};
		return result;
	}

	/**
	 * This function finds the searched user's avatar information.
	 * @param username - The username of the user whose avatar information we want.
	 * @returns The avatar information.
	 */
	async getUserAvatar(username: string) {
		try {
			const result = await this.fastify.prisma.avatar.findFirstOrThrow({
				where: {
					profile: {
						user: {
							username
						}
					}
				}
			});
			return result;
		} catch (error) {
			if (error instanceof PrismaClientKnownRequestError && error.code === "P2025")
				throw this.fastify.httpErrors.notFound();
			throw error;
		}
	}

	/**
	 * This function creates a new friendship relation between two users.
	 * @param jwtPayload - A JWT payload that identifies the person that send's the request first.
	 * @param username - The username of the friend he wishes to befriend.
	 * @returns A JSON object representing the status of the new relation.
	 * @remarks It is IMPERATIVE, that in this kind of relations, the smallest id is always the one
	 * that must be placed at user1Id in order to avoid duplicates. That it is why at inserting the
	 * data, it checks the smallest number to set the values appropietly
	 */
	async makeFriend(jwtPayload: JwtPayload, username: string) {
		try {
			const userAccount = await this.getAccount(jwtPayload);
			const newFriend = await this.usersService?.getUserByUsername(username);
			if (!newFriend)
				throw this.fastify.httpErrors.notFound("Username does not exist");
			const userId = userAccount.profile.id;
			const newFriendId = newFriend!.id;
			if (userId === newFriendId)
				throw this.fastify.httpErrors.badRequest("Can't make a friend of yourself");
			const result = await this.fastify.prisma.friends.create({
				data: {
					user1Id: userId < newFriendId ? userId : newFriendId,
					user2Id: userId < newFriendId ? newFriendId : userId,
					status: userId < newFriendId ? "SECOND_PENDING" : "FIRST_PENDING",
				}
			});
			return result;
		} catch (error) {
			if (error instanceof PrismaClientKnownRequestError && error.code === "P2002") {
				throw this.fastify.httpErrors.conflict("You already sent a friendship request or you are friends");
			}
			throw error;
		}
	}

	/**
	 * This function is used as a setter in order to inject the UsersService class. The reason we can't do that in the
	 * constructor directly is because it results in a circular dependency.
	 * @param usersService The UsersService instance to be injected.
	 */
	setUsersService(usersService: UsersService) {
		this.usersService = usersService;
	}

	/**
	 * This function returns an array of all friendship's and friend requests associated with the logged in user.
	 * @param jwtPayload - A JWT of the logged in user with it's username and email.
	 * @returns An array contains a JSON object with the id's, relation status and profile info associated with the user.
	 */
	async getFriends(jwtPayload: JwtPayload) {
		try {
			const { profile } = await this.getAccount(jwtPayload);
			const friendIds = await this.fastify.prisma.friends.findMany({
				where: {
					OR: [
						{ user1Id: profile.id },
						{ user2Id: profile.id },
					],
				},
				include: {
					user1: {
						include: {
							user: {
								select: {
									username: true
								}
							}
						}
					},
					user2: {
						include: {
							user: {
								select: {
									username: true
								}
							}
						}
					}
				}
			});
			return this.filterFriendInfo(friendIds, profile.id);
		} catch (error) {
			throw error;
		}
	}

	/**
	 * This function filters out the information of querying for the friends table and only leaves
	 * the information pertaining to the searched user's, not the logged in user.
	 * @param friends - An array of friend relations to be searched on
	 * @param userId - The id of the logged in user. Used for filtering out it's values.
	 * @returns - An array with cleaned up and filtered results.
	 */
	filterFriendInfo(friends: FriendWithProfiles[], userId: number) {
		const result = friends.map((elements) => {
			const id = elements.user1Id === userId ? elements.user2Id : elements.user1Id;
			const profile = elements.user1Id === userId ? elements.user2 : elements.user1;
			const { user, ...restProfile } = profile;
			return {
				id,
				status: elements.status,
				profile: {
					...restProfile,
					username: user.username
				},
			};
		});
		return result;
	}

	/**
	 * This function checks if the logged in user and another searched user either are friends,
	 * have a pending friendship request or they have no relation at all.
	 * @param jwtPayload - A JWT that has the username and email of the logged in user.
	 * @param username - The username of the user to be searched for.
	 * @returns A friend relation object that includes the relation status and both user's id's and 
	 * usernames.
	 */
	async checkFriendRelation(jwtPayload: JwtPayload, username: string): Promise<FriendRelation> {
		try {
			const { profile } = await this.getAccount(jwtPayload);
			const otherUser = await this.usersService?.getUserByUsername(username);
			if (!otherUser)
				throw this.fastify.httpErrors.notFound(`The searched username: ${username}, does not exist`);
			else if (profile.id === otherUser.id)
				throw this.fastify.httpErrors.badRequest("You cannot search yourself as friend");
			const smallerId = profile.id > otherUser.id ? otherUser.id : profile.id;
			const biggerId = profile.id > otherUser.id ? profile.id : otherUser.id;
			const query = await this.fastify.prisma.friends.findUnique({
				where: {
					user1Id_user2Id: {
						user1Id: smallerId,
						user2Id: biggerId
					}
				},
				select: {
					status: true,
					user1: {
						select: {
							user: {
								select: {
									username: true,
									id: true,
								}
							}
						}
					},
					user2: {
						select: {
							user: {
								select: {
									username: true,
									id: true,
								}
							}
						}
					}
				}
			});
			if (!query) {
				return {
					user1: {
						id: smallerId,
						username: smallerId === profile.id ? jwtPayload.username : otherUser.username,
					},
					user2: {
						id: biggerId,
						username: biggerId === profile.id ? jwtPayload.username : otherUser.username,
					},
					status: "NOT_FRIENDS"
				}
			}
			return {
				user1: {
					...query.user1.user
				},
				user2: {
					...query.user2.user,
				},
				status: query.status,
			};
		} catch (error) {
			throw error;
		}
	}

	/**
	 * This function modifies the existing relation between two users, either creating one or deleting
	 * one, depending on the values inside the body parameter.
	 * @param jwtPayload - A JWT that has the username and email of the logged in user.
	 * @param username - The username of the user to be searched for.
	 * @param body - An object that has an action property with a union type between the literal
	 * types "ACCEPT" and "DELETE". Depending on the value, either action will be taken on the relationship
	 * @returns In all cases, it returns an object with the user's id's and their status. However, if the
	 * request was to accept the relation, the object will represent the updated relation, but if the request
	 * was to delete the relation, the object will represent the previous relation.
	 */
	async handleFriendRelation(jwtPayload: JwtPayload, username: string, body: FriendShipStatusBody) {
		try {
			const { profile } = await this.getAccount(jwtPayload);
			const otherUser = await this.usersService?.getUserByUsername(username);
			if (!otherUser)
				throw this.fastify.httpErrors.notFound(`The searched username: ${username}, does not exist`);
			else if (profile.id === otherUser.id)
				throw this.fastify.httpErrors.badRequest("You can't be friends with yourself");
			const smallerId = profile.id > otherUser.id ? otherUser.id : profile.id;
			const biggerId = profile.id > otherUser.id ? profile.id : otherUser.id;
			return body.action === "ACCEPT" ? await this.acceptFriend(smallerId, biggerId) : await this.deleteFriendRelation(smallerId, biggerId);
		} catch (error) {
			throw error;
		}
	}

	/**
	 * This function performs a query in the database to delete the records of a friendship.
	 * @param user1Id - The lowest number user id.
	 * @param user2Id - The highest number user id.
	 * @returns An object containing both user's id's and their relation status previous to being deleted.
	 */
	async deleteFriendRelation(user1Id: number, user2Id: number) {
		try {
			const result = await this.fastify.prisma.friends.delete({
				where: {
					user1Id_user2Id : {
						user1Id,
						user2Id
					}
				}
			});
			return result;
		} catch (error) {
			if (error instanceof PrismaClientKnownRequestError && error.code === "P2025") {
				throw this.fastify.httpErrors.notFound("The friendship does not exist");
			}
			throw error;
		}
	}

	/**
	 * This function accepts a friend request between two users and updates the record in the database.
	 * @param user1Id - The lowest number user id.
	 * @param user2Id - The highest number user id.
	 * @returns An object containing both user's id's and their new relation status.
	 */
	async acceptFriend(user1Id: number, user2Id: number) {
		try {
			const result = await this.fastify.prisma.friends.update({
				data: {
					status: "FRIENDS",
				},
				where: {
					user1Id_user2Id: {
						user1Id,
						user2Id,
					}
				}
			});
			return result;
		} catch (error) {
			if (error instanceof PrismaClientKnownRequestError && error.code === "P2025") {
				throw this.fastify.httpErrors.notFound("The friendship does not exist");
			}
			throw error;
		}
	}
}