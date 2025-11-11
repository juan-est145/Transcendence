import type { GameState, WebSocketMessage, PlayerInput } from './pong.types';

/**
 * PongWebSocketClient manages the WebSocket connection to the Pong game server.
 * It handles connection states, message sending/receiving, and game state updates.
 * It provides methods to connect, disconnect, send player inputs, and register callbacks for various events.
 */
export class PongWebSocketClient {
  private ws: WebSocket | null = null;
  private gameId: string = 'default-game';
  private playerId: string = 'player-' + Math.random().toString(36).slice(2, 11);
  private userEmail: string | null = null; // User's email for game result tracking
  private playerPosition: 'left' | 'right' | null = null;
  private gameState: GameState | null = null;
  private connectionStatus: 'disconnected' | 'connecting' | 'connected' | 'waiting' = 'disconnected';
  private shouldReconnect: boolean = true;
  
  private gameStateUpdateCallback: ((state: GameState) => void) | null = null;
  private connectionStatusChangeCallback: ((status: string, message: string) => void) | null = null;
  private playerPositionAssignedCallback: ((position: 'left' | 'right') => void) | null = null;

  constructor(playerId?: string, userEmail?: string) {
    this.playerId = playerId || 'player-' + Math.random().toString(36).slice(2, 11);
    this.userEmail = userEmail || null;
    
    // Check if we have a match ID from matchmaking
    const storedMatchId = sessionStorage.getItem('matchId');
    if (storedMatchId) {
      this.gameId = storedMatchId;
    } else {
      // For direct access, let the server assign us to an available game
      this.gameId = 'auto-assign';
    }
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
    
    this.connectionStatus = 'connecting';
    this.shouldReconnect = true;
    this.notifyConnectionStatus('connecting', 'Connecting to server...');
    
    this.ws = new WebSocket(wsUrl);
    
    this.ws.onopen = () => {
      this.connectionStatus = 'waiting';
      this.notifyConnectionStatus('waiting', 'Connected - Joining game...');
      this.joinGame();
    };
    
    this.ws.onmessage = (event) => {
      try {
        const message: WebSocketMessage = JSON.parse(event.data);
        this.handleMessage(message);
      } catch (error) {
        console.error('Error parsing WebSocket message:', error);
      }
    };
    
    this.ws.onclose = () => {
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

  /**
   * Sends player input to the server.
   * @param direction 'up' | 'down' | 'stop'
   * @returns 
   */
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

  public sendPauseRequest(): void {
    if (!this.ws || this.ws.readyState !== WebSocket.OPEN || !this.playerPosition) {
      return;
    }

    this.sendMessage({
      type: 'pause_game',
      gameId: this.gameId,
      playerId: this.playerId
    });
  }

  public sendUnpauseRequest(): void {
    if (!this.ws || this.ws.readyState !== WebSocket.OPEN || !this.playerPosition) {
      return;
    }

    this.sendMessage({
      type: 'unpause_game',
      gameId: this.gameId,
      playerId: this.playerId
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
    }
  }

  private joinGame(): void {
    const message: any = {
      type: 'join_game',
      gameId: this.gameId,
      playerId: this.playerId
    };
    
    // Include userEmail if available
    if (this.userEmail) {
      message.userEmail = this.userEmail;
    }
    
    this.sendMessage(message);
  }

  /**
   * Handles incoming WebSocket messages. 
   * @param message The incoming WebSocket message to handle.
   */
  private handleMessage(message: WebSocketMessage): void {
    switch (message.type) {
      case 'game_state':
        this.handleGameState(message.data);
        break;
      case 'error':
        console.error('Game error:', message.data.message);
        this.notifyConnectionStatus('error', 'Error: ' + message.data.message);
        break;
    }
  }

  /**
   * Handles the current game state received from the server. 
   * @param state The current game state received from the server.
   */
  private handleGameState(state: GameState): void {
    this.gameState = state;
    
    //Assign player position if not already assigned
    if (state.playerPosition && !this.playerPosition) {
      this.playerPosition = state.playerPosition;
      this.connectionStatus = 'connected';
      this.notifyConnectionStatus('connected', `Playing as Player ${this.playerPosition === 'left' ? '1' : '2'}`);
      //Notify position assigned
      if (this.playerPositionAssignedCallback && this.playerPosition) {
        this.playerPositionAssignedCallback(this.playerPosition);
      }
    }

    //Update connection status based on game status
    if (state.gameStatus === 'waiting') {
      this.notifyConnectionStatus('waiting', 'Waiting for another player...');
    } else if (state.gameStatus === 'playing') {
      this.notifyConnectionStatus('connected', `Playing as Player ${this.playerPosition === 'left' ? '1' : '2'}`);
    } else if (state.gameStatus === 'finished') {
      const winner = state.scores.left > state.scores.right ? 'Player 1' : 'Player 2';
      this.notifyConnectionStatus('finished', `Game Over! ${winner} wins!`);
    }

    //Notify game state update
    if (this.gameStateUpdateCallback) {
      this.gameStateUpdateCallback(state);
    }
  }

  //Notify connection status change
  private notifyConnectionStatus(status: string, message: string): void {
    if (this.connectionStatusChangeCallback) {
      this.connectionStatusChangeCallback(status, message);
    }
  }

  public disconnect(): void {
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