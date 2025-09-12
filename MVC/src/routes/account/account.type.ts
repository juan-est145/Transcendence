import z from "zod";
import { avatarUsernameParam } from "./account.dto";

export type AvatarUsernameParam = z.infer<typeof avatarUsernameParam>;