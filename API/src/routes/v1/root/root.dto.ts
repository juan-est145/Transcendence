import { Type } from '@sinclair/typebox';
import { baseHttpError } from '../v1.dto';

const pingRes = Type.Object({
	msg: Type.String()
});

export const generalError = Type.Intersect([
	baseHttpError,
	Type.Object({
		details: Type.Optional(
			Type.Array(
				Type.Object({
					field: Type.Optional(Type.String()),
					msg: Type.Optional(Type.Array(Type.String())),
				}),
			)
		)
	}
	)
]);

export { pingRes };