import type { paths } from "../../../schema/api-schema";

export type SearchUsersQuery = paths["/v1/users/search"]["get"]["parameters"]["query"];
export type SearchUserRes = paths["/v1/users/search"]["get"]["responses"]["200"]["content"]["application/json"];
export type SearchProfileParams = paths["/v1/users/{username}"]["get"]["parameters"]["path"];
export type SearchProfileRes = paths["/v1/users/{username}"]["get"]["responses"]["200"]["content"]["application/json"];
export type SearchProfileError = paths["/v1/users/{username}"]["get"]["responses"]["400"]["content"]["application/json"];