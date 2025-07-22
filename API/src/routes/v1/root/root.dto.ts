import { Type } from '@sinclair/typebox';

const Res = Type.Object({
	msg: Type.String()
});

const Req = Type.Object({
	number: Type.Number({ maximum: 10 })
});

export { Res, Req };