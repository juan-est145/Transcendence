import { logInBody, signInBody, authError, jwtPayload } from "./auth.dto";
import { type Static } from "@sinclair/typebox";

export type AuthError = Static <typeof authError>;
export type SignInBody = Static <typeof signInBody>;
export type LogInBody = Static <typeof logInBody>;
export type JwtPayload = Static <typeof jwtPayload>;