
/**
 * 3D Vector representation
 */
export interface Vector3 {
  x: number;
  y: number;
  z: number;
}

/**
 * Paddle representation
 */
export interface Paddle {
  id: string;
  position: Vector3;
  velocity: number;
  size: {
    width: number;
    height: number;
    depth: number;
  };
}

/**
 * Ball representation
 */
export interface Ball {
  position: Vector3;
  velocity: Vector3;
  size: number;
}

/**
 * Game state representation. Includes paddles, ball, scores, and game status.
 */
export interface GameState {
  id: string;
  paddles: {
    left: Paddle;
    right: Paddle;
  };
  ball: Ball;
  scores: {
    left: number;
    right: number;
  };
  gameStatus: 'waiting' | 'playing' | 'paused' | 'finished';
  players: {
    left?: string;
    right?: string;
  };
  bounds: {
    width: number;
    height: number;
    depth: number;
  };
  lastUpdate: number;
}

/**
 * Player input representation
 */
export interface PlayerInput {
  playerId: string;
  direction: 'up' | 'down' | 'stop';
  timestamp: number;
}

/**
 * Game event representation
 */
export interface GameEvent {
  type: 'game_state' | 'player_joined' | 'player_left' | 'goal_scored' | 'game_ended';
  data: any;
  timestamp: number;
}

/**
 * WebSocket message format for client-server communication
 */
export interface WebSocketMessage {
  type: 'join_game' | 'leave_game' | 'player_input' | 'game_state' | 'error' | 'player_joined' | 'player_left';
  gameId?: string;
  playerId?: string;
  data?: any;
}