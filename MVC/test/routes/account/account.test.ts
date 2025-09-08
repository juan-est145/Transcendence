import { build } from "../../helper";
import { AccountService } from "../../../src/routes/account/account.service";
import Stream from "node:stream";

const app = build();

describe("Account page", () => {
	const service = new AccountService(app);
	beforeAll(() => {
		jest.spyOn(service, "getProfileInfo").mockResolvedValue({
			username: "Somebody",
			email: "somebody@email.com",
			profile: {
				id: 1,
				createdAt: new Date().toISOString(),
				updatedAt: new Date().toISOString(),
				online: true,
				victories: 20,
				defeats: 10
			}
		});
	});

	afterAll(() => {
		jest.spyOn(service, "getProfileInfo").mockRestore();
	});

	it("Render account page", async () => {
		const res = await app.inject({
			url: "/account",
			method: "GET"
		});
		expect(res.statusCode).toBe(401);
	});
});

describe("Avatar services", () => {
	it("Get profile avatar", async () => {
		const service = new AccountService(app);
		const stream = new Stream.Readable();
		const avatar = {
			id: 1,
			contentType: "image/png",
			name: "prueba.png",
		};

		jest.spyOn(service, "findAvatarName").mockImplementation(() => {
			return Promise.resolve(avatar);
		});

		jest.spyOn(app.minioClient, "getObject").mockResolvedValue(stream);

		const res = await service.getProfileAvatar();
		expect(res).toEqual({ stream, contentType: avatar.contentType });

		jest.spyOn(service, "findAvatarName").mockRestore();
		jest.spyOn(app.minioClient, "getObject").mockRestore();
	});
});