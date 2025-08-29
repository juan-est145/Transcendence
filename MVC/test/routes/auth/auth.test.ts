import { build } from "../../helper";

const app = build();

describe("Login tests", () => {
	it("Get log-in page", async () => {
		const res = await app.inject({
			url: "/auth/login",
			method: "GET",
		});
		expect(res.statusCode).toEqual(200);
	});
});