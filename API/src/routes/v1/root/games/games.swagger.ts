import { saveGameResultBody, saveGameResultResponse } from "./games.dto";

export const saveGameResultSchema = {
	description: 'Save a game result',
	tags: ['games'],
	body: saveGameResultBody,
	response: {
		200: saveGameResultResponse,
		404: {
			description: 'User not found',
			type: 'object',
			properties: {
				message: { type: 'string' }
			}
		}
	}
};
