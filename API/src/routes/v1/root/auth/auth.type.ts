import { signInError } from "./auth.dto";
import { type Static } from "@sinclair/typebox";

export type SignInError = Static <typeof signInError>;