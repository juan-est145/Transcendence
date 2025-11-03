import { FastifyInstance } from "fastify";
import { PongGameManager } from "./pong.manager";
import { MatchmakingManager } from "./matchmaking.manager";
import { TournamentManager } from "./tournament.manager";

let gameManager: PongGameManager;
let matchmakingManager: MatchmakingManager;
let tournamentManager: TournamentManager;

export async function pong(fastify: FastifyInstance) {
	gameManager = new PongGameManager(fastify);
	matchmakingManager = new MatchmakingManager(fastify, gameManager);
	tournamentManager = new TournamentManager(fastify);

	fastify.get("/", async (req, res) => {
		return res.html();
	});

	fastify.get("/matchmaking", async (req, res) => {
		if (!req.session || !req.session.get("jwt")) {
			return res.redirect("/auth/login");
		}
		await req.jwtVerify();
		return res.view("matchmaking.ejs", { user: req.user });
	});

	fastify.get("/tournaments", async (req, res) => {
		if (!req.session || !req.session.get("jwt")) {
			return res.redirect("/auth/login");
		}
		await req.jwtVerify();
		return res.view("tournaments.ejs", { user: req.user, title: "Torneos - Pong Game" });
	});

	//WebSocket for game connections
	fastify.get('/ws', { websocket: true }, (connection, req) => {
		gameManager.handleWebSocketConnection(connection);
	});

	//API endpoints
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

	//Matchmaking API endpoints
	fastify.post("/matchmaking/join", async (req, res) => {
		try {
			fastify.log.info("Matchmaking join request received");
			
			if (!req.session) {
				fastify.log.warn("No session found");
				return res.status(401).send({ success: false, error: "No session" });
			}
			
			const jwt = req.session.get("jwt");
			if (!jwt) {
				fastify.log.warn("No JWT in session");
				return res.status(401).send({ success: false, error: "Not logged in" });
			}
			
			fastify.log.info("Verifying JWT");
			await req.jwtVerify();
			
			if (!req.user) {
				fastify.log.warn("No user after JWT verify");
				return res.status(401).send({ success: false, error: "Invalid token" });
			}
			
			const user = req.user;
			fastify.log.info({ email: user.email, username: user.username }, "User verified");
			
			const success = matchmakingManager.joinQueue(user.email, user.username || user.email);
			if (success) {
				fastify.log.info({ userId: user.email }, "User joined queue");
				return { success: true, message: "Joined matchmaking queue", userId: user.email };
			} else {
				fastify.log.info({ userId: user.email }, "User already in queue");
				return res.status(409).send({ success: false, error: "Already in queue or in a match" });
			}
		} catch (error: any) {
			fastify.log.error({ error, message: error?.message, stack: error?.stack }, "Error in matchmaking/join");
			return res.status(500).send({ success: false, error: error?.message || "Failed to join queue" });
		}
	});

	fastify.post("/matchmaking/leave", async (req, res) => {
		try {
			if (!req.session || !req.session.get("jwt")) {
				return res.status(401).send({ success: false, error: "Not logged in" });
			}
			
			await req.jwtVerify();
			const user = req.user!;
			
			const success = matchmakingManager.leaveQueue(user.email);
			return { success, message: success ? "Left matchmaking queue" : "Not in queue" };
		} catch (error) {
			fastify.log.error({ error }, "Error in matchmaking/leave");
			return res.status(500).send({ success: false, error: "Failed to leave queue" });
		}
	});

	fastify.get("/matchmaking/status", async (req, res) => {
		try {
			if (!req.session || !req.session.get("jwt")) {
				return res.status(401).send({ success: false, error: "Not logged in" });
			}
			
			await req.jwtVerify();
			const user = req.user!;
			
			const status = matchmakingManager.getQueueStatus(user.email);
			const match = matchmakingManager.getUserMatch(user.email);
			
			return {
				...status,
				match: match ? {
					id: match.id,
					opponent: match.player1.userId === user.email ? match.player2.username : match.player1.username,
					status: match.status
				} : null
			};
		} catch (error) {
			fastify.log.error({ error }, "Error in matchmaking/status");
			return res.status(500).send({ success: false, error: "Failed to get status" });
		}
	});

	fastify.get("/matchmaking/queue-size", async (req, res) => {
		return { queueSize: matchmakingManager.getQueueSize() };
	});

	//Tournament API endpoints
	fastify.post("/tournaments/create", {
		onRequest: fastify.auth([fastify.verifyLoggedIn])
	}, async (req, res) => {
		try {
			const user = req.user!;
			const { name, size, maxScore } = req.body as { name: string; size: number; maxScore: number };
			
			const tournament = tournamentManager.createTournament(
				name,
				size,
				maxScore,
				user.email,
				user.username || user.email
			);
			
			return { 
				success: true, 
				tournament: {
					id: tournament.id,
					name: tournament.name,
					size: tournament.size,
					maxScore: tournament.maxScore,
					inviteCode: tournament.inviteCode,
					createdBy: tournament.createdBy,
					participants: tournament.participants,
					status: tournament.status
				}
			};
		} catch (error) {
			fastify.log.error({ error }, "Error in tournaments/create");
			return res.status(500).send({ success: false, error: "Failed to create tournament" });
		}
	});

	fastify.post("/tournaments/join-by-code", {
		onRequest: fastify.auth([fastify.verifyLoggedIn])
	}, async (req, res) => {
		try {
			const user = req.user!;
			const { inviteCode } = req.body as { inviteCode: string };
			
			if (!inviteCode || inviteCode.length !== 5) {
				return res.status(400).send({ success: false, error: "Invalid invite code format" });
			}
			
			const tournament = tournamentManager.joinTournamentByCode(
				inviteCode.toUpperCase(),
				user.email,
				user.username || user.email
			);
			
			if (tournament) {
				return { 
					success: true, 
					message: "Joined tournament successfully",
					tournament: {
						id: tournament.id,
						name: tournament.name,
						participants: tournament.participants
					}
				};
			} else {
				return res.status(404).send({ success: false, error: "Tournament not found" });
			}
		} catch (error: any) {
			fastify.log.error({ error }, "Error in tournaments/join-by-code");
			return res.status(400).send({ success: false, error: error.message || "Failed to join tournament" });
		}
	});

	fastify.post("/tournaments/:tournamentId/invite-friend", {
		onRequest: fastify.auth([fastify.verifyLoggedIn])
	}, async (req, res) => {
		try {
			const user = req.user!;
			const { tournamentId } = req.params as { tournamentId: string };
			const { friendUserId } = req.body as { friendUserId: string };
			
			const success = tournamentManager.inviteFriend(tournamentId, user.email, friendUserId);
			return { success, message: "Friend invited successfully" };
		} catch (error: any) {
			fastify.log.error({ error }, "Error in tournaments/invite-friend");
			return res.status(400).send({ success: false, error: error.message || "Failed to invite friend" });
		}
	});

	fastify.post("/tournaments/:tournamentId/start", {
		onRequest: fastify.auth([fastify.verifyLoggedIn])
	}, async (req, res) => {
		try {
			const user = req.user!;
			const { tournamentId } = req.params as { tournamentId: string };
			
			const success = tournamentManager.startTournament(tournamentId, user.email);
			return { success, message: "Tournament started successfully" };
		} catch (error: any) {
			fastify.log.error({ error }, "Error in tournaments/start");
			return res.status(400).send({ success: false, error: error.message || "Failed to start tournament" });
		}
	});

	fastify.get("/tournaments/list", {
		onRequest: fastify.auth([fastify.verifyLoggedIn])
	}, async (req, res) => {
		const user = req.user!;
		const tournaments = tournamentManager.getAllTournaments();
		
		return { 
			active: tournaments.active.map(t => ({
				id: t.id,
				name: t.name,
				size: t.size,
				participants: t.participants,
				status: t.status,
				createdAt: t.createdAt,
				isParticipant: t.participants.some(p => p.userId === user.email)
			})),
			upcoming: tournaments.upcoming.map(t => ({
				id: t.id,
				name: t.name,
				size: t.size,
				participants: t.participants,
				status: t.status,
				createdAt: t.createdAt,
				isParticipant: t.participants.some(p => p.userId === user.email)
			})),
			completed: tournaments.completed.map(t => ({
				id: t.id,
				name: t.name,
				winner: t.winner,
				completedAt: t.completedAt
			}))
		};
	});

	fastify.post("/tournaments/:tournamentId/join", {
		onRequest: fastify.auth([fastify.verifyLoggedIn])
	}, async (req, res) => {
		try {
			const user = req.user!;
			const { tournamentId } = req.params as { tournamentId: string };
			
			const success = tournamentManager.joinTournament(tournamentId, user.email, user.username || user.email);
			console.log(`User ${user.email} joining tournament ${tournamentId}`);
			return { success, message: "Joined tournament" };
		} catch (error: any) {
			fastify.log.error({ error }, "Error in tournaments/join");
			return res.status(400).send({ success: false, error: error.message || "Failed to join tournament" });
		}
	});

	fastify.get("/tournaments/:tournamentId", {
		onRequest: fastify.auth([fastify.verifyLoggedIn])
	}, async (req, res) => {
		const { tournamentId } = req.params as { tournamentId: string };
		const user = req.user!; // User is guaranteed to be logged in
		
		const tournament = tournamentManager.getTournament(tournamentId);
		
		if (!tournament) {
			return res.status(404).send({ error: "Tournament not found" });
		}
		
		//Check if user is a participant
		const isParticipant = tournament.participants.some(p => p.userId === user.email);
		const isOwner = tournament.createdBy === user.email;
		
		//Only participants can see full tournament details
		if (!isParticipant) {
			return res.status(403).send({ error: "Only tournament participants can view lobby details" });
		}
		
		return { 
			id: tournament.id,
			name: tournament.name,
			size: tournament.size,
			maxScore: tournament.maxScore,
			inviteCode: tournament.inviteCode,
			createdBy: tournament.createdBy,
			creatorUsername: tournament.creatorUsername,
			status: tournament.status,
			participants: tournament.participants,
			bracket: tournament.bracket,
			matches: tournament.matches,
			winner: tournament.winner,
			isOwner,
			isFull: tournament.participants.length === tournament.size,
			currentRound: tournament.currentRound
		};
	});

	fastify.post("/tournaments/:tournamentId/leave", {
		onRequest: fastify.auth([fastify.verifyLoggedIn])
	}, async (req, res) => {
		try {
			const user = req.user!;
			const { tournamentId } = req.params as { tournamentId: string };
			
			const success = tournamentManager.leaveTournament(tournamentId, user.email);
			return { success, message: "Left tournament" };
		} catch (error: any) {
			fastify.log.error({ error }, "Error in tournaments/leave");
			return res.status(400).send({ success: false, error: error.message || "Failed to leave tournament" });
		}
	});

	fastify.get("/tournaments/:tournamentId/current-matches", {
		onRequest: fastify.auth([fastify.verifyLoggedIn])
	}, async (req, res) => {
		try {
			const { tournamentId } = req.params as { tournamentId: string };
			const matches = tournamentManager.getCurrentRoundMatches(tournamentId);
			return { success: true, matches };
		} catch (error: any) {
			fastify.log.error({ error }, "Error in tournaments/current-matches");
			return res.status(400).send({ success: false, error: error.message || "Failed to get current matches" });
		}
	});

	fastify.get("/tournaments/:tournamentId/my-match", {
		onRequest: fastify.auth([fastify.verifyLoggedIn])
	}, async (req, res) => {
		try {
			const user = req.user!;
			const { tournamentId } = req.params as { tournamentId: string };
			const match = tournamentManager.getPlayerCurrentMatch(tournamentId, user.email);
			
			if (match) {
				return { 
					success: true, 
					match: {
						...match,
						currentUserId: user.email
					}
				};
			} else {
				return { success: true, match: null };
			}
		} catch (error: any) {
			fastify.log.error({ error }, "Error in tournaments/my-match");
			return res.status(400).send({ success: false, error: error.message || "Failed to get player match" });
		}
	});

	fastify.post("/tournaments/:tournamentId/matches/:matchId/create-game", {
		onRequest: fastify.auth([fastify.verifyLoggedIn])
	}, async (req, res) => {
		try {
			const user = req.user!;
			const { tournamentId, matchId } = req.params as { tournamentId: string; matchId: string };
			
			//Verify user is in this match
			const match = tournamentManager.getPlayerCurrentMatch(tournamentId, user.email);
			if (!match || match.id !== matchId) {
				return res.status(403).send({ success: false, error: "You are not in this match" });
			}
			
			const gameId = tournamentManager.createMatchGame(tournamentId, matchId);
			return { success: true, gameId };
		} catch (error: any) {
			fastify.log.error({ error }, "Error in tournaments/create-game");
			return res.status(400).send({ success: false, error: error.message || "Failed to create game" });
		}
	});

	fastify.post("/tournaments/:tournamentId/matches/:matchId/result", {
		onRequest: fastify.auth([fastify.verifyLoggedIn])
	}, async (req, res) => {
		try {
			const { tournamentId, matchId } = req.params as { tournamentId: string; matchId: string };
			const { winnerId } = req.body as { winnerId: string };
			
			tournamentManager.recordMatchResult(tournamentId, matchId, winnerId);
			return { success: true, message: "Match result recorded" };
		} catch (error: any) {
			fastify.log.error({ error }, "Error in tournaments/result");
			return res.status(400).send({ success: false, error: error.message || "Failed to record result" });
		}
	});

	fastify.post("/tournaments/:tournamentId/matches/:matchId/ready", {
		onRequest: fastify.auth([fastify.verifyLoggedIn])
	}, async (req, res) => {
		try {
			const user = req.user!;
			const { tournamentId, matchId } = req.params as { tournamentId: string; matchId: string };
			
			const success = tournamentManager.setPlayerReady(tournamentId, matchId, user.email);
			return { success, message: "Marked as ready" };
		} catch (error: any) {
			fastify.log.error({ error }, "Error in tournaments/ready");
			return res.status(400).send({ success: false, error: error.message || "Failed to mark as ready" });
		}
	});

	fastify.post("/tournaments/:tournamentId/matches/:matchId/unready", {
		onRequest: fastify.auth([fastify.verifyLoggedIn])
	}, async (req, res) => {
		try {
			const user = req.user!;
			const { tournamentId, matchId } = req.params as { tournamentId: string; matchId: string };
			
			const success = tournamentManager.setPlayerNotReady(tournamentId, matchId, user.email);
			return { success, message: "Marked as not ready" };
		} catch (error: any) {
			fastify.log.error({ error }, "Error in tournaments/unready");
			return res.status(400).send({ success: false, error: error.message || "Failed to unmark as ready" });
		}
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