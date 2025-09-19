import { build } from "../../helper";
import { AccountService } from "../../../src/routes/v1/root/account/account.service";
import { AuthService } from "../../../src/routes/v1/root/auth/auth.service";
import { AccountPostAvatarBody, GetAccntQuery } from "../../../src/routes/v1/root/account/account.type";
import { Avatar } from "@prisma/client";

const app = build();

beforeAll(() => {
	jest.spyOn(console, 'error').mockImplementation(() => { });
});

afterAll(() => {
	jest.spyOn(console, 'error').mockRestore();
});

describe("Account service", () => {
	const accountService = new AccountService(app, new AuthService(app));

	it("Add tournament results", async () => {
		const query: GetAccntQuery = {
			username: "Test",
			email: "test@something",
			profile: {
				id: 1,
				createdAt: new Date(),
				updatedAt: new Date(),
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
		jest.spyOn(app.prisma.users, "findUniqueOrThrow").mockResolvedValue(query as any);

		const result = await accountService.getAccount({ username: "test", email: "test@email.com" });


		expect(result.profile.victories).toBe(2);
		expect(result.profile.defeats).toBe(3);

		jest.spyOn(app.prisma.users, "findUnique").mockRestore();
	});

	it("Find the avatar", async () => {
		const result: Avatar = {
			id: 1,
			name: "xd.png",
			contentType: "image/png",
		};
		jest.spyOn(app.prisma.avatar, "findFirstOrThrow").mockResolvedValue(result) as any;

		const res = await accountService.getAvatar({ username: "Someone", email: "someone@gmail.com" });

		expect(res).toBe(result);

		jest.spyOn(app.prisma.avatar, "findFirstOrThrow").mockRestore();
	});

	it("Update the avatar", async () => {
		const avatar: AccountPostAvatarBody = {
			name: "test.png",
			contentType: "image/png"
		};

		const anwser = {
			id: 1,
			name: avatar.name,
			contentType: avatar.contentType,
		};

		jest.spyOn(AuthService.prototype, "getUser").mockResolvedValue({
			id: 1,
			username: "Someone",
			email: "someone@gmail.com",
			password: "secret",
			profile: {
				id: 1,
				createdAt: new Date(),
				updatedAt: new Date(),
				online: true,
			}

		}) as any;

		jest.spyOn(app.prisma.avatar, "update").mockResolvedValue(anwser);

		const res = await accountService.updateAvatar("something@gmail.com", { name: "test.png", contentType: "image/png" });
		expect(res).toBe(anwser);

		jest.spyOn(AuthService.prototype, "getUser").mockRestore();
		jest.spyOn(app.prisma.avatar, "update").mockRestore();
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