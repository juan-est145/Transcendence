import { createCipheriv, createDecipheriv, randomBytes } from 'crypto';

const ALGORITHM = 'aes-256-gcm';
const IV_LENGTH = 16;

export class EncryptionUtil {
	private static getKey(): Buffer {
		const key = process.env.ENCRYPTION_KEY;
		if (!key) {
			throw new Error('ENCRYPTION_KEY environment variable is not set');
		}
		return Buffer.from(key, 'hex');
	}
	static encrypt(text: string): string {
		if (!text) return text;
		const KEY = this.getKey();
		const iv = randomBytes(IV_LENGTH);
		const cipher = createCipheriv(ALGORITHM, KEY, iv);
		let encrypted = cipher.update(text, 'utf8', 'hex');
		encrypted += cipher.final('hex');
		const authTag = cipher.getAuthTag();
		// Format: iv:authTag:encryptedData
		return `${iv.toString('hex')}:${authTag.toString('hex')}:${encrypted}`;
	}
	static decrypt(encryptedText: string): string {
		if (!encryptedText) return encryptedText;
		const parts = encryptedText.split(':');
		if (parts.length !== 3) {
			console.warn('Attempting to decrypt non-encrypted data');
			return encryptedText;
		}
		const KEY = this.getKey();
		const [ivHex, authTagHex, encrypted] = parts;
		const iv = Buffer.from(ivHex, 'hex');
		const authTag = Buffer.from(authTagHex, 'hex');
		const decipher = createDecipheriv(ALGORITHM, KEY, iv);
		decipher.setAuthTag(authTag);
		let decrypted = decipher.update(encrypted, 'hex', 'utf8');
		decrypted += decipher.final('utf8');
		return decrypted;
	}
}