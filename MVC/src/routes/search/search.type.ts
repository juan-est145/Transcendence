import type { paths } from "../../../schema/api-schema";

export type SearchUsersQuery = paths["/v1/users/search"]["get"]["parameters"]["query"];
export type SearchUserRes = paths["/v1/users/search"]["get"]["responses"]["200"]["content"]["application/json"];