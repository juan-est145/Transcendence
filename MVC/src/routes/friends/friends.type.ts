import type { paths } from "../../../schema/api-schema";

export type AddFriendsError = paths["/v1/account/friends/{username}"]["post"]["responses"]["404"]["content"]["application/json"];