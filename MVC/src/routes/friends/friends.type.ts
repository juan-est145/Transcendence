import type { paths } from "../../../schema/api-schema";
import z from "zod";
import { relationShipBody } from "./friends.dto";

export type AddFriendsError = paths["/v1/account/friends/{username}"]["post"]["responses"]["404"]["content"]["application/json"];
export type RelationShipBody = z.infer<typeof relationShipBody>;