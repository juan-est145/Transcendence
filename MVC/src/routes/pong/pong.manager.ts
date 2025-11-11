import { PongGame } from './pong.game';
import { WebSocketMessage, PlayerInput } from './pong.types';
import { FastifyInstance } from 'fastify';
import { WebSocket } from '@fastify/websocket';
import { MatchmakingManager } from './matchmaking.manager';
import type { RoomManager } from './room.manager';

/**
 * Manages multiple Pong game instances and player connections.
 */
export class PongGameManager {
  //Map of active games by game ID
  private games: Map<string, PongGame> = new Map();
  //Map of playerId to their WebSocket connection
  private playerSockets: Map<string, WebSocket> = new Map();
  //Map of playerId to gameId they are in
  private playerGameMap: Map<string, string> = new Map();
  //Map of WebSocket connections to playerId
  private socketPlayerMap: Map<WebSocket, string> = new Map();
  //Map of playerId to user email
  private playerEmailMap: Map<string, string> = new Map();
  //Map of playerId to user name
  private matchmakingManager: MatchmakingManager | null = null;
  //Reference to RoomManager for room-related game handling
  private roomManager: RoomManager | null = null;

  constructor(private fastify: FastifyInstance) {}
  
  public setMatchmakingManager(manager: MatchmakingManager): void {
    this.matchmakingManager = manager;
  }

  public setRoomManager(manager: RoomManager): void {
    this.roomManager = manager;
  }

  public createGame(gameId: string): PongGame {
    const game = new PongGame(gameId);
    this.games.set(gameId, game);
    return game;
  }

  public getGame(gameId: string): PongGame | undefined {
    return this.games.get(gameId);
  }

  public removeGame(gameId: string): void {
    const game = this.games.get(gameId);
    if (game) {
      game.destroy();
      this.games.delete(gameId);
    }
  }

  /**
   * Handles a new WebSocket connection. Sets up message and close handlers.
   * @param socket The WebSocket connection.
   */
  public handleWebSocketConnection(socket: WebSocket): void {
    this.fastify.log.info('New WebSocket connection established');
    
    socket.on('message', (message: Buffer) => {
      try {
        const data: WebSocketMessage = JSON.parse(message.toString());
        this.fastify.log.info(`Received WebSocket message: ${JSON.stringify(data)}`);
        this.handleWebSocketMessage(socket, data);
      } catch (error) {
        this.fastify.log.error(`Error parsing WebSocket message: ${error}`);
        this.sendError(socket, 'Invalid message format');
      }
    });

    socket.on('close', () => {
      this.fastify.log.info('WebSocket connection closed');
      this.handlePlayerDisconnect(socket);
    });

    socket.on('error', (error: any) => {
      this.fastify.log.error(`WebSocket error: ${error}`);
      this.handlePlayerDisconnect(socket);
    });
  }

  /**
   * Handles incoming WebSocket messages. Routes messages to appropriate handlers.
   * @param socket The WebSocket connection.
   * @param message The parsed WebSocket message.
   */
  private handleWebSocketMessage(socket: WebSocket, message: WebSocketMessage): void {
    switch (message.type) {
      case 'join_game':
        this.handleJoinGame(socket, message);
        break;
      case 'leave_game':
        this.handleLeaveGame(socket, message);
        break;
      case 'player_input':
        this.handlePlayerInput(socket, message);
        break;
      case 'pause_game':
        this.handlePauseGame(socket, message);
        break;
      case 'unpause_game':
        this.handleUnpauseGame(socket, message);
        break;
      default:
        this.sendError(socket, 'Unknown message type');
    }
  }

  /**
   * Find an available game or create a new one
   */
  private findOrCreateAvailableGame(): string {
    //Look for a game that has space for players
    for (const [gameId, game] of this.games.entries()) {
      const state = game.getGameState();
      //Game must be waiting and have at least one empty slot
      if (state.gameStatus === 'waiting' && (!state.players.left || !state.players.right)) {
        return gameId;
      }
    }
    
    //No available game found, create a new one
    const newGameId = 'game_' + Date.now() + '_' + Math.random().toString(36).substr(2, 9);
    this.createGame(newGameId);
    return newGameId;
  }

  /**
   * Handles a player joining a game. Creates a new game if necessary.
   * @param socket The WebSocket connection.
   * @param message The parsed WebSocket message.
   * @returns 
   */
  private handleJoinGame(socket: WebSocket, message: WebSocketMessage): void {
    let { gameId, playerId, userEmail } = message;
    
    if (!playerId) {
      this.sendError(socket, 'Missing playerId');
      return;
    }

    //Store the user's email for this playerId if provided
    if (userEmail) {
      this.playerEmailMap.set(playerId, userEmail);
    }

    if (this.playerGameMap.has(playerId)) {
      this.sendError(socket, 'Player already in a game');
      return;
    }

    //If no gameId provided or it's the default, find/create an available game
    if (!gameId || gameId === 'default-game' || gameId.startsWith('game_')) {
      gameId = this.findOrCreateAvailableGame();
      this.fastify.log.info({ playerId, gameId }, "Assigned player to game");
    }

    let game = this.getGame(gameId);
    if (!game) {
      game = this.createGame(gameId);
    }

    const position = game.addPlayer(playerId);
    if (!position) {
      //Game is full, find another available game
      gameId = this.findOrCreateAvailableGame();
      game = this.getGame(gameId)!;
      const newPosition = game.addPlayer(playerId);
      
      if (!newPosition) {
        this.sendError(socket, 'Unable to join game');
        return;
      }
      
      this.playerSockets.set(playerId, socket);
      this.playerGameMap.set(playerId, gameId);
      this.socketPlayerMap.set(socket, playerId);

      this.sendToSocket(socket, {
        type: 'game_state',
        data: {
          ...game.getGameState(),
          playerPosition: newPosition
        }
      });

      this.broadcastToGame(gameId, {
        type: 'player_joined',
        data: { playerId, position: newPosition }
      }, playerId);

      if (game.getGameState().players.left && game.getGameState().players.right) {
        game.startGame();
        this.startGameStateUpdates(gameId);
      }
      return;
    }

    this.playerSockets.set(playerId, socket);
    this.playerGameMap.set(playerId, gameId);
    this.socketPlayerMap.set(socket, playerId);

    this.sendToSocket(socket, {
      type: 'game_state',
      data: {
        ...game.getGameState(),
        playerPosition: position
      }
    });

    this.broadcastToGame(gameId, {
      type: 'player_joined',
      data: { playerId, position }
    }, playerId);

    if (game.getGameState().players.left && game.getGameState().players.right) {
      game.startGame();
      this.startGameStateUpdates(gameId);
    }
  }

  /**
   * Handles a player leaving a game.
   * @param socket The WebSocket connection.
   * @param message The parsed WebSocket message.
   */
  private handleLeaveGame(socket: WebSocket, message: WebSocketMessage): void {
    const playerId = this.socketPlayerMap.get(socket);
    if (playerId) {
      this.handlePlayerDisconnect(socket);
    }
  }

  /**
   * Handles player input for paddle movement. Routes input to the appropriate game instance.
   * @param socket The WebSocket connection.
   * @param message The parsed WebSocket message.
   * @returns 
   */
  private handlePlayerInput(socket: WebSocket, message: WebSocketMessage): void {
    const playerId = this.socketPlayerMap.get(socket);
    if (!playerId) {
      this.sendError(socket, 'Player not registered');
      return;
    }

    const gameId = this.playerGameMap.get(playerId);
    if (!gameId) {
      this.sendError(socket, 'Player not in a game');
      return;
    }

    const game = this.getGame(gameId);
    if (!game) {
      this.sendError(socket, 'Game not found');
      return;
    }

    const input: PlayerInput = {
      playerId,
      direction: message.data.direction,
      timestamp: Date.now()
    };

    game.handlePlayerInput(input);
  }

  /**
   * Handles pause game request from a player
   * @param socket The WebSocket connection
   * @param message The parsed WebSocket message
   */
  private handlePauseGame(socket: WebSocket, message: WebSocketMessage): void {
    const playerId = this.socketPlayerMap.get(socket);
    if (!playerId) {
      this.sendError(socket, 'Player not registered');
      return;
    }

    const gameId = this.playerGameMap.get(playerId);
    if (!gameId) {
      this.sendError(socket, 'Player not in a game');
      return;
    }

    const game = this.getGame(gameId);
    if (!game) {
      this.sendError(socket, 'Game not found');
      return;
    }

    game.pauseGame(playerId);
  }

  /**
   * Handles unpause game request from a player
   * @param socket The WebSocket connection
   * @param message The parsed WebSocket message
   */
  private handleUnpauseGame(socket: WebSocket, message: WebSocketMessage): void {
    const playerId = this.socketPlayerMap.get(socket);
    if (!playerId) {
      this.sendError(socket, 'Player not registered');
      return;
    }

    const gameId = this.playerGameMap.get(playerId);
    if (!gameId) {
      this.sendError(socket, 'Player not in a game');
      return;
    }

    const game = this.getGame(gameId);
    if (!game) {
      this.sendError(socket, 'Game not found');
      return;
    }

    game.unpauseGame(playerId);
  }

  /**
   * Handles a player disconnecting from the game. Cleans up player and game state.
   * @param socket The WebSocket connection.
   * @returns 
   */
  private handlePlayerDisconnect(socket: WebSocket): void {
    const playerId = this.socketPlayerMap.get(socket);
    if (!playerId) return;

    const gameId = this.playerGameMap.get(playerId);
    if (gameId) {
      const game = this.getGame(gameId);
      if (game) {
        const gameState = game.getGameState();
        
        //Check if this is a room game before removing the player
        const room = this.roomManager?.getRoomByGameId(gameId);
        const wasRoomGame = !!room;
        const wasPlaying = gameState.gameStatus === 'playing' || gameState.gameStatus === 'paused';
        
        this.fastify.log.info(`Player ${playerId} disconnecting from game ${gameId}. Room found: ${wasRoomGame}, Was playing: ${wasPlaying}, Room status: ${room?.status}`);
        
        //If player disconnects during active game, save forfeit result before removing player
        if (wasPlaying) {
          const leftPlayerId = gameState.players.left;
          const rightPlayerId = gameState.players.right;
          
          if (leftPlayerId && rightPlayerId) {
            const leftPlayerEmail = this.playerEmailMap.get(leftPlayerId);
            const rightPlayerEmail = this.playerEmailMap.get(rightPlayerId);
            
            if (leftPlayerEmail && rightPlayerEmail) {
              //Determine winner (opposite of disconnecting player)
              const disconnectedPosition = leftPlayerId === playerId ? 'left' : 'right';
              const winnerPosition = disconnectedPosition === 'left' ? 'right' : 'left';
              const winnerEmail = winnerPosition === 'left' ? leftPlayerEmail : rightPlayerEmail;
              const loserEmail = winnerPosition === 'left' ? rightPlayerEmail : leftPlayerEmail;
              
              //Determine game type
              let gameType: 'MATCHMAKING' | 'ROOM' | 'TOURNAMENT' = 'MATCHMAKING';
              if (gameId && gameId.startsWith('tournament_')) {
                gameType = 'TOURNAMENT';
              } else if (room) {
                gameType = 'ROOM';
              } else if (gameId && gameId.startsWith('match_')) {
                gameType = 'MATCHMAKING';
              }
              
              (async () => {
                try {
                  const response = await fetch(`${process.env.API_URL}/v1/games/result`, {
                    method: 'POST',
                    headers: {
                      'Content-Type': 'application/json',
                    },
                    body: JSON.stringify({
                      winnerEmail,
                      loserEmail,
                      gameType,
                      gameId: gameId || 'unknown'
                    })
                  });

                  if (!response.ok) {
                    this.fastify.log.warn(`Failed to save forfeit result: ${response.statusText}`);
                  } else {
                    this.fastify.log.info(`Persisted forfeit result for game ${gameId}: winner=${winnerEmail}, loser=${loserEmail}, type=${gameType}`);
                  }
                } catch (err) {
                  this.fastify.log.error({ err }, 'Error saving forfeit result to API');
                }
              })();
            }
          }
        }
        
        //Determine the winner before removing the player (for room management)
        const leftPlayerId = gameState.players.left;
        const rightPlayerId = gameState.players.right;
        const winnerPlayerId = leftPlayerId === playerId ? rightPlayerId : leftPlayerId;
        
        //Find the winner's email from room players (playerId is different from userId/email)
        let winnerEmail: string | undefined;
        if (room && winnerPlayerId) {
          const disconnectedPosition = leftPlayerId === playerId ? 'left' : 'right';
          const winnerPosition = disconnectedPosition === 'left' ? 'right' : 'left';
          const winnerPlayer = room.players.find(p => p.position === winnerPosition);
          winnerEmail = winnerPlayer?.userId;
        }
        
        //Remove the player (this will set game status to 'finished' if game was active)
        game.removePlayer(playerId);
        
        //If this was an active room game, reset the room state
        if (wasRoomGame && wasPlaying && room) {
          this.fastify.log.info(`Attempting to reset room ${room.id} after disconnect. Current room status: ${room.status}, Winner email: ${winnerEmail}`);
          try {
            if (winnerEmail && room.status === 'playing') {
              this.roomManager!.recordGameResult(room.id, winnerEmail);
              this.fastify.log.info(`Room ${room.id} reset after player ${playerId} disconnected (forfeit to ${winnerEmail})`);
            } else {
              this.fastify.log.info(`Room ${room.id} manual reset: winnerEmail=${winnerEmail}, status=${room.status}`);
              room.status = 'waiting';
              room.gameId = undefined;
              room.players.forEach(p => { p.ready = false; });
            }
          } catch (err) {
            this.fastify.log.error({ err }, 'Failed to reset room after player disconnect');
            room.status = 'waiting';
            room.gameId = undefined;
            room.players.forEach(p => { p.ready = false; });
          }
        }
        
        this.broadcastToGame(gameId, {
          type: 'player_left',
          data: { playerId }
        }, playerId);

        const updatedGameState = game.getGameState();
        if (!updatedGameState.players.left && !updatedGameState.players.right) {
          this.removeGame(gameId);
        }
      }
      
      if (this.matchmakingManager) {
        const match = this.matchmakingManager.getUserMatch(playerId);
        if (match) {
          this.matchmakingManager.removeMatch(match.id);
          this.fastify.log.info(`Removed matchmaking match ${match.id} for player ${playerId} after disconnect`);
        }
      }
    }

    this.playerSockets.delete(playerId);
    this.playerGameMap.delete(playerId);
    this.socketPlayerMap.delete(socket);
    this.playerEmailMap.delete(playerId);
  }

  /**
   * Starts the game state updates for a specific game. Sends updates to all connected players.
   * @param gameId The ID of the game to start updates for.
   */
  private startGameStateUpdates(gameId: string): void {
    const updateInterval = setInterval(() => {
      const game = this.getGame(gameId);
      if (!game) {
        clearInterval(updateInterval);
        return;
      }

      const gameState = game.getGameState();
      
      this.broadcastToGame(gameId, {
        type: 'game_state',
        data: gameState
      });
      
      if (gameState.gameStatus === 'finished' || 
          (!gameState.players.left && !gameState.players.right)) {
        this.fastify.log.info({ gameId, status: gameState.gameStatus }, "Game ended");
        
        if (this.matchmakingManager && gameState.gameStatus === 'finished') {
          const playerIds = [gameState.players.left, gameState.players.right].filter(Boolean);
          playerIds.forEach(playerId => {
            if (playerId) {
              const match = this.matchmakingManager!.getUserMatch(playerId);
              if (match) {
                this.matchmakingManager!.removeMatch(match.id);
                this.fastify.log.info(`Removed matchmaking match ${match.id} for player ${playerId} after game finished`);
              }
            }
          });
        }

        (async () => {
          try {
            if (gameState.gameStatus !== 'finished') return;

            const leftPlayer = gameState.players.left;
            const rightPlayer = gameState.players.right;
            if (!leftPlayer || !rightPlayer) return;

            let winnerSide: 'left' | 'right' | null = null;
            if (gameState.forfeit && gameState.forfeit.occurred && gameState.forfeit.winner) {
              winnerSide = gameState.forfeit.winner;
            } else if (gameState.scores.left > gameState.scores.right) {
              winnerSide = 'left';
            } else if (gameState.scores.right > gameState.scores.left) {
              winnerSide = 'right';
            }

            if (!winnerSide) return;

            const leftPlayerEmail = this.playerEmailMap.get(leftPlayer);
            const rightPlayerEmail = this.playerEmailMap.get(rightPlayer);

            if (!leftPlayerEmail || !rightPlayerEmail) {
              this.fastify.log.warn(`Missing email addresses for players. Left: ${leftPlayerEmail}, Right: ${rightPlayerEmail}`);
              return;
            }

            const winnerEmail = winnerSide === 'left' ? leftPlayerEmail : rightPlayerEmail;
            const loserEmail = winnerSide === 'left' ? rightPlayerEmail : leftPlayerEmail;

            //Resolve GameType
            let gameType: 'MATCHMAKING' | 'ROOM' | 'TOURNAMENT' = 'MATCHMAKING';
            if (gameId && gameId.startsWith('tournament_')) {
              gameType = 'TOURNAMENT';
            } else if (this.roomManager) {
              const room = this.roomManager.getRoomByGameId(gameId);
              if (room) gameType = 'ROOM';
            } else if (gameId && gameId.startsWith('match_')) {
              gameType = 'MATCHMAKING';
            }

            //Save game result via API
            try {
              const response = await fetch(`${process.env.API_URL}/v1/games/result`, {
                method: 'POST',
                headers: {
                  'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                  winnerEmail,
                  loserEmail,
                  gameType,
                  gameId: gameId || 'unknown'
                })
              });

              if (!response.ok) {
                this.fastify.log.warn(`Failed to save game result: ${response.statusText}`);
              } else {
                this.fastify.log.info(`Persisted game result for game ${gameId}: winner=${winnerEmail}, loser=${loserEmail}, type=${gameType}`);
              }
            } catch (err) {
              this.fastify.log.error({ err }, 'Error calling games API to persist result');
            }

            //If this was a room game, update room state to require re-ready
            if (this.roomManager) {
              const room = this.roomManager.getRoomByGameId(gameId);
              if (room && room.status === 'playing') {
                try {
                  this.roomManager.recordGameResult(room.id, winnerEmail);
                } catch (err) {
                  this.fastify.log.error({ err }, 'Failed to update room after game finish');
                }
              }
            }
          } catch (err) {
            this.fastify.log.error({ err }, 'Error persisting game result');
          }
        })();
        
        clearInterval(updateInterval);
        return;
      }
    }, 1000 / 60); //FPS
  }

  /**
   * Broadcasts a message to all players in a game.
   * @param gameId The ID of the game to broadcast to.
   * @param message The message to broadcast.
   * @param excludePlayerId The ID of a player to exclude from the broadcast.
   * @returns 
   */
  private broadcastToGame(gameId: string, message: WebSocketMessage, excludePlayerId?: string): void {
    const game = this.getGame(gameId);
    if (!game) return;

    const gameState = game.getGameState();
    const playerIds = [gameState.players.left, gameState.players.right].filter(Boolean);

    playerIds.forEach(playerId => {
      if (playerId && playerId !== excludePlayerId) {
        const socket = this.playerSockets.get(playerId);
        if (socket) {
          this.sendToSocket(socket, message);
        }
      }
    });
  }

  private sendToSocket(socket: WebSocket, message: WebSocketMessage): void {
    try {
      socket.send(JSON.stringify(message));
    } catch (error) {
      this.fastify.log.error('Error sending WebSocket message:', error as any);
    }
  }

  private sendError(socket: WebSocket, errorMessage: string): void {
    this.sendToSocket(socket, {
      type: 'error',
      data: { message: errorMessage }
    });
  }

  public getActiveGames(): string[] {
    return Array.from(this.games.keys());
  }

  public getGameStats(gameId: string): any {
    const game = this.getGame(gameId);
    if (!game) return null;

    const gameState = game.getGameState();
    return {
      id: gameId,
      status: gameState.gameStatus,
      players: Object.keys(gameState.players).length,
      scores: gameState.scores
    };
  }
}