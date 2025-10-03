export interface Vector3 {
  x: number;
  y: number;
  z: number;
}

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

export interface Ball {
  position: Vector3;
  velocity: Vector3;
  size: number;
}

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

export interface PlayerInput {
  playerId: string;
  direction: 'up' | 'down' | 'stop';
  timestamp: number;
}

export interface GameEvent {
  type: 'game_state' | 'player_joined' | 'player_left' | 'goal_scored' | 'game_ended';
  data: any;
  timestamp: number;
}

export interface WebSocketMessage {
  type: 'join_game' | 'leave_game' | 'player_input' | 'game_state' | 'error' | 'player_joined' | 'player_left';
  gameId?: string;
  playerId?: string;
  data?: any;
}