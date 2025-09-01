interface UserProfile {
	id: number;
	username: string;
	email: string;
	avatar: string | null;
	createdAt: string;
	gamesPlayed: number;
	wins: number;
	losses: number;
}

interface SearchUser {
	id: number;
	username: string;
	email: string;
	avatar: string | null;
	createdAt: string;
}

export class SearchService {

	/**
	* Search users by username query
	* @param query - The search term to look for in usernames
	* @returns Array of users matching the search criteria
	*/
	async searchUsers(query: string): Promise<SearchUser[]> {
		try {
			const fetch = (await import('node-fetch')).default;
			const https = await import('https');

			const agent = new https.Agent({
				rejectUnauthorized: false // For development with self-signed certificates
			});
			
			const response = await fetch(`https://api:4343/v1/users/search?q=${encodeURIComponent(query)}`, {
				method: 'GET',
				headers: {
					'Content-Type': 'application/json'
				},
				agent
			});
			
			if (!response.ok) {
				throw new Error(`API responded with status ${response.status}`);
			}
			return await response.json() as SearchUser[];
		} catch (error: unknown) {
			const errorMessage = error instanceof Error ? error.message : 'Unknown error';
			throw new Error(`Error searching users: ${errorMessage}`);
		}
	}

	/**
	* Get user profile by user ID
	* @param userId - The ID of the user to fetch
	* @returns User profile data
	*/
	async getUserById(userId: number): Promise<UserProfile> {
		try {
			const fetch = (await import('node-fetch')).default;
			const https = await import('https');
			
			const agent = new https.Agent({
				rejectUnauthorized: false // For development with self-signed certificates
			});
			
			const response = await fetch(`https://api:4343/v1/users/${userId}`, {
				method: 'GET',
				headers: {
					'Content-Type': 'application/json'
				},
				agent
			});
			
			if (!response.ok) {
				if (response.status === 404) {
					throw new Error('User not found');
				}
				throw new Error(`HTTP error! status: ${response.status}`);
			}

			return await response.json() as UserProfile;
		} catch (error: unknown) {
			const errorMessage = error instanceof Error ? error.message : 'Unknown error';
			throw new Error(`Error fetching user: ${errorMessage}`);
		}
	}
}