import { build } from "../../helper";

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

