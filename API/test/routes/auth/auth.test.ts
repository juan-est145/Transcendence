import { build } from "../../helper";
import * as authService from "../../../src/routes/v1/root/auth/auth.service";

const app = build();

describe("Login tests", () => {
	it("Incorrect credentials", async () => {
		const errorSpy = jest.spyOn(console, 'error').mockImplementation(() => { });
		const res = await app.inject({
			url: "/v1/auth/log-in",
			method: "POST",
			headers: {
				"content-type": "application/json",
			},
			body: {
				email: "user@example.com",
				password: "test",
			}
		});
		expect(res.statusCode).toEqual(401);
		errorSpy.mockRestore();
	});

	it("Correct credentials", async () => {
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
		expect(res.statusCode).toEqual(201);
	});

	it("Invalid fields", async () => {
		const errorSpy = jest.spyOn(console, 'error').mockImplementation(() => { });
		const res = await app.inject({
			url: "/v1/auth/log-in",
			method: "POST",
			headers: {
				"content-type": "application/json"
			},
			body: {}
		});
		expect(res.statusCode).toEqual(400);
		errorSpy.mockRestore();
	});
});


describe("Sign-in tests", () => {
	it("Successful sign up", async () => {
		const values = {
			username: "johndoe",
			email: "johndoe@nobody.com",
			password: "secret",
		}

		const mockUser: { username: string, email: string } = {
			username: values.username,
			email: values.email,
		};

		const spy = jest.spyOn(authService, "createUser").mockResolvedValue(mockUser as any);
		const res = await app.inject({
			url: "/v1/auth/sign-in",
			method: "POST",
			headers: {
				"content-type": "application/json"
			},
			body: {
				username: values.username,
				password: values.password,
				email: values.email,
			}
		});

		expect(res.statusCode).toBe(201);
		expect(JSON.parse(res.body)).toEqual(mockUser);
		spy.mockRestore();
	});
});