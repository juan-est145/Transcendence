import { build } from "../../helper";
import * as authService from "../../../src/routes/auth/auth.service";

const app = build();

describe("Login tests", () => {
	beforeAll(() => {
		jest.spyOn(app.jwt, "verify").mockReturnValue();
		jest.spyOn(authService, "createSession").mockImplementation(() => { });
		jest.spyOn(authService, "postLogin").mockResolvedValue({ jwt: "xd", refreshJwt: "xd" });
	});

	afterAll(() => {
		jest.spyOn(app.jwt, "verify").mockRestore();
		jest.spyOn(authService, "createSession").mockRestore();
		jest.spyOn(authService, "postLogin").mockRestore();
	});

	it("Get log-in page", async () => {
		const res = await app.inject({
			url: "/auth/login",
			method: "GET",
		});
		expect(res.statusCode).toEqual(200);
	});

	it("After log in, we get account page", async () => {
		const res = await app.inject({
			url: "/auth/login",
			method: "POST",
			headers: {
				"content-type": "application/x-www-form-urlencoded",
			},
			body: "email=something@example.com&password=prueba",
		});
		expect(res.headers.location).toBe("/account");
	});

	it("Get an error with invalid credentials", async () => {
		const res = await app.inject({
			url: "/auth/login",
			method: "POST",
			headers: {
				"content-type": "application/x-www-form-urlencoded",
			},
			body: "",
		});
		expect(res.statusCode).toBe(400);
	});
});

