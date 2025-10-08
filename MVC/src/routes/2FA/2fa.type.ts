import type { paths } from "../../../schema/api-schema";

export type GenerateSecretResponse = paths["/v1/2fa/generate"]["post"]["responses"]["200"]["content"]["application/json"];
export type GenerateSecretError = paths["/v1/2fa/generate"]["post"]["responses"]["401"]["content"]["application/json"];

export type EnableTwoFactorBody = paths["/v1/2fa/enable"]["post"]["requestBody"]["content"]["application/json"];
export type EnableTwoFactorError = paths["/v1/2fa/enable"]["post"]["responses"]["401"]["content"]["application/json"];

export type VerifyTwoFactorBody = paths["/v1/2fa/verify"]["post"]["requestBody"]["content"]["application/json"];
export type VerifyTwoFactorError = paths["/v1/2fa/verify"]["post"]["responses"]["401"]["content"]["application/json"];

export type DisableTwoFactorBody = paths["/v1/2fa/disable"]["post"]["requestBody"]["content"]["application/json"];
export type DisableTwoFactorError = paths["/v1/2fa/disable"]["post"]["responses"]["401"]["content"]["application/json"];

export type TwoFactorStatusResponse = paths["/v1/2fa/status"]["get"]["responses"]["200"]["content"]["application/json"];

export type VerifyLoginTwoFactorBody = paths["/v1/auth/verify-2fa"]["post"]["requestBody"]["content"]["application/json"];
export type VerifyLoginTwoFactorResponse = paths["/v1/auth/verify-2fa"]["post"]["responses"]["201"]["content"]["application/json"];
export type VerifyLoginTwoFactorError = paths["/v1/auth/verify-2fa"]["post"]["responses"]["401"]["content"]["application/json"];