import { type Static } from "@sinclair/typebox";
import { accountRes } from "./account.dto";

export type AccountRes = Static<typeof accountRes>;