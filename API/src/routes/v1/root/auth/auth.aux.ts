import { HttpError, HttpMap } from "../../v1.dto";
import { AuthError } from "./auth.type";

export function getErrorHttpValues(error: AuthError, number: number) {
	if (!HttpMap.get(number)) {
		error.statusCode = 500;
		error.httpError = HttpError.INTERNAL_SERVER_ERROR;
		delete error.details;
	} else {
		error.statusCode = number
		error.httpError = HttpMap.get(number)!;
	}
}