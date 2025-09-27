import { Type } from '@sinclair/typebox';
import { username, email } from '../auth/auth.dto';

export const accountRes = Type.Object({
	username,
	email,
	profile: Type.Object({
		id: Type.Number(),
		createdAt: Type.String({ format: "date-time" }),
		updatedAt: Type.String({ format: "date-time" }),
		online: Type.Boolean(),
		victories: Type.Number(),
		defeats: Type.Number(),
	}),
});

export const accountAvatarRes = Type.Object({
	id: Type.Number(),
	name: Type.String(),
	contentType: Type.String(),
});

export const accountPostAvatarBody = Type.Object({
	name: Type.String(),
	contentType: Type.String(),
});

export const accountPostAvatarRes = Type.Intersect([
	accountPostAvatarBody,
	Type.Object({
		id: Type.Number(),
	}),
]);

export const accountGetAvatarParam = Type.Object({
	username,
});

const status = Type.Enum({
	FIRST_PENDING: "FIRST_PENDING",
	SECOND_PENDING: "SECOND_PENDING",
	FRIENDS: "FRIENDS",
});

const extendedStatus = Type.Enum({
	FIRST_PENDING: "FIRST_PENDING",
	SECOND_PENDING: "SECOND_PENDING",
	FRIENDS: "FRIENDS",
	NOT_FRIENDS: "NOT_FRIENDS",
});

export const makeFriendRes = Type.Object({
	user1Id: Type.Number({ minimum: 0 }),
	user2Id: Type.Number({ minimum: 0 }),
	status,
});

export const getFriendsRes = Type.Array(
	Type.Object({
		id: Type.Number({ minimum: 0 }),
		status,
		profile: Type.Object({
			username,
			id: Type.Number(),
			createdAt: Type.String({ format: "date-time" }),
			updatedAt: Type.String({ format: "date-time" }),
			online: Type.Boolean(),
		}),
	}),
);

export const getRelationRes = Type.Object({
	user1: Type.Object({
		id: Type.Number({ minimum: 0 }),
		username
	}),
	user2: Type.Object({
		id: Type.Number({ minimum: 0 }),
		username
	}),
	status: extendedStatus
});

export const friendShipStatusBody = Type.Object({
	action: Type.Enum({
		ACCEPT: "ACCEPT",
		DELETE: "DELETE",
	}),
});