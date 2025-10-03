import { PongGame } from './pong.game';
import { WebSocketMessage, PlayerInput } from './pong.types';
import { FastifyInstance } from 'fastify';

export class PongGameManager {
  private games: Map<string, PongGame> = new Map();
  private playerSockets: Map<string, any> = new Map();
  private playerGameMap: Map<string, string> = new Map();
  private socketPlayerMap: Map<any, string> = new Map();

  constructor(private fastify: FastifyInstance) {}

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

  public handleWebSocketConnection(socket: any): void {
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

  private handleWebSocketMessage(socket: any, message: WebSocketMessage): void {
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
      default:
        this.sendError(socket, 'Unknown message type');
    }
  }

  private handleJoinGame(socket: any, message: WebSocketMessage): void {
    const { gameId, playerId } = message;
    
    if (!gameId || !playerId) {
      this.sendError(socket, 'Missing gameId or playerId');
      return;
    }

    if (this.playerGameMap.has(playerId)) {
      this.sendError(socket, 'Player already in a game');
      return;
    }

    let game = this.getGame(gameId);
    if (!game) {
      game = this.createGame(gameId);
    }

    const position = game.addPlayer(playerId);
    if (!position) {
      this.sendError(socket, 'Game is full');
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

  private handleLeaveGame(socket: any, message: WebSocketMessage): void {
    const playerId = this.socketPlayerMap.get(socket);
    if (playerId) {
      this.handlePlayerDisconnect(socket);
    }
  }

  private handlePlayerInput(socket: any, message: WebSocketMessage): void {
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

  private handlePlayerDisconnect(socket: any): void {
    const playerId = this.socketPlayerMap.get(socket);
    if (!playerId) return;

    const gameId = this.playerGameMap.get(playerId);
    if (gameId) {
      const game = this.getGame(gameId);
      if (game) {
        game.removePlayer(playerId);
        
        this.broadcastToGame(gameId, {
          type: 'player_left',
          data: { playerId }
        }, playerId);

        const gameState = game.getGameState();
        if (!gameState.players.left && !gameState.players.right) {
          this.removeGame(gameId);
        }
      }
    }

    this.playerSockets.delete(playerId);
    this.playerGameMap.delete(playerId);
    this.socketPlayerMap.delete(socket);
  }

  private startGameStateUpdates(gameId: string): void {
    const updateInterval = setInterval(() => {
      const game = this.getGame(gameId);
      if (!game) {
        clearInterval(updateInterval);
        return;
      }

      const gameState = game.getGameState();
      
      if (gameState.gameStatus === 'finished' || 
          (!gameState.players.left && !gameState.players.right)) {
        clearInterval(updateInterval);
        return;
      }

      this.broadcastToGame(gameId, {
        type: 'game_state',
        data: gameState
      });
    }, 1000 / 60); //FPS
  }

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

  private sendToSocket(socket: any, message: WebSocketMessage): void {
    try {
      socket.send(JSON.stringify(message));
    } catch (error) {
      this.fastify.log.error('Error sending WebSocket message:', error as any);
    }
  }

  private sendError(socket: any, errorMessage: string): void {
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