import { FastifyInstance } from "fastify";
import { PongGameManager } from "./pong.manager";

let gameManager: PongGameManager;

export async function pong(fastify: FastifyInstance) {
	gameManager = new PongGameManager(fastify);

	fastify.get("/", async (req, res) => {
		return res.html();
	});

	fastify.register(async function (fastify) {
		fastify.get('/ws', { websocket: true }, (connection, req) => {
			gameManager.handleWebSocketConnection(connection);
		});
	});

	fastify.get("/games", async (req, res) => {
		const activeGames = gameManager.getActiveGames();
		return { games: activeGames };
	});

	fastify.get("/games/:gameId/stats", async (req, res) => {
		const { gameId } = req.params as { gameId: string };
		const stats = gameManager.getGameStats(gameId);
		
		if (!stats) {
			return res.status(404).send({ error: "Game not found" });
		}
		
		return stats;
	});

	fastify.post("/move", async (req, res) => {
		return { success: true };
	});

	fastify.post("/tick", async (req, res) => {
		return { success: true };
	});

	fastify.get("/state", async (req, res) => {
		return {
			paddleOne: { x: -4, y: 1, z: 0 },
			paddleTwo: { x: 4, y: 1, z: 0 },
			ball: { x: 0, y: 1, z: 0 },
			scoreOne: 0,
			scoreTwo: 0
		};
	});
}