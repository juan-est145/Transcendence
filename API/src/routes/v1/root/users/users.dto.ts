import { Type } from '@sinclair/typebox';

export const SearchUsersQuery = Type.Object({
	q: Type.String({ 
		minLength: 2, 
		maxLength: 50,
		description: 'Search query for username'
	})
});

export const GetUserParams = Type.Object({
	username: Type.String({
		minLength: 1,
		maxLength: 50,
		pattern: '^[a-zA-Z0-9_-]+$',
		description: 'Username'
	})
});

export const SearchUsersResponse = Type.Array(
	Type.Object({
		id: Type.Number(),
		username: Type.String(),
		email: Type.String(),
		avatar: Type.Union([Type.String(), Type.Null()]),
		createdAt: Type.String()
	})
);

export const GetUserResponse = Type.Object({
	id: Type.Number(),
	username: Type.String(),
	email: Type.String(),
	avatar: Type.Union([Type.String(), Type.Null()]),
	createdAt: Type.String(),
	gamesPlayed: Type.Number(),
	wins: Type.Number(),
	losses: Type.Number()
});