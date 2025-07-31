import { Type } from '@sinclair/typebox';

const pingRes = Type.Object({
	msg: Type.String()
});


export { pingRes };