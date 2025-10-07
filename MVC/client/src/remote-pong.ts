import * as BABYLON from '@babylonjs/core';
import earcut from 'earcut';
import { createScene } from './scene/scene';
import { setupScores, updateScoreDisplay, cleanupScores, resetScores } from './scene/scores';
import { PongWebSocketClient } from './websocket/pong-client';
import type { PlayerInput } from './websocket/pong.types';

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

  //Initialize the game with the provided canvas element
  constructor(canvas: HTMLCanvasElement) {
    //Create Babylon.js engine and scene
    this.engine = new BABYLON.Engine(canvas, true);
    //Make earcut available globally for Babylon.js.
    (window as any).earcut = earcut;
    
    //Create the scene and game objects
    const sceneData = createScene(this.engine);
    this.scene = sceneData.scene;
    this.paddleOne = sceneData.paddleOne;
    this.paddleTwo = sceneData.paddleTwo;
    this.ball = sceneData.ball;
    
    setupScores(this.scene);
    
    this.gameStatusElement = document.getElementById('gameStatus');
    
    //Initialize WebSocket client and setup event handlers
    this.wsClient = new PongWebSocketClient();
    this.setupWebSocketCallbacks();
    this.setupInputHandlers();
    
    //Handle window resize events
    window.addEventListener('resize', () => {
      this.engine.resize();
    });
  }

  //Setup WebSocket event callbacks. Handles connection status, game state updates, and player assignment.
  private setupWebSocketCallbacks(): void {
    this.wsClient.onConnectionChanged((connected) => {
      console.log('Connection status:', connected);
      if (this.gameStatusElement) {
        this.gameStatusElement.textContent = connected ? 'Connected - Waiting for game...' : 'Connecting...';
      }
    });

    //Update game objects based on server-sent game state
    this.wsClient.onGameStateUpdate((gameState) => {
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
      
      //Update game status display. Shows waiting, playing, or finished status.
      if (this.gameStatusElement) {
        switch (gameState.gameStatus) {
          case 'waiting':
            this.gameStatusElement.textContent = 'Waiting for another player...';
            break;
          case 'playing':
            this.gameStatusElement.textContent = this.playerPosition ? `You are Player ${this.playerPosition === 'left' ? '1' : '2'}` : 'Game in progress';
            break;
          case 'finished':
            const winner = gameState.scores.left > gameState.scores.right ? 'Player 1' : 'Player 2';
            this.gameStatusElement.textContent = `Game Over! ${winner} wins!`;
            break;
          default:
            this.gameStatusElement.textContent = '';
        }
      }
    });

    //Handle player assignment from the server
    this.wsClient.onPlayerAssigned((position) => {
      this.playerPosition = position;
      console.log('Assigned to:', position, 'paddle');
      if (this.gameStatusElement) {
        this.gameStatusElement.textContent = `You are Player ${position === 'left' ? '1' : '2'}`;
      }
    });
  }

  //Setup keyboard input handlers for player controls. Sends input events to the server.
  private setupInputHandlers(): void {
    window.addEventListener('keydown', (event) => {
      if (!this.playerPosition || !this.wsClient.isConnected()) return;
      
      const key = event.key.toLowerCase();
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
        const input: PlayerInput = {
          playerId: 'player-' + Math.random().toString(36).substr(2, 9),
          direction,
          timestamp: Date.now()
        };
        this.wsClient.sendPlayerInput(input);
      }
    });

    //Handle keyup events to stop paddle movement
    window.addEventListener('keyup', (event) => {
      if (!this.playerPosition || !this.wsClient.isConnected()) return;
      
      const key = event.key.toLowerCase();
      this.keysPressed[key] = false;
      
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
        const input: PlayerInput = {
          playerId: 'player-' + Math.random().toString(36).substr(2, 9),
          direction,
          timestamp: Date.now()
        };
        this.wsClient.sendPlayerInput(input);
      }
    });
  }

  public start(): void {
    console.log('Starting remote multiplayer Pong game');
    
    if (this.gameStatusElement) {
      this.gameStatusElement.textContent = 'Connecting to server...';
    }
    
    this.engine.runRenderLoop(() => {
      this.scene.render();
    });
    
    this.wsClient.connect();
  }

  public stop(): void {
    console.log('Stopping remote multiplayer Pong game');
    
    this.engine.stopRenderLoop();
    this.wsClient.disconnect();
    
    this.playerPosition = null;
    this.keysPressed = {};
    
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