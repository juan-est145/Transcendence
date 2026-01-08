import { FastifyInstance } from "fastify";
import { EnableTwoFactorBody, VerifyTwoFactorBody, DisableTwoFactorBody, VerifyLoginTwoFactorBody } from "./2fa.type";
import { TwoFactorService } from "./2fa.service";
import { AuthService } from "../auth/auth.service";
import { ZodError } from "zod";

/**
 * This module deals with everything relating to the 2FA (Two Factor Authentication) pages.
 */
export async function twoFactor(fastify: FastifyInstance) {

	const twoFactorService = new TwoFactorService(fastify);
	const authService = new AuthService(fastify);

	/**
	 * This route sends to the client the 2FA configuration page. In case the user is not logged in,
	 * it redirects to login.
	 * @param req - The fastify request instance.
	 * @param res - The fastify response instance.
	 * @returns The 2FA configuration page.
	 */
	fastify.get("/", async (req, res) => {
		if (!req.session.jwt)
			return res.redirect("/auth/login");
		
		try {
			const userPayload = fastify.jwt.decode(req.session.jwt) as any;
			const status = await twoFactorService.getStatus();
			return res.view("/2fa.ejs", { 
				twoFactorEnabled: status.enabled,
				user: userPayload
			});
		} catch (error) {
			return res.view("/2fa.ejs", { 
				twoFactorEnabled: false,
				errors: ["Error loading 2FA status"],
				user: null
			});
		}
	});

	/**
	 * This route shows the 2FA verification page during login process.
	 * @param req - The fastify request instance.
	 * @param res - The fastify response instance.
	 * @returns The 2FA verification page.
	 */
	fastify.get("/verify", async (req, res) => {
		const hasNormalLogin = req.session.requires2FA && req.session.tempToken;
		const hasOAuthLogin = req.session.pending2FAUserId && req.session.isOauth;
		if (!hasNormalLogin && !hasOAuthLogin) {
			return res.redirect("/auth/login");
		}
		return res.view("/2fa-verify.ejs", {
			user: null,
		});
	});

	/**
	 * This route handles 2FA verification during login process.
	 * @param req - The fastify request instance.
	 * @param res - The fastify response instance.
	 * @returns Redirect to account page or back to verification with errors.
	 */
	fastify.post<{ Body: VerifyTwoFactorBody }>("/verify-login", async (req, res) => {
		try {
			const hasNormalLogin = req.session.requires2FA && req.session.tempToken;
			const hasOAuthLogin = req.session.pending2FAUserId && req.session.isOauth;
			
			if (!hasNormalLogin && !hasOAuthLogin) {
				return res.redirect("/auth/login");
			}
			twoFactorService.validateVerifyTwoFactorBody(req.body);
			if (hasOAuthLogin) {
				const response = await fastify.apiClient.POST("/v1/2fa/verify", {
					body: {
						token: req.body.token,
						userId: req.session.pending2FAUserId
					} as any,
				});
				if (response.error || !response.data) {
					return res.status(401).view("/2fa-verify.ejs", {
						errors: ["Invalid 2FA code"],
						user: null
					});
				}
				const authData = response.data as any;

				delete req.session.pending2FAUserId;
				delete req.session.isOauth;

				// Create session with JWT tokens
				authService.createSession(req.session, { 
					jwt: authData.jwt, 
					refreshJwt: authData.refreshJwt,
					user: authData.user
				});
				return res.redirect("/account");
			}

			const verifyLoginBody: VerifyLoginTwoFactorBody = {
				code: req.body.token,
				tempToken: req.session.tempToken!
			};
			twoFactorService.validateVerifyLoginTwoFactorBody(verifyLoginBody);
			const loginResult = await twoFactorService.postVerifyLogin(verifyLoginBody);
			delete req.session.requires2FA;
			delete req.session.tempToken;
			fastify.jwt.verify(loginResult.jwt);
			authService.createSession(req.session, loginResult);
			return res.redirect("/account");
		} catch (error) {
			if (error instanceof ZodError) {
				return res.status(400).view("/2fa-verify.ejs", {
					errors: error.issues.map((element) => element.message),
					user: null
				});
			} else {
				const errorMessage = typeof error === 'object' && error !== null && 'error' in error 
					? (error as any).error 
					: "Error verifying 2FA token";
				return res.status(401).view("/2fa-verify.ejs", {
					errors: [errorMessage],
					user: null
				});
			}
		}
	});

	/**
	 * This route generates a new 2FA secret and QR code.
	 * @param req - The fastify request instance.
	 * @param res - The fastify response instance.
	 * @returns JSON with the secret and QR code or error.
	 */
	fastify.post("/generate", async (req, res) => {
		try {
			if (!req.session.jwt) {
				return res.status(401).send({ error: "Not authenticated" });
			}
			const result = await twoFactorService.postGenerate();
			return res.send(result);
		} catch (error) {
			const errorMessage = typeof error === 'object' && error !== null && 'error' in error 
				? (error as any).error 
				: "Error generating secret";
			return res.status(500).send({
				error: errorMessage
			});
		}
	});

	/**
	 * This route enables 2FA if the secret and token are valid. If they aren't it sends
	 * back the 2FA page with a message explaining the errors.
	 * @param req - The fastify request instance. It must have a body property according to the
	 * zod enableTwoFactorBody schema.
	 * @param res - The fastify response instance.
	 * @returns A redirection to the 2FA page with success or error message.
	 */
	fastify.post<{ Body: EnableTwoFactorBody }>("/enable", async (req, res) => {
		try {
			if (!req.session.jwt)
				return res.redirect("/auth/login");
			const userPayload = fastify.jwt.decode(req.session.jwt) as any;
			twoFactorService.validateEnableTwoFactorBody(req.body);
			await twoFactorService.postEnable(req.body);
			return res.view("/2fa.ejs", { 
				twoFactorEnabled: true,
				success: ["2FA has been enabled successfully"],
				user: userPayload
			});
		} catch (error) {
			let userPayload = null;
			if (req.session.jwt) {
				try {
					userPayload = fastify.jwt.decode(req.session.jwt) as any;
				} catch {
					userPayload = null;
				}
			}
			if (error instanceof ZodError) {
				return res.status(400).view("/2fa.ejs", { 
					errors: error.issues.map((element) => element.message),
					twoFactorEnabled: false,
					user: userPayload
				});
			} else {
				const errorMessage = typeof error === 'object' && error !== null && 'error' in error 
					? (error as any).error 
					: "Error enabling 2FA";
				return res.status(401).view("/2fa.ejs", { 
					errors: [errorMessage],
					twoFactorEnabled: false,
					user: userPayload
				});
			}
		}
	});

	/**
	 * This route verifies a 2FA token.
	 * @param req - The fastify request instance. It must have a body property according to the
	 * zod verifyTwoFactorBody schema.
	 * @param res - The fastify response instance.
	 * @returns JSON with verification result.
	 */
	fastify.post<{ Body: VerifyTwoFactorBody }>("/verify", async (req, res) => {
		try {
			if (!req.session.jwt)
				return res.status(401).send({ error: "Not authenticated" });
			
			twoFactorService.validateVerifyTwoFactorBody(req.body);
			const result = await twoFactorService.postVerify(req.body);
			return res.send(result);
		} catch (error) {
			if (error instanceof ZodError) {
				return res.status(400).send({ 
					error: error.issues.map((element) => element.message).join(', ')
				});
			} else {
				const errorMessage = typeof error === 'object' && error !== null && 'error' in error 
					? (error as any).error 
					: "Error verifying token";
				
				return res.status(401).send({ 
					error: errorMessage
				});
			}
		}
	});

	/**
	 * This route disables 2FA if the password is valid. If it isn't it sends
	 * back the 2FA page with a message explaining the errors.
	 * @param req - The fastify request instance. It must have a body property according to the
	 * zod disableTwoFactorBody schema.
	 * @param res - The fastify response instance.
	 * @returns A redirection to the 2FA page with success or error message.
	 */
	fastify.post<{ Body: DisableTwoFactorBody }>("/disable", async (req, res) => {
		try {
			if (!req.session.jwt)
				return res.redirect("/auth/login");
			const userPayload = fastify.jwt.decode(req.session.jwt) as any;
			twoFactorService.validateDisableTwoFactorBody(req.body);
			await twoFactorService.postDisable(req.body);
			return res.view("/2fa.ejs", { 
				twoFactorEnabled: false,
				success: ["2FA has been disabled successfully"],
				user: userPayload
			});
		} catch (error) {
			let userPayload = null;
			if (req.session.jwt) {
				try {
					userPayload = fastify.jwt.decode(req.session.jwt) as any;
				} catch {
					userPayload = null;
				}
			}
			if (error instanceof ZodError) {
				return res.status(400).view("/2fa.ejs", { 
					errors: error.issues.map((element) => element.message),
					twoFactorEnabled: true,
					user: userPayload
				});
			} else {
				const errorMessage = typeof error === 'object' && error !== null && 'error' in error 
					? (error as any).error 
					: "Error disabling 2FA";
				
				return res.status(401).view("/2fa.ejs", { 
					errors: [errorMessage],
					twoFactorEnabled: true,
					user: userPayload
				});
			}
		}
	});
}