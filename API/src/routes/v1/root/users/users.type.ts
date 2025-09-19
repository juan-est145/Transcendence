import { type Static } from "@sinclair/typebox";
import { getUserParams, getUserResponse, searchUsersQuery, searchUsersResponse } from "./users.dto";


export type SearchUsersQuery = Static<typeof searchUsersQuery>;
export type GetUserParams = Static<typeof getUserParams>;
export type SearchUsersResponse = Static<typeof searchUsersResponse>

// export interface SearchUsersResponse {
// 	id: number;
// 	username: string;
// 	email: string;
// 	avatar: string | null;
// 	createdAt: string;
// }

export type GetUserResponse = Static<typeof getUserResponse>;

// export interface GetUserResponse {
// 	id: number;
// 	username: string;
// 	email: string;
// 	avatar: string | null;
// 	createdAt: string;
// 	gamesPlayed: number;
// 	wins: number;
// 	losses: number;
// }