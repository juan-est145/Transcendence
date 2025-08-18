import { strictEqual } from "assert";
import { describe } from "node:test";
import { it } from "node:test";
import { build } from "../../helper";

describe("Login tests", () => {
	it("Get log-in page", async(t) => {
		const app = await build(t);

		const res = await app.inject({
			url: "/auth/login",
			method: "GET",
		});
		strictEqual(res.statusCode, 200, "Returns a value of 200");
	});
});