/**
 * Generate a random code with specified length and character set
 * @param length - Length of the code to generate
 * @param charset - Characters to use (default: uppercase letters)
 * @returns Random code string
 */
export function generateRandomCode(length: number, charset: string = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ'): string {
	let code = '';
	for (let i = 0; i < length; i++) {
		code += charset.charAt(Math.floor(Math.random() * charset.length));
	}
	return code;
}

/**
 * Generate a unique code by checking against existing codes for both room play and tournament joining
 * @param length - Length of the code to generate
 * @param existingCodes - Set or array of existing codes to avoid duplicates
 * @param charset - Characters to use (default: uppercase letters)
 * @param maxAttempts - Maximum number of attempts before giving up (default: 100)
 * @returns Unique random code string
 * @throws Error if unable to generate unique code after maxAttempts
 */
export function generateUniqueCode(
	length: number,
	existingCodes: Set<string> | string[],
	charset: string = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ',
	maxAttempts: number = 100
): string {
	const codeSet = Array.isArray(existingCodes) ? new Set(existingCodes) : existingCodes;
	
	for (let attempt = 0; attempt < maxAttempts; attempt++) {
		const code = generateRandomCode(length, charset);
		if (!codeSet.has(code)) {
			return code;
		}
	}
	
	throw new Error(`Failed to generate unique code after ${maxAttempts} attempts`);
}
