import { build } from "../../helper";
import { test } from "node:test";
import { strictEqual } from "assert";

test("Login route", async (t) => {
	const app = await build(t);

	const res = await app.inject({
		url: "/v1/auth/log-in",
		method: "POST",
		headers: {
			"content-type": "application/json"
		},
		body: {
			email: "user@example.com",
			password: "test"
		}
	});
	strictEqual(res.statusCode, 401, "Returns a value of 401");
});