import { type Static } from "@sinclair/typebox";
import { accountRes, accountPostAvatarBody} from "./account.dto";

export type AccountRes = Static<typeof accountRes>;
export type AccountPostAvatarBody = Static<typeof accountPostAvatarBody>;

export interface GetAccntQuery {
	username: string;
	email: string;
	profile: {
		tournaments: { rank: number }[];
		id: number;
		createdAt: Date;
		updatedAt: Date;
		online: boolean;
	} | null;
};