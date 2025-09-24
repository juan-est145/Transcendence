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

export const makeFriendRes = Type.Object({
	user1Id: Type.Number({ minimum: 0 }),
	user2Id: Type.Number({ minimum: 0 }),
	status: Type.Enum({
		FIRST_PENDING: "FIRST_PENDING",
		SECOND_PENDING: "SECOND_PENDING",
	}),
})