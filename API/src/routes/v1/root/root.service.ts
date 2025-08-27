import { HttpError, HttpMap } from "../v1.dto";
import { GeneralError } from "./root.type";

export function getErrorHttpValues(error: GeneralError, number: number) {
	if (!HttpMap.get(number)) {
		error.statusCode = 500;
		error.httpError = HttpError.INTERNAL_SERVER_ERROR;
		delete error.details;
	} else {
		error.statusCode = number
		error.httpError = HttpMap.get(number)!;
	}
}

export function getErrorDetails(error: GeneralError) {
	let message = "";
	error.details?.forEach((value) => {
		message += `- Error in field ${value.field}: ${value.msg}\n`
	});
	return message;
}