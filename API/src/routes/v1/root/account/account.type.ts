import { type Static } from "@sinclair/typebox";
import { accountRes, accountPostAvatarBody, accountGetAvatarParam, getRelationRes, friendShipStatusBody, putOnlineBody } from "./account.dto";
import { $Enums } from "@prisma/client";

export type AccountRes = Static<typeof accountRes>;
export type AccountPostAvatarBody = Static<typeof accountPostAvatarBody>;
export type AccountGetAvatarParam = Static<typeof accountGetAvatarParam>;

export interface GetAccntQuery {
	username: string;
	email: string;
	profile: {
		tournaments: { rank: number }[];
		id: number;
		createdAt: Date;
		updatedAt: Date;
		online: boolean;
	} | null;
};

export interface FriendWithProfiles {
	user1: {
		id: number;
		createdAt: Date;
		updatedAt: Date;
		online: boolean;
		user: {
			username: string;
		};
	};
	user2: {
		id: number;
		createdAt: Date;
		updatedAt: Date;
		online: boolean;
		user: {
			username: string;
		};
	};
	status: $Enums.Friendship;
	user1Id: number;
	user2Id: number;
};

export type FriendRelation = Static<typeof getRelationRes>;
export type FriendShipStatusBody = Static<typeof friendShipStatusBody>;
export type SetOnlineBody = Static<typeof putOnlineBody>;