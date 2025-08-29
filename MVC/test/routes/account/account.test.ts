import { build } from "../../helper";
import * as accountService from "../../../src/routes/account/account.service";

const app = build();

describe("Account page", () => {
	beforeAll(() => {
		jest.spyOn(accountService, "getProfileInfo").mockResolvedValue({
			username: "Somebody",
			email: "somebody@email.com",
			profile: {
				id: 1,
				createdAt: new Date().toISOString(),
				updatedAt: new Date().toISOString(),
				avatar: "xd",
				online: true,
				victories: 20,
				defeats: 10
			}
		});
	});

	afterAll(() => {
		jest.spyOn(accountService, "getProfileInfo").mockRestore();
	});

	it("Render account page", async () => {
		const res = await app.inject({
			url: "/account",
			method: "GET"
		});
		expect(res.statusCode).toBe(401);
	});
});