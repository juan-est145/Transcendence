import { authenticator } from "otplib";
import { toDataURL } from "qrcode";
import { PrismaClient } from "@prisma/client";

export class TwoFactorService {
	private prisma: PrismaClient;

	constructor(prismaClient: PrismaClient) {
		this.prisma = prismaClient;
	}

	// Generate a new 2FA secret and QR code for the user
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

	// Verify TOTP code provided by the user
	verifyToken(secret: string, token: string): boolean {
		try {
			return authenticator.verify({ token, secret });
		} catch (error) {
			return false;
		}
	}

	// Enable 2FA for the user
	async enable2FA(userId: number, secret: string, token: string) {
		console.log('=== 2FA SERVICE ENABLE ===');
        console.log('userId:', userId);
        console.log('secret:', secret);
        console.log('token:', token);
        console.log('userId type:', typeof userId);
        console.log('userId is undefined?:', userId === undefined);
		// Verify the provided token before enabling 2FA
		if (!this.verifyToken(secret, token)) {
			throw new Error('Invalid token');
		}

	 	console.log('Token verified successfully');
        console.log('About to update user with id:', userId);

		await this.prisma.users.update({
			where: { id: userId },
			data: {
				twoFactorEnabled: true,
				twoFactorSecret: secret
			}
		});

		return { success: true };
	}

	// Disable 2FA for the user
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

	// Check if 2FA is enabled for the user
	async is2FAEnabled(userId: number): Promise<boolean> {
		const user = await this.prisma.users.findUnique({
			where: { id: userId },
			select: { twoFactorEnabled: true }
		});

		return user?.twoFactorEnabled ?? false;
	}
}