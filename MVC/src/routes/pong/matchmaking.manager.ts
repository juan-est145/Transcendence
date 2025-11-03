import { FastifyInstance } from "fastify";
import { PongGameManager } from "./pong.manager";

interface QueuedPlayer {
	userId: string;
	username: string;
	joinedAt: number;
}

interface Match {
	id: string;
	player1: QueuedPlayer;
	player2: QueuedPlayer;
	status: 'waiting' | 'ready' | 'playing';
	createdAt: number;
}

/**
 * MatchmakingManager class to handle player matchmaking for Pong games.
 */
export class MatchmakingManager {
	private queue: QueuedPlayer[] = [];
	private matches: Map<string, Match> = new Map();
	private fastify: FastifyInstance;
	private matchmakingInterval: NodeJS.Timeout | null = null;

	constructor(fastify: FastifyInstance, _gameManager: PongGameManager) {
		this.fastify = fastify;
		this.startMatchmaking();
	}

	public joinQueue(userId: string, username: string): boolean {
		if (this.queue.find(p => p.userId === userId)) {
			return false;
		}

		if (this.isPlayerInMatch(userId)) {
			return false;
		}

		this.queue.push({
			userId,
			username,
			joinedAt: Date.now(),
		});

		this.fastify.log.info(`Player ${username} (${userId}) joined matchmaking queue`);
		return true;
	}

	/**
	 * Remove a player from the matchmaking queue
	 */
	public leaveQueue(userId: string): boolean {
		const index = this.queue.findIndex(p => p.userId === userId);
		if (index === -1) {
			return false;
		}

		const player = this.queue[index];
		this.queue.splice(index, 1);
		this.fastify.log.info(`Player ${player.username} left matchmaking queue`);
		return true;
	}

	/**
	 * Get player's queue status
	 */
	public getQueueStatus(userId: string): { inQueue: boolean; position?: number; estimatedWaitTime?: number } {
		const index = this.queue.findIndex(p => p.userId === userId);
		
		if (index === -1) {
			return { inQueue: false };
		}

		const estimatedWaitTime = index * 30;

		return {
			inQueue: true,
			position: index + 1,
			estimatedWaitTime
		};
	}

	/**
	 * Check if player is in an active match
	 */
	private isPlayerInMatch(userId: string): boolean {
		for (const match of this.matches.values()) {
			if (match.player1.userId === userId || match.player2.userId === userId) {
				return true;
			}
		}
		return false;
	}

	/**
	 * Start the matchmaking process (runs periodically)
	 */
	private startMatchmaking(): void {
		this.matchmakingInterval = setInterval(() => {
			this.processQueue();
		}, 5000); // Check every 5 seconds

		this.fastify.log.info('Matchmaking system started');
	}

	/**
	 * Process the queue and create matches
	 */
	private processQueue(): void {
		if (this.queue.length < 2) {
			return;
		}

		while (this.queue.length >= 2) {
			const player1 = this.queue.shift()!;
			const player2 = this.queue.shift()!;

			const matchId = `match_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
			
			const match: Match = {
				id: matchId,
				player1,
				player2,
				status: 'ready',
				createdAt: Date.now()
			};

			this.matches.set(matchId, match);

			this.fastify.log.info(`Created match ${matchId}: ${player1.username} vs ${player2.username}`);
		}
	}

	public getMatch(matchId: string): Match | undefined {
		return this.matches.get(matchId);
	}

	public getActiveMatches(): Match[] {
		return Array.from(this.matches.values());
	}

	/**
	 * Get match for a specific user
	 * @param userId 
	 * @returns 
	 */
	public getUserMatch(userId: string): Match | undefined {
		for (const match of this.matches.values()) {
			if (match.player1.userId === userId || match.player2.userId === userId) {
				return match;
			}
		}
		return undefined;
	}

	public updateMatchStatus(matchId: string, status: 'waiting' | 'ready' | 'playing'): boolean {
		const match = this.matches.get(matchId);
		if (!match) {
			return false;
		}

		match.status = status;
		return true;
	}

	public removeMatch(matchId: string): boolean {
		return this.matches.delete(matchId);
	}

	public getQueueSize(): number {
		return this.queue.length;
	}

	public stop(): void {
		if (this.matchmakingInterval) {
			clearInterval(this.matchmakingInterval);
			this.matchmakingInterval = null;
		}
		this.fastify.log.info('Matchmaking system stopped');
	}
}
