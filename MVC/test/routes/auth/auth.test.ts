import { build } from "../../helper";
import * as authService from "../../../src/routes/auth/auth.service";
import { SigInError } from "../../../src/routes/auth/auth.type";

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

	it("API broke and can't log in", async () => {
		jest.spyOn(authService, "postLogin").mockImplementationOnce(() => {
			const error: SigInError = {
				statusCode: 500,
				httpError: "Internal server error",
				details: [{
					msg: ["Internal server error"],
				}]
			}
			throw error;
		});

		const res = await app.inject({
			url: "/auth/login",
			method: "POST",
			headers: {
				"content-type": "application/x-www-form-urlencoded",
			},
			body: "email=something@example.com&password=prueba",
		});

		expect(res.statusCode).toBe(500);
	});

	it("Log out redirects always to log-out page", async () => {
		const res = await app.inject({
			url: "/auth/log-out",
			method: "GET",
		});

		expect(res.headers.location).toBe("/");
	});
});

describe("Sign in tests", () => {
	beforeAll(() => {
		jest.spyOn(authService, "postSignIn").mockResolvedValue({ username: "xd", email: "xd" });
	});

	afterAll(() => {
		jest.spyOn(authService, "postSignIn").mockRestore();
	})

	it("Get sign-in page", async () => {
		const res = await app.inject({
			url: "/auth/sign-in",
			method: "GET",
		});
		expect(res.statusCode).toBe(200);
	});

	it("Manage to sign-in", async () => {
		const res = await app.inject({
			url: "/auth/sign-in",
			method: "POST",
			headers: {
				"content-type": "application/x-www-form-urlencoded",
			},
			body: "username=something&email=something@example.com&password=prueba&repeatPasswd=prueba",
		});
		expect(res.statusCode).toBe(201);
	});

	it("Sign in failure from API", async () => {
		jest.spyOn(authService, "postSignIn").mockImplementationOnce(() => {
			const error: SigInError = {
				statusCode: 409,
				httpError: "Conflict",
				details: [{
					msg: ["Username or email already exists"],
				}]
			}
			throw error;
		});

		const res = await app.inject({
			url: "/auth/sign-in",
			method: "POST",
			headers: {
				"content-type": "application/x-www-form-urlencoded",
			},
			body: "username=something&email=something@example.com&password=prueba&repeatPasswd=prueba",
		});

		expect(res.statusCode).toBe(409);
	});
});