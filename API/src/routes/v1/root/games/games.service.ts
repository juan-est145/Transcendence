import { FastifyInstance } from "fastify";
import { SaveGameResultBody } from "./games.type";

export class GamesService {
	constructor(private fastify: FastifyInstance) {}

	/**
	 * Saves a game result to the database
	 * @param data - Game result data including winner, loser, game type
	 * @returns Success message
	 */
	async saveGameResult(data: SaveGameResultBody) {
		const { winnerEmail, loserEmail, gameType, gameId } = data;

		const winnerUser = await this.fastify.prisma.users.findUnique({ 
			where: { email: winnerEmail } 
		});
		const loserUser = await this.fastify.prisma.users.findUnique({ 
			where: { email: loserEmail } 
		});

		if (!winnerUser || !loserUser) {
			throw this.fastify.httpErrors.notFound('Winner or loser user not found');
		}
		
		await this.fastify.prisma.gameResult.create({
			data: {
				playerId: winnerUser.id,
				opponentId: loserUser.id,
				result: 'WIN',
				gameType,
				gameId
			}
		});

		await this.fastify.prisma.gameResult.create({
			data: {
				playerId: loserUser.id,
				opponentId: winnerUser.id,
				result: 'LOSS',
				gameType,
				gameId
			}
		});

		this.fastify.log.info(`Game result saved: winner=${winnerEmail}, loser=${loserEmail}, type=${gameType}, gameId=${gameId}`);

		return {
			success: true,
			message: 'Game result saved successfully'
		};
	}
}
