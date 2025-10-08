import { FastifyInstance } from "fastify";
import { enableTwoFactorBody, verifyTwoFactorBody, disableTwoFactorBody, verifyLoginTwoFactorBody } from "./2fa.dto";
import { EnableTwoFactorBody, VerifyTwoFactorBody, DisableTwoFactorBody, VerifyLoginTwoFactorBody } from "./2fa.type";

/**
 * This class accepts the following parameters:
 * @param fastify - The current fastify instance.
 */
export class TwoFactorService {
	constructor(private fastify: FastifyInstance) { }

	/**
	 * This function validates that the request body conforms to the zod object enableTwoFactorBody.
	 * If the request body is not valid, it throws a zod error.
	 * @param body - A fastify request body to be evaluated.
	 */
	validateEnableTwoFactorBody(body: unknown) {
		enableTwoFactorBody.parse(body);
	}

	/**
	 * This function validates that the request body conforms to the zod object verifyTwoFactorBody.
	 * If the request body is not valid, it throws a zod error.
	 * @param body - A fastify request body to be evaluated.
	 */
	validateVerifyTwoFactorBody(body: unknown) {
		verifyTwoFactorBody.parse(body);
	}

	/**
	 * This function validates that the request body conforms to the zod object disableTwoFactorBody.
	 * If the request body is not valid, it throws a zod error.
	 * @param body - A fastify request body to be evaluated.
	 */
	validateDisableTwoFactorBody(body: unknown) {
		disableTwoFactorBody.parse(body);
	}

	/**
	 * This function validates that the request body conforms to the zod object verifyLoginTwoFactorBody.
	 * If the request body is not valid, it throws a zod error.
	 * @param body - A fastify request body to be evaluated.
	 */
	validateVerifyLoginTwoFactorBody(body: unknown) {
		verifyLoginTwoFactorBody.parse(body);
	}

	/**
	 * This function sends a request to the REST API to generate a new 2FA secret and QR code.
	 * If the response code is between 400 or 500 it throws an exception.
	 * @returns If successful it returns the secret and QR code.
	 */
	async postGenerate() {
		const { data, error } = await this.fastify.apiClient.POST("/v1/2fa/generate", {
			body: {}
		});
		if (error) {
			throw error;
		}
		return data;
	}

	/**
	 * This function sends the secret and token to the REST API to enable 2FA.
	 * If the response code is between 400 or 500 it throws an exception.
	 * @param body - A fastify request body with secret and token.
	 * @returns If successful it returns confirmation data.
	 */
	async postEnable(body: EnableTwoFactorBody) {
		const { data, error } = await this.fastify.apiClient.POST("/v1/2fa/enable", {
			body
		});
		if (error) {
			throw error;
		}
		return data;
	}

	/**
	 * This function sends the token to the REST API to verify 2FA.
	 * If the response code is between 400 or 500 it throws an exception.
	 * @param body - A fastify request body with token.
	 * @returns If successful it returns verification data.
	 */
	async postVerify(body: VerifyTwoFactorBody) {
		const { data, error } = await this.fastify.apiClient.POST("/v1/2fa/verify", {
			body
		});
		if (error) {
			throw error;
		}
		return data;
	}

	/**
	 * This function sends the tempToken and 2FA token to the REST API to complete login verification.
	 * If the response code is between 400 or 500 it throws an exception.
	 * @param body - A fastify request body with token and tempToken.
	 * @returns If successful it returns the complete JWT tokens.
	 */
	async postVerifyLogin(body: VerifyLoginTwoFactorBody) {
		const { data, error } = await this.fastify.apiClient.POST("/v1/auth/verify-2fa", {
			body
		});
		if (error) {
			throw error;
		}
		return data;
	}

	/**
	 * This function sends the token to the REST API to disable 2FA.
	 * If the response code is between 400 or 500 it throws an exception.
	 * @param body - A fastify request body with token.
	 * @returns If successful it returns confirmation data.
	 */
	async postDisable(body: DisableTwoFactorBody) {
		const { data, error } = await this.fastify.apiClient.POST("/v1/2fa/disable", {
			body
		});
		if (error) {
			throw error;
		}
		return data;
	}

	/**
	 * This function requests the current 2FA status from the REST API.
	 * If the response code is between 400 or 500 it throws an exception.
	 * @returns If successful it returns the 2FA status.
	 */
	async getStatus() {
		const { data, error } = await this.fastify.apiClient.GET("/v1/2fa/status");
		if (error) {
			throw error;
		}
		return data;
	}
}