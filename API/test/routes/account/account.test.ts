import { build } from "../../helper";
import { getAccount } from "../../../src/routes/v1/root/account/account.service";
import { GetAccntQuery } from "../../../src/routes/v1/root/account/account.type";

const app = build();

beforeAll(() => {
	jest.spyOn(console, 'error').mockImplementation(() => { });
});

afterAll(() => {
	jest.spyOn(console, 'error').mockRestore();
});

describe("Account service", () => {
	it("Add tournament results", async () => {
		const query: GetAccntQuery = {
			username: "Test",
			email: "test@something",
			profile: {
				id: 1,
				createdAt: new Date(),
				updatedAt: new Date(),
				avatar: "xd",
				online: true,
				tournaments: [
					{ rank: 1 },
					{ rank: 4 },
					{ rank: 3 },
					{ rank: 1 },
					{ rank: 2 },
				]
			}

		};
		jest.spyOn(app.prisma.users, "findUnique").mockResolvedValue(query as any);

		const result = await getAccount(app, { username: "test", email: "test@email.com" });

		
		expect(result.profile.victories).toBe(2);
		expect(result.profile.defeats).toBe(3);

		jest.spyOn(app.prisma.users, "findUnique").mockRestore();
	});
});

describe("Account controller", () => {
	it("Get an account without credentials", async () => {
		const result = await app.inject({
			url: "/v1/account",
			method: "GET",
		});

		expect(result.statusCode).toBe(400);
	});
});