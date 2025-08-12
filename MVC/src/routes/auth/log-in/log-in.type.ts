import type { paths } from "../../../../schema/api-schema";

export type LogInBody = paths["/v1/auth/log-in"]["post"]["requestBody"]["content"]["application/json"];
export type LogInError = paths["/v1/auth/log-in"]["post"]["responses"]["400"]["content"]["application/json"]