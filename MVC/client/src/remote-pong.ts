import * as BABYLON from '@babylonjs/core';
import earcut from 'earcut';
import { createScene } from './scene/scene';
import { setupScores, updateScoreDisplay, cleanupScores, resetScores } from './scene/scores';
import { PongWebSocketClient } from './websocket/pong-client';
import { hideEndGameScreen } from './scene/end-game';

/**
 * Class representing a remote multiplayer Pong game using Babylon.js and WebSocket for real-time communication.
 * Handles rendering, user input, and game state synchronization with the server.
 */
export class RemotePongGame {
  private engine: BABYLON.Engine;
  private scene: BABYLON.Scene;
  private paddleOne: BABYLON.Mesh;
  private paddleTwo: BABYLON.Mesh;
  private ball: BABYLON.Mesh;
  private wsClient: PongWebSocketClient;
  
  private playerPosition: 'left' | 'right' | null = null;
  private keysPressed: { [key: string]: boolean } = {};
  private gameStatusElement: HTMLElement | null = null;
  private gameEnded = false;
  private pauseCounterElement: HTMLElement | null = null;
  private pauseTimeRemainingElement: HTMLElement | null = null;
  private pauseCountdownInterval: number | null = null;
  private playerInfoElement: HTMLElement | null = null;

  //Initialize the game with the provided canvas element
  constructor(canvas: HTMLCanvasElement) {
    //Create Babylon.js engine and scene
    // Firefox compatibility: Use explicit WebGL context options
    const engineOptions = {
      preserveDrawingBuffer: true,
      stencil: true,
      antialias: true,
      powerPreference: 'high-performance' as WebGLPowerPreference
    };
    this.engine = new BABYLON.Engine(canvas, true, engineOptions);
    //Make earcut available globally for Babylon.js.
    (window as any).earcut = earcut;
    
    //Create the scene and game objects
    const sceneData = createScene(this.engine);
    this.scene = sceneData.scene;
    this.paddleOne = sceneData.paddleOne;
    this.paddleTwo = sceneData.paddleTwo;
    this.ball = sceneData.ball;
    
    setupScores(this.scene);
    
    //Initialize WebSocket client (callbacks will be set up in start())
    this.wsClient = new PongWebSocketClient();
    
    // Initialize DOM elements if ready, otherwise it will be done in start()
    if (document.readyState !== 'loading') {
      this.initializeDOMElements();
    }
    
    //Handle window resize events
    window.addEventListener('resize', () => {
      this.engine.resize();
    });
  }

  /**
   * Initialize DOM elements for pause counter and game status
   */
  private initializeDOMElements(): void {
    this.gameStatusElement = document.getElementById('game-message');
    this.playerInfoElement = document.getElementById('player-info');
    this.pauseCounterElement = document.getElementById('pause-counter');
    this.pauseTimeRemainingElement = document.getElementById('pause-time-remaining');
    
    if (this.playerInfoElement) {
      this.playerInfoElement.style.display = 'block';
    }
    if (this.gameStatusElement) {
      this.gameStatusElement.style.display = 'none';
    }
    
    console.log('DOM elements initialized:', {
      gameStatusElement: !!this.gameStatusElement,
      playerInfoElement: !!this.playerInfoElement,
      pauseCounterElement: !!this.pauseCounterElement,
      pauseTimeRemainingElement: !!this.pauseTimeRemainingElement
    });
    
    if (!this.pauseCounterElement) {
      console.error('pause-counter element not found in DOM!');
    }
    if (!this.pauseTimeRemainingElement) {
      console.error('pause-time-remaining element not found in DOM!');
    }
  }

  //Setup WebSocket event callbacks. Handles connection status, game state updates, and player assignment.
  private setupWebSocketCallbacks(): void {
    console.log('Setting up WebSocket callbacks...');
    
    this.wsClient.onConnectionChanged((connected) => {
      console.log('Connection status:', connected);
      if (this.playerInfoElement) {
        this.playerInfoElement.textContent = connected ? 'Connected - Waiting for game...' : 'Connecting...';
      }
    });

    //Update game objects based on server-sent game state
    this.wsClient.onGameStateUpdate((gameState) => {
      console.log('onGameStateUpdate called with gameStatus:', gameState.gameStatus);
      
      if (gameState.ball) {
        this.ball.position.set(gameState.ball.position.x, gameState.ball.position.y, gameState.ball.position.z);
      }
      
      if (gameState.paddles.left) {
        this.paddleOne.position.set(
          gameState.paddles.left.position.x, 
          gameState.paddles.left.position.y, 
          gameState.paddles.left.position.z
        );
      }
      
      if (gameState.paddles.right) {
        this.paddleTwo.position.set(
          gameState.paddles.right.position.x, 
          gameState.paddles.right.position.y, 
          gameState.paddles.right.position.z
        );
      }
      
      updateScoreDisplay(gameState.scores.left, gameState.scores.right);
      
      // Handle pause state
      console.log('Game state:', {
        status: gameState.gameStatus,
        hasPause: !!gameState.pause,
        isPaused: gameState.pause?.isPaused,
        remainingTime: gameState.pause?.remainingTime
      });
      
      if (gameState.gameStatus === 'paused' && gameState.pause && gameState.pause.isPaused) {
        console.log('Game is paused, showing counter. Remaining time:', gameState.pause.remainingTime);
        this.showPauseCounter(gameState.pause.remainingTime ?? 15);
      } else {
        this.hidePauseCounter();
      }
      
      //Check if game has finished
      if (gameState.gameStatus === 'finished' && !this.gameEnded) {
        this.gameEnded = true;
        
        let winner: string;
        let message: string;
        
        //Check if game ended due to forfeit
        if (gameState.forfeit && gameState.forfeit.occurred) {
          winner = gameState.forfeit.winner === 'left' ? 'Player 1' : 'Player 2';
          message = gameState.forfeit.message || `${winner} wins by forfeit!`;
        } else {
          //Normal game end
          winner = gameState.scores.left > gameState.scores.right ? 'Player 1' : 'Player 2';
          message = `${winner} wins!`;
        }
        
        this.ball.setEnabled(false);
        
        //Show win message in floating box (don't show 3D banner for remote play)
        if (this.gameStatusElement) {
          this.gameStatusElement.textContent = message;
          this.gameStatusElement.style.display = 'block';
        }
        
        //Hide player info when game ends
        if (this.playerInfoElement) {
          this.playerInfoElement.textContent = '';
        }
      }
      
      //Update player info at bottom during game. Clear game-message unless game ended.
      if (!this.gameEnded) {
        if (this.playerInfoElement) {
          if (gameState.gameStatus === 'waiting') {
            this.playerInfoElement.textContent = 'Waiting for another player...';
          } else if (gameState.gameStatus === 'playing' || gameState.gameStatus === 'paused') {
            this.playerInfoElement.textContent = this.playerPosition ? `You are Player ${this.playerPosition === 'left' ? '1' : '2'}` : 'Game in progress';
          }
        }
        
        //Clear game-message during normal play
        if (this.gameStatusElement) {
          this.gameStatusElement.textContent = '';
          this.gameStatusElement.style.display = 'none';
        }
      }
    });

    //Handle player assignment from the server
    this.wsClient.onPlayerAssigned((position) => {
      this.playerPosition = position;
      console.log('Assigned to:', position, 'paddle');
      if (this.playerInfoElement) {
        this.playerInfoElement.textContent = `You are Player ${position === 'left' ? '1' : '2'}`;
      }
    });
  }

  //Setup keyboard input handlers for player controls. Sends input events to the server.
  private setupInputHandlers(): void {
    window.addEventListener('keydown', (event) => {
      if (!this.playerPosition || !this.wsClient.isConnected()) return;
      
      const key = event.key.toLowerCase();
      
      if (key === 'escape') {
        if (this.keysPressed[key]) return;
        this.keysPressed[key] = true;
        this.handlePauseToggle();
        return;
      }
      
      if (this.keysPressed[key]) return;
      
      this.keysPressed[key] = true;
      
      let direction: 'up' | 'down' | 'stop' | null = null;
      
      if (this.playerPosition === 'left') {
        if (key === 'w') direction = 'up';
        else if (key === 's') direction = 'down';
      } else if (this.playerPosition === 'right') {
        if (key === 'arrowup') direction = 'up';
        else if (key === 'arrowdown') direction = 'down';
      }
      
      if (direction) {
        //Use the client's sendInput method so the client's internal playerId is used
        this.wsClient.sendInput(direction);
      }
    });

    //Handle keyup events to stop paddle movement
    window.addEventListener('keyup', (event) => {
      if (!this.playerPosition || !this.wsClient.isConnected()) return;
      
      const key = event.key.toLowerCase();
      this.keysPressed[key] = false;
      
      if (key === 'escape') {
        return;
      }
      
      let direction: 'up' | 'down' | 'stop' | null = null;
      
      if (this.playerPosition === 'left') {
        if (key === 'w' || key === 's') {
          direction = 'stop';
        }
      } else if (this.playerPosition === 'right') {
        if (key === 'arrowup' || key === 'arrowdown') {
          direction = 'stop';
        }
      }
      
      if (direction) {
        //Use the client's sendInput method so the client's internal playerId is used
        this.wsClient.sendInput(direction);
      }
    });
  }

  /**
   * Handle pause toggle request
   */
  private handlePauseToggle(): void {
    const gameState = this.wsClient.getGameState();
    
    if (!gameState || gameState.gameStatus === 'finished' || gameState.gameStatus === 'waiting') {
      return;
    }
    
    const isPaused = gameState.pause?.isPaused || false;
    const pausedBy = gameState.pause?.pausedBy;
    
    if (isPaused) {
      //Only the player who paused can unpause
      if (pausedBy === this.playerPosition) {
        this.wsClient.sendUnpauseRequest();
      }
    } else {
      //Any player can pause
      this.wsClient.sendPauseRequest();
    }
  }

  /**
   * Show pause counter with remaining time
   */
  private showPauseCounter(remainingTime: number): void {
    console.log('showPauseCounter called with remainingTime:', remainingTime);
    console.log('pauseCounterElement:', this.pauseCounterElement);
    console.log('pauseTimeRemainingElement:', this.pauseTimeRemainingElement);
    
    if (!this.pauseCounterElement || !this.pauseTimeRemainingElement) {
      console.error('Pause counter elements not found!');
      return;
    }
    
    const timeValue = Math.max(0, Math.ceil(remainingTime));
    this.pauseTimeRemainingElement.textContent = timeValue.toString();
    this.pauseCounterElement.style.display = 'block';
    this.pauseCounterElement.style.visibility = 'visible';
    
    console.log('Pause counter displayed. Current styles:', {
      display: this.pauseCounterElement.style.display,
      visibility: this.pauseCounterElement.style.visibility,
      timeText: this.pauseTimeRemainingElement.textContent
    });
  }

  /**
   * Hide pause counter
   */
  private hidePauseCounter(): void {
    if (!this.pauseCounterElement) return;
    
    this.pauseCounterElement.style.display = 'none';
    this.pauseCounterElement.style.visibility = 'hidden';
  }

  public start(): void {
    console.log('Starting remote multiplayer Pong game');
    console.log('Document readyState:', document.readyState);
    
    //Fetch user email first, then initialize
    const initializeGame = async () => {
      try {
        //Fetch current user info to get email
        const response = await fetch('/pong/current-user');
        if (response.ok) {
          const userData = await response.json();
          console.log('User data fetched:', userData);
          //Update the wsClient with the user email
          this.wsClient = new PongWebSocketClient(undefined, userData.email);
        } else {
          console.warn('Could not fetch user data, continuing without email');
        }
      } catch (error) {
        console.error('Error fetching user data:', error);
      }
      
      waitForDOMAndStart();
    };
    
    //Wait for DOM elements to be available
    const waitForDOMAndStart = () => {
      console.log('Checking for DOM elements...');
      
      const pauseCounterCheck = document.getElementById('pause-counter');
      const pauseTimeCheck = document.getElementById('pause-time-remaining');
      
      console.log('Elements found?', {
        pauseCounter: !!pauseCounterCheck,
        pauseTime: !!pauseTimeCheck
      });
      
      if (!pauseCounterCheck || !pauseTimeCheck) {
        console.log('Elements not found yet, retrying in 50ms...');
        setTimeout(waitForDOMAndStart, 50);
        return;
      }
      
      console.log('DOM elements found! Initializing...');
      this.initializeDOMElements();
      
      //Set up callbacks right before connecting to ensure they exist
      console.log('Setting up callbacks...');
      this.setupWebSocketCallbacks();
      this.setupInputHandlers();
      
      if (this.gameStatusElement) {
        this.gameStatusElement.textContent = 'Connecting to server...';
      }
      
      this.engine.runRenderLoop(() => {
        this.scene.render();
      });
      
      console.log('About to connect WebSocket...');
      this.wsClient.connect();
    };
    
    //Start checking for DOM elements
    initializeGame();
  }

  public stop(): void {
    console.log('Stopping remote multiplayer Pong game');
    
    this.engine.stopRenderLoop();
    this.wsClient.disconnect();
    
    this.playerPosition = null;
    this.keysPressed = {};
    this.gameEnded = false;
    
    //Clear pause countdown if active
    if (this.pauseCountdownInterval) {
      clearInterval(this.pauseCountdownInterval);
      this.pauseCountdownInterval = null;
    }
    
    this.hidePauseCounter();
    
    this.ball.setEnabled(true);
    
    hideEndGameScreen();
    cleanupScores();
    resetScores();
    
    if (this.gameStatusElement) {
      this.gameStatusElement.textContent = '';
    }
  }

  public destroy(): void {
    this.stop();
    this.scene.dispose();
    this.engine.dispose();
  }
}