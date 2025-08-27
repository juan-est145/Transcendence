import { logInBody, signInBody, jwtPayload } from "./auth.dto";
import { type Static } from "@sinclair/typebox";

export type SignInBody = Static <typeof signInBody>;
export type LogInBody = Static <typeof logInBody>;
export type JwtPayload = Static <typeof jwtPayload>;