import type { paths } from "../../../schema/api-schema";

export type LogInBody = paths["/v1/auth/log-in"]["post"]["requestBody"]["content"]["application/json"];
export type LogInError = paths["/v1/auth/log-in"]["post"]["responses"]["400"]["content"]["application/json"];
export type JwtBody = paths["/v1/auth/log-in"]["post"]["responses"]["201"]["content"]["application/json"];
export type SignInBody = paths["/v1/auth/sign-in"]["post"]["requestBody"]["content"]["application/json"] & { repeatPasswd: string };
export type SigInError = paths["/v1/auth/sign-in"]["post"]["responses"]["400"]["content"]["application/json"];