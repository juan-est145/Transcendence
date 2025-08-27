import { type Static } from "@sinclair/typebox";
import { generalError } from "./root.dto";

export type GeneralError = Static <typeof generalError>;