import { logInBody, signInBody, jwtPayload, verify2FALoginBody } from "./auth.dto";
import { type Static } from "@sinclair/typebox";

export type SignInBody = Static <typeof signInBody>;
export type LogInBody = Static <typeof logInBody>;
export type JwtPayload = Static <typeof jwtPayload>;
export type Verify2FALoginBody = Static<typeof verify2FALoginBody>;