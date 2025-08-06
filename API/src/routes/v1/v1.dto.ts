import { Type } from "@sinclair/typebox";

/**
 * This file contains the base Http exception for all other exceptions to inherit from.
 * 
 * @remarks
 * The baseHttpError object uses typebox for validating and creating typescript types of new http errors and provide a consistent
 * interface.
 * 
 * ```ts
 * const baseHttpError = Type.Object({
	statusCode: Type.Number({ minimum: 400, exclusiveMaximum: 600 }),
	httpError: Type.Enum(HttpError),
});
 * ```
 */

export enum HttpError {
	BAD_REQUEST = "Bad request",
	UNAUTHORIZED = "Unauthorized",
	FORBIDDEN = "Forbidden",
	NOT_FOUND = "Not found",
	METHOD_NOT_ALLOWED = "Method not allowed",
	NOT_ACCEPTABLE = "Not acceptable",
	REQUEST_TIMEOUT = "Request timeout",
	CONFLICT = "Conflict",
	GONE = "Gone",
	PRECONDITION_FAILED = "Precondition failed",
	PAYLOAD_TOO_LARGE = "Payload too large",
	UNSUPPORTED_MEDIA_TYPE = "Unsupported media type",
	I_AM_A_TEAPOT = "I'm a teapot",
	UNPROCESSABLE_ENTITY = "Unprocessable entity",
	INTERNAL_SERVER_ERROR = "Internal server error",
	NOT_IMPLEMENTED = "Not implemented",
	BAD_GATEWAY = "Bad gateway",
	SERVICE_UNAVAILABLE = "Service unavailable",
	GATEWAY_TIMEOUT = "Gateway timeout",
	HTTP_VERSION_NOT_SUPPORTED = "HTTP version not supported",
}

export const baseHttpError = Type.Object({
	statusCode: Type.Number({ minimum: 400, exclusiveMaximum: 600 }),
	httpError: Type.Enum(HttpError),
});

const baseHttpmap = new Map<number, HttpError>([
	[400, HttpError.BAD_REQUEST],
	[401, HttpError.UNAUTHORIZED],
	[403, HttpError.FORBIDDEN],
	[404, HttpError.NOT_FOUND],
	[405, HttpError.METHOD_NOT_ALLOWED],
	[406, HttpError.NOT_ACCEPTABLE],
	[408, HttpError.REQUEST_TIMEOUT],
	[409, HttpError.CONFLICT],
	[410, HttpError.GONE],
	[412, HttpError.PRECONDITION_FAILED],
	[413, HttpError.PAYLOAD_TOO_LARGE],
	[415, HttpError.UNSUPPORTED_MEDIA_TYPE],
	[418, HttpError.I_AM_A_TEAPOT],
	[422, HttpError.UNPROCESSABLE_ENTITY],
	[500, HttpError.INTERNAL_SERVER_ERROR],
	[501, HttpError.NOT_IMPLEMENTED],
	[503, HttpError.SERVICE_UNAVAILABLE],
	[504, HttpError.GATEWAY_TIMEOUT],
	[505, HttpError.HTTP_VERSION_NOT_SUPPORTED],
]);

export const HttpMap: ReadonlyMap<number, HttpError> = baseHttpmap

