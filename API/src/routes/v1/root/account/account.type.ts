import { type Static } from "@sinclair/typebox";
import { accountError } from "./account.dto";

export type AccountError = Static <typeof accountError>;