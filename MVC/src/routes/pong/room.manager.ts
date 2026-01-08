import { FastifyInstance } from "fastify";
import { generateUniqueCode } from "./code.utils";

/**
 * Room representation for casual pong matches
 */
interface PongRoom {
	id: string;
	code: string;
	name: string;
	createdBy: string;
	creatorUsername: string;
	maxScore: number;
	players: {
		userId: string;
		username: string;
		position?: 'left' | 'right';
		ready: boolean;
	}[];
	status: 'waiting' | 'ready' | 'playing' | 'finished';
	gameId?: string;
	createdAt: number;
	startedAt?: number;
	finishedAt?: number;
}

/**
 * RoomManager class to handle casual pong room creation and management
 */
export class RoomManager {
	private rooms: Map<string, PongRoom> = new Map();
	private fastify: FastifyInstance;
	private readonly ROOM_CODE_LENGTH = 5;

	constructor(fastify: FastifyInstance) {
		this.fastify = fastify;
		this.fastify.log.info('Room system initialized');
	}

	/**
	 * Generate a random room code (5 uppercase letters)
	 */
	private generateRoomCode(): string {
		const existingCodes = Array.from(this.rooms.values()).map(room => room.code);
		return generateUniqueCode(this.ROOM_CODE_LENGTH, existingCodes);
	}

	/**
	 * Create a new room
	 */
	public createRoom(
		name: string,
		maxScore: number,
		createdBy: string,
		creatorUsername: string
	): PongRoom {
		const roomId = `room_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
		const code = this.generateRoomCode();

		const room: PongRoom = {
			id: roomId,
			code,
			name,
			createdBy,
			creatorUsername,
			maxScore,
			players: [
				{
					userId: createdBy,
					username: creatorUsername,
					ready: false
				}
			],
			status: 'waiting',
			createdAt: Date.now()
		};

		this.rooms.set(roomId, room);
		this.fastify.log.info(`Room created: ${name} (${roomId}) by ${creatorUsername} with code ${code}`);

		return room;
	}

	/**
	 * Join a room by room code
	 */
	public joinRoomByCode(code: string, userId: string, username: string): PongRoom {
		let targetRoom: PongRoom | null = null;
		
		for (const room of this.rooms.values()) {
			if (room.code === code.toUpperCase()) {
				targetRoom = room;
				break;
			}
		}

		if (!targetRoom) {
			throw new Error('Invalid room code');
		}

		if (targetRoom.status !== 'waiting' && targetRoom.status !== 'ready') {
			throw new Error('Room has already started or finished');
		}

		if (targetRoom.players.length >= 2) {
			throw new Error('Room is full');
		}

		if (targetRoom.players.find(p => p.userId === userId)) {
			throw new Error('Already in this room');
		}

		targetRoom.players.push({
			userId,
			username,
			ready: false
		});

		this.fastify.log.info(`${username} joined room ${targetRoom.name} using code ${code}`);

		return targetRoom;
	}

	/**
	 * Get a room by ID
	 */
	public getRoom(roomId: string): PongRoom | undefined {
		return this.rooms.get(roomId);
	}

	/**
	 * Get room by code
	 */
	public getRoomByCode(code: string): PongRoom | undefined {
		for (const room of this.rooms.values()) {
			if (room.code === code.toUpperCase()) {
				return room;
			}
		}
		return undefined;
	}

	/**
	 * Get all available rooms (waiting for players)
	 */
	public getAvailableRooms(): PongRoom[] {
		const available: PongRoom[] = [];
		
		for (const room of this.rooms.values()) {
			if (room.status === 'waiting' && room.players.length < 2) {
				available.push(room);
			}
		}

		return available;
	}

	/**
	 * Get user's current room
	 */
	public getUserRoom(userId: string): PongRoom | undefined {
		for (const room of this.rooms.values()) {
			if (room.players.find(p => p.userId === userId)) {
				return room;
			}
		}
		return undefined;
	}

	/**
	 * Set player as ready
	 */
	public setPlayerReady(roomId: string, userId: string): boolean {
		const room = this.rooms.get(roomId);
		
		if (!room) {
			throw new Error('Room not found');
		}

		if (room.status !== 'waiting' && room.status !== 'ready') {
			throw new Error('Cannot ready up after game has started');
		}

		const player = room.players.find(p => p.userId === userId);
		if (!player) {
			throw new Error('Player not in this room');
		}

		player.ready = true;
		this.fastify.log.info(`Player ${userId} is ready in room ${roomId}`);

		if (room.players.length === 2 && room.players.every(p => p.ready)) {
			room.status = 'ready';
			this.fastify.log.info(`Room ${roomId} is ready to start - both players ready`);
		}

		return true;
	}

	/**
	 * Set player as not ready
	 */
	public setPlayerNotReady(roomId: string, userId: string): boolean {
		const room = this.rooms.get(roomId);
		
		if (!room) {
			throw new Error('Room not found');
		}

		if (room.status === 'playing') {
			throw new Error('Cannot change ready status while game is playing');
		}

		const player = room.players.find(p => p.userId === userId);
		if (!player) {
			throw new Error('Player not in this room');
		}

		player.ready = false;
		
		if (room.status === 'ready') {
			room.status = 'waiting';
		}

		this.fastify.log.info(`Player ${userId} is no longer ready in room ${roomId}`);

		return true;
	}

	/**
	 * Create a game for this room
	 */
	public createRoomGame(roomId: string): string {
		const room = this.rooms.get(roomId);
		
		if (!room) {
			throw new Error('Room not found');
		}

		if (room.status === 'playing' && room.gameId) {
			this.fastify.log.info(`Game ${room.gameId} already exists for room ${roomId}, returning existing ID`);
			return room.gameId;
		}

		if (room.status !== 'ready') {
			throw new Error('Room is not ready to start. Both players must be ready.');
		}

		if (room.players.length !== 2) {
			throw new Error('Room must have exactly 2 players');
		}

		if (!room.players.every(p => p.ready)) {
			throw new Error('Both players must be ready');
		}

		const gameId = `room_${roomId}_${Date.now()}`;
		room.gameId = gameId;
		room.status = 'playing';
		room.startedAt = Date.now();

		this.fastify.log.info(`Game ${gameId} created for room ${roomId}`);
		return gameId;
	}

	/**
	 * Record game result
	 */
	public recordGameResult(roomId: string, winnerId: string): void {
		const room = this.rooms.get(roomId);
		
		if (!room) {
			throw new Error('Room not found');
		}

		if (room.status !== 'playing') {
			throw new Error('Room is not currently playing');
		}

		if (!room.players.find(p => p.userId === winnerId)) {
			throw new Error('Winner must be one of the room players');
		}

		room.finishedAt = Date.now();
		room.gameId = undefined;

		room.players.forEach(p => {
			p.ready = false;
		});

		room.status = 'waiting';

		this.fastify.log.info(`Room ${roomId} finished. Winner: ${winnerId} - reset ready flags and cleared gameId`);
	}

	/**
	 * Find a room by the active gameId
	 */
	public getRoomByGameId(gameId: string): PongRoom | undefined {
		for (const room of this.rooms.values()) {
			if (room.gameId === gameId) {
				return room;
			}
		}
		return undefined;
	}

	/**
	 * Leave a room
	 */
	public leaveRoom(roomId: string, userId: string): boolean {
		const room = this.rooms.get(roomId);
		
		if (!room) {
			return false;
		}

		if (room.status === 'playing') {
			room.status = 'finished';
			room.finishedAt = Date.now();
			this.fastify.log.info(`Player ${userId} left room ${roomId} during game (forfeit)`);
		}

		const index = room.players.findIndex(p => p.userId === userId);
		if (index === -1) {
			return false;
		}

		room.players.splice(index, 1);

		if (room.createdBy === userId || room.players.length === 0) {
			this.rooms.delete(roomId);
			this.fastify.log.info(`Room ${roomId} deleted`);
		}

		return true;
	}

	/**
	 * Delete a room
	 */
	public deleteRoom(roomId: string): boolean {
		return this.rooms.delete(roomId);
	}

	/**
	 * Clean up old finished rooms (older than 1 hour)
	 */
	public cleanupOldRooms(): number {
		const oneHourAgo = Date.now() - (60 * 60 * 1000);
		let cleaned = 0;

		for (const [roomId, room] of this.rooms.entries()) {
			if (room.status === 'finished' && room.finishedAt && room.finishedAt < oneHourAgo) {
				this.rooms.delete(roomId);
				cleaned++;
			}
		}

		if (cleaned > 0) {
			this.fastify.log.info(`Cleaned up ${cleaned} old rooms`);
		}

		return cleaned;
	}
}
