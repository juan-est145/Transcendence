import { build } from "../../helper";
import { it, describe } from "node:test";
import { strictEqual } from "assert";

describe("Login tests", () => {
	it("Incorrect credentials", async (t) => {
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

	it("Correct credentials", async(t) => {
		const app = await build(t);

		const res = await app.inject({
			url: "/v1/auth/log-in",
			method: "POST",
			headers: {
				"content-type": "application/json"
			},
			body: {
				email: "user@example.com",
				password: process.env.TEST_USER_PASSWD!
			}
		});
		strictEqual(res.statusCode, 201, "Returns a value of 201");
	});

	it("Invalid fields", async (t) => {
		const app = await build(t);

		const res = await app.inject({
			url: "/v1/auth/log-in",
			method: "POST",
			headers: {
				"content-type": "application/json"
			},
			body: {}
		});
		strictEqual(res.statusCode, 400, "Returns a value of 400");
	});
});

