export interface SearchUsersResponse {
	id: number;
	username: string;
	email: string;
	avatar: string | null;
	createdAt: string;
}

export interface GetUserResponse {
	id: number;
	username: string;
	email: string;
	avatar: string | null;
	createdAt: string;
	gamesPlayed: number;
	wins: number;
	losses: number;
}