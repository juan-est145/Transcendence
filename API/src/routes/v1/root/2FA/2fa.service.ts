import { authenticator } from "otplib";
import { toDataURL } from "qrcode";
import { PrismaClient } from "@prisma/client";
import { EncryptionUtil } from "../../../../utils/encryption.util";

export class TwoFactorService {
	private prisma: PrismaClient;
	constructor(prismaClient: PrismaClient) {
		this.prisma = prismaClient;
	}

	/**
	 * Generate a new 2FA secret and corresponding QR code for the user.
	 * @param userId - The ID of the user.
	 * @param email - The email of the user (used in QR code label).
	 * @returns An object containing the secret and QR code data URL.
	 */
	async generateSecret(userId: number, email: string) {
		const secret = authenticator.generateSecret();
		const appName = 'PongGame';
		// Generate the URI for the QR code
		const otpauthUrl = authenticator.keyuri(email, appName, secret);
		// Convert the URI to a QR code data URL
		const qrCodeDataURL = await toDataURL(otpauthUrl);
		return {
			secret,
			qrCode: qrCodeDataURL
		};
	}

	/**
	 * Verifies a TOTP code against a given secret.
	 * @param secret - The shared secret key.
	 * @param token - The TOTP code to verify.
	 * @returns True if the token is valid, false otherwise.
	*/
	verifyToken(secret: string, token: string): boolean {
		try {
			return authenticator.verify({ token, secret });
		} catch (error) {
			return false;
		}
	}

	/**
	 * Enables 2FA for a user.
	 * @param userId - The ID of the user.
	 * @param secret - The shared secret key.
	 * @param token - The TOTP code provided by the user.
	 * @returns A promise that resolves to an object indicating success or failure.
	 */
	async enable2FA(userId: number, secret: string, token: string) {
		// Verify the provided token before enabling 2FA
		if (!this.verifyToken(secret, token)) {
			throw new Error('Invalid token');
		}
		const encryptedSecret = EncryptionUtil.encrypt(secret);
		await this.prisma.users.update({
			where: { id: userId },
			data: {
				twoFactorEnabled: true,
				twoFactorSecret: encryptedSecret
			}
		});
		return { success: true };
	}

	/**
	 * Disables 2FA for a user.
	 * @param user1Id - The ID of the user.
	 * @returns A promise that resolves to an object indicating success or failure.
	 */
	async disable2FA(user1Id: number) {
		await this.prisma.users.update({
			where: { id: user1Id },
			data: {
				twoFactorEnabled: false,
				twoFactorSecret: null
			}
		});

		return { success: true };
	}

	/**
	 * Checks if 2FA is enabled for a user.
	 * @param userId - The ID of the user.
	 * @returns A promise that resolves to true if 2FA is enabled, false otherwise.
	 */
	async is2FAEnabled(userId: number): Promise<boolean> {
		const user = await this.prisma.users.findUnique({
			where: { id: userId },
			select: { twoFactorEnabled: true }
		});

		return user?.twoFactorEnabled ?? false;
	}
}