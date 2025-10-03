import * as BABYLON from '@babylonjs/core';
import earcut from 'earcut';
import { createScene } from './scene/scene';
import { setupScores, updateScoreDisplay, cleanupScores, resetScores } from './scene/scores';
import { PongWebSocketClient } from './websocket/pong-client';
import type { PlayerInput } from './websocket/pong.types';

/**
 * Class representing a remote multiplayer Pong game using Babylon.js and WebSocket for real-time communication.
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

  constructor(canvas: HTMLCanvasElement) {
    this.engine = new BABYLON.Engine(canvas, true);
    (window as any).earcut = earcut;
    
    const sceneData = createScene(this.engine);
    this.scene = sceneData.scene;
    this.paddleOne = sceneData.paddleOne;
    this.paddleTwo = sceneData.paddleTwo;
    this.ball = sceneData.ball;
    
    setupScores(this.scene);
    
    this.gameStatusElement = document.getElementById('gameStatus');
    
    this.wsClient = new PongWebSocketClient();
    this.setupWebSocketCallbacks();
    this.setupInputHandlers();
    
    window.addEventListener('resize', () => {
      this.engine.resize();
    });
  }

  private setupWebSocketCallbacks(): void {
    this.wsClient.onConnectionChanged((connected) => {
      console.log('Connection status:', connected);
      if (this.gameStatusElement) {
        this.gameStatusElement.textContent = connected ? 'Connected - Waiting for game...' : 'Connecting...';
      }
    });

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

    this.wsClient.onPlayerAssigned((position) => {
      this.playerPosition = position;
      console.log('Assigned to:', position, 'paddle');
      if (this.gameStatusElement) {
        this.gameStatusElement.textContent = `You are Player ${position === 'left' ? '1' : '2'}`;
      }
    });
  }

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