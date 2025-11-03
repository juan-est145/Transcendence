import { FastifyInstance } from "fastify";

/**
 * Data structures for tournament management
 */
interface TournamentParticipant {
	userId: string;
	username: string;
	joinedAt: number;
}

/**
 * Match representation within a tournament
 */
interface Match {
	id: string;
	round: number;
	player1?: TournamentParticipant;
	player2?: TournamentParticipant;
	player1Ready?: boolean; // Player 1 ready status
	player2Ready?: boolean; // Player 2 ready status
	winner?: string;
	gameId?: string; // ID of the actual pong game
	status: 'pending' | 'ready' | 'lobby' | 'playing' | 'completed';
}

/**
 * Tournament representation
 */
interface Tournament {
	id: string;
	name: string;
	size: number;
	maxScore: number;
	createdBy: string;
	creatorUsername: string;
	inviteCode: string;
	participants: TournamentParticipant[];
	invitedUsers: string[]; // Array of invited user IDs
	matches: Match[];
	bracket: Match[][];
	currentRound: number;
	status: 'waiting' | 'active' | 'completed';
	createdAt: number;
	startedAt?: number;
	completedAt?: number;
	winner?: TournamentParticipant;
}

/**
 * TournamentManager class to handle tournament creation, joining, match management, and progression.
 */
export class TournamentManager {
	private tournaments: Map<string, Tournament> = new Map();
	private fastify: FastifyInstance;

	constructor(fastify: FastifyInstance) {
		this.fastify = fastify;
		this.fastify.log.info('Tournament system initialized');
	}

	/**
	 * Generate a random 5-letter invite code
	 */
	private generateInviteCode(): string {
		const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ';
		let code = '';
		for (let i = 0; i < 5; i++) {
			code += chars.charAt(Math.floor(Math.random() * chars.length));
		}
		//Check if code already exists
		for (const tournament of this.tournaments.values()) {
			if (tournament.inviteCode === code) {
				//Regenerate if duplicate
				return this.generateInviteCode();
			}
		}
		return code;
	}

	public createTournament(
		name: string,
		size: number,
		maxScore: number,
		createdBy: string,
		creatorUsername: string
	): Tournament {
		const tournamentId = `tournament_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
		const inviteCode = this.generateInviteCode();

		const tournament: Tournament = {
			id: tournamentId,
			name,
			size,
			maxScore,
			createdBy,
			creatorUsername,
			inviteCode,
			invitedUsers: [],
			participants: [
				{
					userId: createdBy,
					username: creatorUsername,
					joinedAt: Date.now()
				}
			],
			matches: [],
			bracket: [],
			currentRound: 0,
			status: 'waiting',
			createdAt: Date.now()
		};

		this.tournaments.set(tournamentId, tournament);
		this.fastify.log.info(`Tournament created: ${name} (${tournamentId}) by ${creatorUsername} with code ${inviteCode}`);

		return tournament;
	}

	public joinTournament(tournamentId: string, userId: string, username: string): boolean {
		const tournament = this.tournaments.get(tournamentId);

		if (!tournament) {
			return false;
		}

		if (tournament.status !== 'waiting') {
			throw new Error('Tournament has already started');
		}

		if (tournament.participants.length >= tournament.size) {
			throw new Error('Tournament is full');
		}

		if (tournament.participants.find(p => p.userId === userId)) {
			throw new Error('Already in tournament');
		}

		tournament.participants.push({
			userId,
			username,
			joinedAt: Date.now()
		});

		this.fastify.log.info(`${username} joined tournament ${tournament.name}`);
		return true;
	}

	/**
	 * Join tournament using invite code
	 */
	public joinTournamentByCode(inviteCode: string, userId: string, username: string): Tournament | null {
		let targetTournament: Tournament | null = null;
		
		for (const tournament of this.tournaments.values()) {
			if (tournament.inviteCode === inviteCode) {
				targetTournament = tournament;
				break;
			}
		}

		if (!targetTournament) {
			throw new Error('Invalid invite code');
		}

		if (targetTournament.status !== 'waiting') {
			throw new Error('Tournament has already started');
		}

		if (targetTournament.participants.length >= targetTournament.size) {
			throw new Error('Tournament is full');
		}

		if (targetTournament.participants.find(p => p.userId === userId)) {
			throw new Error('Already in tournament');
		}

		targetTournament.participants.push({
			userId,
			username,
			joinedAt: Date.now()
		});

		this.fastify.log.info(`${username} joined tournament ${targetTournament.name} using code ${inviteCode}`);

		return targetTournament;
	}

	/**
	 * Invite a friend to the tournament
	 */
	public inviteFriend(tournamentId: string, ownerId: string, friendUserId: string): boolean {
		const tournament = this.tournaments.get(tournamentId);

		if (!tournament) {
			throw new Error('Tournament not found');
		}

		if (tournament.createdBy !== ownerId) {
			throw new Error('Only the tournament owner can invite friends');
		}

		if (tournament.status !== 'waiting') {
			throw new Error('Cannot invite friends after tournament has started');
		}

		if (!tournament.invitedUsers.includes(friendUserId)) {
			tournament.invitedUsers.push(friendUserId);
			this.fastify.log.info(`User ${friendUserId} invited to tournament ${tournament.name}`);
		}

		return true;
	}

	/**
	 * Check if user is invited to tournament
	 */
	public isUserInvited(tournamentId: string, userId: string): boolean {
		const tournament = this.tournaments.get(tournamentId);
		return tournament ? tournament.invitedUsers.includes(userId) : false;
	}

	/**
	 * Get tournaments where user is invited
	 */
	public getInvitedTournaments(userId: string): Tournament[] {
		const invited: Tournament[] = [];
		
		for (const tournament of this.tournaments.values()) {
			if (tournament.invitedUsers.includes(userId) && tournament.status === 'waiting') {
				invited.push(tournament);
			}
		}

		return invited;
	}

	/**
	 * Manually start tournament (called by owner)
	 */
	public startTournament(tournamentId: string, requesterId: string): boolean {
		const tournament = this.tournaments.get(tournamentId);

		if (!tournament) {
			throw new Error('Tournament not found');
		}

		if (tournament.createdBy !== requesterId) {
			throw new Error('Only the tournament owner can start the tournament');
		}

		if (tournament.status !== 'waiting') {
			throw new Error('Tournament has already started or completed');
		}

		if (tournament.participants.length < 2) {
			throw new Error('Need at least 2 participants to start tournament');
		}

		tournament.status = 'active';
		tournament.startedAt = Date.now();
		tournament.currentRound = 1;

		//Shuffle participants for random seeding
		const participants = [...tournament.participants];
		for (let i = participants.length - 1; i > 0; i--) {
			const j = Math.floor(Math.random() * (i + 1));
			[participants[i], participants[j]] = [participants[j], participants[i]];
		}

		tournament.bracket = this.generateBracket(participants);
		tournament.matches = tournament.bracket.flat();

		//Mark first round matches as lobby (waiting for players to ready up)
		if (tournament.bracket.length > 0) {
			tournament.bracket[0].forEach(match => {
				match.status = 'lobby';
				match.player1Ready = false;
				match.player2Ready = false;
			});
		}

		this.fastify.log.info(`Tournament ${tournament.name} started with ${participants.length} players`);
		
		return true;
	}

	private generateBracket(participants: TournamentParticipant[]): Match[][] {
		const bracket: Match[][] = [];
		let currentRound = participants;
		let roundNumber = 1;

		while (currentRound.length > 1) {
			const roundMatches: Match[] = [];
			
			for (let i = 0; i < currentRound.length; i += 2) {
				const matchId = `match_${roundNumber}_${i / 2}`;
				
				const match: Match = {
					id: matchId,
					round: roundNumber,
					player1: currentRound[i],
					player2: currentRound[i + 1],
					status: roundNumber === 1 ? 'pending' : 'pending',
					winner: undefined
				};

				roundMatches.push(match);
			}

			bracket.push(roundMatches);
			
			currentRound = new Array(Math.ceil(currentRound.length / 2)).fill(null);
			roundNumber++;
		}

		return bracket;
	}

	public getTournament(tournamentId: string): Tournament | undefined {
		return this.tournaments.get(tournamentId);
	}

	public getAllTournaments(): { active: Tournament[]; upcoming: Tournament[]; completed: Tournament[] } {
		const active: Tournament[] = [];
		const upcoming: Tournament[] = [];
		const completed: Tournament[] = [];

		for (const tournament of this.tournaments.values()) {
			if (tournament.status === 'waiting') {
				upcoming.push(tournament);
			} else if (tournament.status === 'active') {
				active.push(tournament);
			} else {
				completed.push(tournament);
			}
		}

		return { active, upcoming, completed };
	}

	public updateMatchResult(tournamentId: string, matchId: string, winnerId: string): boolean {
		const tournament = this.tournaments.get(tournamentId);

		if (!tournament) {
			return false;
		}

		const match = tournament.matches.find(m => m.id === matchId);

		if (!match) {
			return false;
		}

		match.winner = winnerId;
		match.status = 'completed';

		this.advanceWinner(tournament, match);

		this.checkTournamentComplete(tournament);

		return true;
	}

	private advanceWinner(tournament: Tournament, completedMatch: Match): void {
		const winner = completedMatch.winner === completedMatch.player1?.userId 
			? completedMatch.player1 
			: completedMatch.player2;

		if (!winner) {
			return;
		}

		const nextRound = completedMatch.round + 1;
		const nextRoundMatches = tournament.bracket[nextRound - 1];

		if (!nextRoundMatches) {
			tournament.winner = winner;
			return;
		}

		const matchIndex = tournament.bracket[completedMatch.round - 1].indexOf(completedMatch);
		const nextMatchIndex = Math.floor(matchIndex / 2);
		const nextMatch = nextRoundMatches[nextMatchIndex];

		if (matchIndex % 2 === 0) {
			nextMatch.player1 = winner;
		} else {
			nextMatch.player2 = winner;
		}

		if (nextMatch.player1 && nextMatch.player2) {
			nextMatch.status = 'pending';
		}
	}

	private checkTournamentComplete(tournament: Tournament): void {
		const allMatchesComplete = tournament.matches.every(m => m.status === 'completed');

		if (allMatchesComplete) {
			tournament.status = 'completed';
			tournament.completedAt = Date.now();
			this.fastify.log.info(`Tournament ${tournament.name} completed. Winner: ${tournament.winner?.username}`);
		}
	}

	public leaveTournament(tournamentId: string, userId: string): boolean {
		const tournament = this.tournaments.get(tournamentId);

		if (!tournament) {
			return false;
		}

		if (tournament.status !== 'waiting') {
			throw new Error('Cannot leave tournament after it has started');
		}

		const index = tournament.participants.findIndex(p => p.userId === userId);
		
		if (index === -1) {
			return false;
		}

		tournament.participants.splice(index, 1);

		if (tournament.createdBy === userId && tournament.participants.length === 0) {
			this.tournaments.delete(tournamentId);
			this.fastify.log.info(`Tournament ${tournament.name} deleted (creator left)`);
		}

		return true;
	}

	public getUserTournament(userId: string): Tournament | undefined {
		for (const tournament of this.tournaments.values()) {
			if (tournament.participants.find(p => p.userId === userId)) {
				return tournament;
			}
		}
		return undefined;
	}

	public deleteTournament(tournamentId: string): boolean {
		return this.tournaments.delete(tournamentId);
	}

	/**
	 * Create a game for a specific match
	 */
	public createMatchGame(tournamentId: string, matchId: string): string | null {
		const tournament = this.tournaments.get(tournamentId);
		if (!tournament) {
			throw new Error('Tournament not found');
		}

		const match = tournament.matches.find(m => m.id === matchId);
		if (!match) {
			throw new Error('Match not found');
		}

		//If game already exists and match is playing, return existing game ID
		if (match.status === 'playing' && match.gameId) {
			this.fastify.log.info(`Game ${match.gameId} already exists for match ${matchId}`);
			return match.gameId;
		}

		if (match.status !== 'ready') {
			throw new Error('Match is not ready to play. Both players must be ready.');
		}

		if (!match.player1 || !match.player2) {
			throw new Error('Match does not have both players');
		}

		if (!match.player1Ready || !match.player2Ready) {
			throw new Error('Both players must be ready before starting the game');
		}

		const gameId = `tournament_${tournamentId}_${matchId}_${Date.now()}`;
		match.gameId = gameId;
		match.status = 'playing';

		this.fastify.log.info(`Game ${gameId} created for match ${matchId} in tournament ${tournament.name}`);
		return gameId;
	}

	/**
	 * Record match result and advance tournament
	 */
	public recordMatchResult(tournamentId: string, matchId: string, winnerId: string): void {
		const tournament = this.tournaments.get(tournamentId);
		if (!tournament) {
			throw new Error('Tournament not found');
		}

		const match = tournament.matches.find(m => m.id === matchId);
		if (!match) {
			throw new Error('Match not found');
		}

		if (match.status !== 'playing') {
			throw new Error('Match is not currently being played');
		}

		if (winnerId !== match.player1?.userId && winnerId !== match.player2?.userId) {
			throw new Error('Winner must be one of the match players');
		}

		match.winner = winnerId;
		match.status = 'completed';

		this.fastify.log.info(`Match ${matchId} completed. Winner: ${winnerId}`);

		this.advanceWinner(tournament, match);
		this.checkRoundComplete(tournament);
		this.checkTournamentComplete(tournament);
	}

	/**
	 * Check if current round is complete and prepare next round
	 */
	private checkRoundComplete(tournament: Tournament): void {
		const currentRoundMatches = tournament.bracket[tournament.currentRound - 1];
		
		if (!currentRoundMatches) {
			return;
		}

		const allMatchesComplete = currentRoundMatches.every(m => m.status === 'completed');

		if (allMatchesComplete && tournament.currentRound < tournament.bracket.length) {
			tournament.currentRound++;
			const nextRoundMatches = tournament.bracket[tournament.currentRound - 1];
			
			nextRoundMatches.forEach(match => {
				if (match.player1 && match.player2) {
					match.status = 'lobby';
					match.player1Ready = false;
					match.player2Ready = false;
				}
			});

			this.fastify.log.info(`Tournament ${tournament.name} advanced to round ${tournament.currentRound}`);
		}
	}

	/**
	 * Get current round matches that are ready to play
	 */
	public getCurrentRoundMatches(tournamentId: string): Match[] {
		const tournament = this.tournaments.get(tournamentId);
		if (!tournament || tournament.status !== 'active') {
			return [];
		}

		if (tournament.currentRound === 0 || tournament.currentRound > tournament.bracket.length) {
			return [];
		}

		return tournament.bracket[tournament.currentRound - 1].filter(m => 
			m.status === 'ready' || m.status === 'playing'
		);
	}

	/**
	 * Get player's current match in tournament
	 */
	public getPlayerCurrentMatch(tournamentId: string, playerId: string): Match | null {
		const tournament = this.tournaments.get(tournamentId);
		if (!tournament || tournament.status !== 'active') {
			return null;
		}

		const currentRoundMatches = tournament.bracket[tournament.currentRound - 1];
		if (!currentRoundMatches) {
			return null;
		}

		const playerMatch = currentRoundMatches.find(match => 
			(match.player1?.userId === playerId || match.player2?.userId === playerId) &&
			(match.status === 'lobby' || match.status === 'ready' || match.status === 'playing')
		);

		return playerMatch || null;
	}

	/**
	 * Mark player as ready in their match
	 */
	public setPlayerReady(tournamentId: string, matchId: string, playerId: string): boolean {
		const tournament = this.tournaments.get(tournamentId);
		if (!tournament) {
			throw new Error('Tournament not found');
		}

		const match = tournament.matches.find(m => m.id === matchId);
		if (!match) {
			throw new Error('Match not found');
		}

		if (match.status !== 'lobby') {
			throw new Error('Match is not in lobby state');
		}

		if (match.player1?.userId !== playerId && match.player2?.userId !== playerId) {
			throw new Error('Player is not in this match');
		}

		if (match.player1?.userId === playerId) {
			match.player1Ready = true;
		} else if (match.player2?.userId === playerId) {
			match.player2Ready = true;
		}

		this.fastify.log.info(`Player ${playerId} is ready for match ${matchId}`);

		if (match.player1Ready && match.player2Ready) {
			match.status = 'ready';
			this.fastify.log.info(`Match ${matchId} is ready to start - both players ready`);
		}

		return true;
	}

	/**
	 * Unmark player as ready in their match
	 */
	public setPlayerNotReady(tournamentId: string, matchId: string, playerId: string): boolean {
		const tournament = this.tournaments.get(tournamentId);
		if (!tournament) {
			throw new Error('Tournament not found');
		}

		const match = tournament.matches.find(m => m.id === matchId);
		if (!match) {
			throw new Error('Match not found');
		}

		if (match.status !== 'lobby' && match.status !== 'ready') {
			throw new Error('Cannot change ready status after match has started');
		}

		if (match.player1?.userId !== playerId && match.player2?.userId !== playerId) {
			throw new Error('Player is not in this match');
		}

		if (match.player1?.userId === playerId) {
			match.player1Ready = false;
		} else if (match.player2?.userId === playerId) {
			match.player2Ready = false;
		}

		if (match.status === 'ready') {
			match.status = 'lobby';
		}

		this.fastify.log.info(`Player ${playerId} is no longer ready for match ${matchId}`);

		return true;
	}
}