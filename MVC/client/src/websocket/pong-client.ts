import type { GameState, WebSocketMessage, PlayerInput } from './pong.types';

export class PongWebSocketClient {
  private ws: WebSocket | null = null;
  private gameId: string = 'default-game';
  private playerId: string = 'player-' + Math.random().toString(36).substr(2, 9);
  private playerPosition: 'left' | 'right' | null = null;
  private gameState: GameState | null = null;
  private connectionStatus: 'disconnected' | 'connecting' | 'connected' | 'waiting' = 'disconnected';
  private shouldReconnect: boolean = true;
  
  private gameStateUpdateCallback: ((state: GameState) => void) | null = null;
  private connectionStatusChangeCallback: ((status: string, message: string) => void) | null = null;
  private playerPositionAssignedCallback: ((position: 'left' | 'right') => void) | null = null;

  constructor() {
    console.log('PongWebSocketClient initialized with player ID:', this.playerId);
  }

  public setOnGameStateUpdate(callback: (state: GameState) => void): void {
    this.gameStateUpdateCallback = callback;
  }

  public setOnConnectionStatusChange(callback: (status: string, message: string) => void): void {
    this.connectionStatusChangeCallback = callback;
  }

  public setOnPlayerPositionAssigned(callback: (position: 'left' | 'right') => void): void {
    this.playerPositionAssignedCallback = callback;
  }

  public onConnectionChanged(callback: (connected: boolean) => void): void {
    this.setOnConnectionStatusChange((status) => {
      callback(status === 'connected');
    });
  }

  public onGameStateUpdate(callback: (state: GameState) => void): void {
    this.setOnGameStateUpdate(callback);
  }

  public onPlayerAssigned(callback: (position: 'left' | 'right') => void): void {
    this.setOnPlayerPositionAssigned(callback);
  }

  public isConnected(): boolean {
    return this.connectionStatus === 'connected';
  }

  public sendPlayerInput(input: PlayerInput): void {
    this.sendInput(input.direction);
  }

  public connect(wsUrl?: string): void {
    if (!wsUrl) {
      const protocol = window.location.protocol === 'https:' ? 'wss:' : 'ws:';
      wsUrl = `${protocol}//${window.location.host}/pong/ws`;
    }
    
    console.log('Connecting to WebSocket:', wsUrl);
    this.connectionStatus = 'connecting';
    this.shouldReconnect = true;
    this.notifyConnectionStatus('connecting', 'Connecting to server...');
    
    this.ws = new WebSocket(wsUrl);
    
    this.ws.onopen = () => {
      console.log('WebSocket connected successfully');
      this.connectionStatus = 'waiting';
      this.notifyConnectionStatus('waiting', 'Connected - Joining game...');
      this.joinGame();
    };
    
    this.ws.onmessage = (event) => {
      try {
        const message: WebSocketMessage = JSON.parse(event.data);
        console.log('Received WebSocket message:', message);
        this.handleMessage(message);
      } catch (error) {
        console.error('Error parsing WebSocket message:', error);
      }
    };
    
    this.ws.onclose = (event) => {
      console.log('WebSocket disconnected:', event.code, event.reason);
      this.connectionStatus = 'disconnected';
      
      if (this.shouldReconnect) {
        this.notifyConnectionStatus('disconnected', 'Disconnected - Reconnecting...');
        setTimeout(() => {
          if (this.shouldReconnect) {
            this.connect();
          }
        }, 2000);
      } else {
        this.notifyConnectionStatus('disconnected', 'Disconnected');
      }
    };
    
    this.ws.onerror = (error) => {
      console.error('WebSocket error:', error);
      this.connectionStatus = 'disconnected';
      this.notifyConnectionStatus('disconnected', 'Connection error');
    };
  }

  public sendInput(direction: 'up' | 'down' | 'stop'): void {
    if (!this.ws || this.ws.readyState !== WebSocket.OPEN || !this.playerPosition) {
      return;
    }

    const input: PlayerInput = {
      playerId: this.playerId,
      direction,
      timestamp: Date.now()
    };

    this.sendMessage({
      type: 'player_input',
      data: input
    });
  }

  public getGameState(): GameState | null {
    return this.gameState;
  }

  public getPlayerPosition(): 'left' | 'right' | null {
    return this.playerPosition;
  }

  public getConnectionStatus(): string {
    return this.connectionStatus;
  }

  private sendMessage(message: WebSocketMessage): void {
    if (this.ws && this.ws.readyState === WebSocket.OPEN) {
      this.ws.send(JSON.stringify(message));
    } else {
      console.warn('WebSocket not ready, message not sent:', message);
    }
  }

  private joinGame(): void {
    console.log('Joining game with ID:', this.gameId);
    this.sendMessage({
      type: 'join_game',
      gameId: this.gameId,
      playerId: this.playerId
    });
  }

  private handleMessage(message: WebSocketMessage): void {
    switch (message.type) {
      case 'game_state':
        this.handleGameState(message.data);
        break;
      case 'player_joined':
        console.log('Player joined:', message.data);
        break;
      case 'player_left':
        console.log('Player left:', message.data);
        break;
      case 'error':
        console.error('Game error:', message.data.message);
        this.notifyConnectionStatus('error', 'Error: ' + message.data.message);
        break;
      default:
        console.log('Unknown message type:', message.type);
    }
  }

  private handleGameState(state: GameState): void {
    this.gameState = state;
    
    if (state.playerPosition && !this.playerPosition) {
      this.playerPosition = state.playerPosition;
      console.log('Assigned as player:', this.playerPosition);
      this.connectionStatus = 'connected';
      this.notifyConnectionStatus('connected', `Playing as Player ${this.playerPosition === 'left' ? '1' : '2'}`);
      
      if (this.playerPositionAssignedCallback && this.playerPosition) {
        this.playerPositionAssignedCallback(this.playerPosition);
      }
    }

    if (state.gameStatus === 'waiting') {
      this.notifyConnectionStatus('waiting', 'Waiting for another player...');
    } else if (state.gameStatus === 'playing') {
      this.notifyConnectionStatus('connected', `Playing as Player ${this.playerPosition === 'left' ? '1' : '2'}`);
    } else if (state.gameStatus === 'finished') {
      const winner = state.scores.left > state.scores.right ? 'Player 1' : 'Player 2';
      this.notifyConnectionStatus('finished', `Game Over! ${winner} wins!`);
    }

    if (this.gameStateUpdateCallback) {
      this.gameStateUpdateCallback(state);
    }
  }

  private notifyConnectionStatus(status: string, message: string): void {
    if (this.connectionStatusChangeCallback) {
      this.connectionStatusChangeCallback(status, message);
    }
  }

  public disconnect(): void {
    console.log('Explicitly disconnecting WebSocket client');
    this.shouldReconnect = false;
    
    if (this.ws) {
      this.ws.close();
      this.ws = null;
    }
    
    this.connectionStatus = 'disconnected';
    this.playerPosition = null;
    this.gameState = null;
  }
}