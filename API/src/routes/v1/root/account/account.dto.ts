import { Type } from '@sinclair/typebox';
import { username, email } from '../auth/auth.dto';

export const accountRes = Type.Object({
	username,
	email,
	profile: Type.Object({
		id: Type.Number(),
		createdAt: Type.String({ format: "date-time" }),
		updatedAt: Type.String({ format: "date-time" }),
		online: Type.Boolean(),
		victories: Type.Number(),
		defeats: Type.Number(),
	}),
});