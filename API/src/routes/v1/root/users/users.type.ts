import { type Static } from "@sinclair/typebox";
import { getUserParams, getUserResponse, searchUsersQuery, searchUsersResponse } from "./users.dto";


export type SearchUsersQuery = Static<typeof searchUsersQuery>;
export type GetUserParams = Static<typeof getUserParams>;
export type SearchUsersResponse = Static<typeof searchUsersResponse>
export type GetUserResponse = Static<typeof getUserResponse>;