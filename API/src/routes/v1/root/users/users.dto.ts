import { Type } from '@sinclair/typebox';
import { accountPostAvatarRes } from '../account/account.dto';

export const searchUsersQuery = Type.Object({
	q: Type.String({ 
		minLength: 2, 
		maxLength: 50,
		description: 'Search query for username'
	})
});

export const getUserParams = Type.Object({
	username: Type.String({
		minLength: 1,
		maxLength: 50,
		pattern: '^[a-zA-Z0-9_-]+$',
		description: 'Username'
	})
});

export const searchUsersResponse = Type.Array(
	Type.Object({
		id: Type.Number(),
		username: Type.String(),
		email: Type.String(),
		avatar: accountPostAvatarRes,
		createdAt: Type.String()
	})
);

export const getUserResponse = Type.Object({
	id: Type.Number(),
	username: Type.String(),
	email: Type.String(),
	avatar: accountPostAvatarRes,
	createdAt: Type.String(),
	gamesPlayed: Type.Number(),
	wins: Type.Number(),
	losses: Type.Number(),
});