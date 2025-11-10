import { FastifyInstance } from "fastify";
import { GamesService } from "./games.service";
import { SaveGameResultBody } from "./games.type";
import { saveGameResultSchema } from "./games.swagger";

export async function games(fastify: FastifyInstance): Promise<void> {
	const gamesService = new GamesService(fastify);

	/**
	 * POST /v1/games/result - Save a game result
	 * This endpoint does NOT require authentication as it's called internally by the game server
	 */
	fastify.post<{ Body: SaveGameResultBody }>('/result', { schema: saveGameResultSchema }, async (request, reply) => {
		try {
			const result = await gamesService.saveGameResult(request.body);
			return reply.send(result);
		} catch (error) {
			throw error;
		}
	});
}
