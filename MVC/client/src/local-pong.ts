import * as BABYLON from '@babylonjs/core';
import earcut from 'earcut';
import { createScene } from './scene/scene';
import { setupScores, incrementScoreOne, incrementScoreTwo, cleanupScores, resetScores, getScoreOne, getScoreTwo } from './scene/scores';
import { hideEndGameScreen } from './scene/end-game';

/**
 * Class representing a local multiplayer Pong game using Babylon.js.
 * Handles rendering, user input, and game logic for two players on the same machine.
 */
export class LocalPongGame {
  private engine: BABYLON.Engine;
  private scene: BABYLON.Scene;
  private paddleOne: BABYLON.Mesh;
  private paddleTwo: BABYLON.Mesh;
  private ball: BABYLON.Mesh;
  
  private ballVelocity = new BABYLON.Vector3(0.05, 0.05, 0);
  private paddleSpeed = 0.1;
  private gameLoop: number | null = null;
  private readonly MAX_SCORE = 5;
  private gameEnded = false;
  private isPaused = false;
  
  private lastPaddleOneY = 0;
  private lastPaddleOneZ = 0;
  private paddleOneDir = 0;
  private paddleOneVelocityY = 0;
  private paddleOneVelocityZ = 0;
  private lastPaddleTwoY = 0;
  private lastPaddleTwoZ = 0;
  private paddleTwoDir = 0;
  private paddleTwoVelocityY = 0;
  private paddleTwoVelocityZ = 0;

  //Initialize the game with the provided canvas element
  constructor(canvas: HTMLCanvasElement) {
    //Create Babylon.js engine and scene
    //Firefox compatibility: Use explicit WebGL context options
    const engineOptions = {
      preserveDrawingBuffer: true,
      stencil: true,
      antialias: true,
      powerPreference: 'high-performance' as WebGLPowerPreference
    };
    this.engine = new BABYLON.Engine(canvas, true, engineOptions);
    //Make earcut available globally for Babylon.js.
    (window as any).earcut = earcut;
    
    //Create the scene and game objects.
    const sceneData = createScene(this.engine);
    this.scene = sceneData.scene;
    this.paddleOne = sceneData.paddleOne;
    this.paddleTwo = sceneData.paddleTwo;
    this.ball = sceneData.ball;

    setupScores(this.scene);

    this.lastPaddleOneY = this.paddleOne.position.y;
    this.lastPaddleOneZ = this.paddleOne.position.z;
    this.lastPaddleTwoY = this.paddleTwo.position.y;
    this.lastPaddleTwoZ = this.paddleTwo.position.z;

    this.setupInputHandlers();

    window.addEventListener('resize', () => {
      this.engine.resize();
    });
  }

  /**
   * Setup keyboard input handlers for player controls. Sends input events to the server.
   */
  private setupInputHandlers(): void {
    window.addEventListener('keydown', (event) => {
      if (event.key === 'Escape') {
        this.togglePause();
        return;
      }

      if (this.isPaused) {
        return;
      }

      if (event.key === 'w' || event.key === 'W') {
        this.paddleOneDir = 1;
      } else if (event.key === 's' || event.key === 'S') {
        this.paddleOneDir = -1;
      } else if (event.key === 'ArrowUp') {
        this.paddleTwoDir = 1;
      } else if (event.key === 'ArrowDown') {
        this.paddleTwoDir = -1;
      }
    });

    window.addEventListener('keyup', (event) => {
      if (this.isPaused) {
        return;
      }

      if (event.key === 'w' || event.key === 'W' || event.key === 's' || event.key === 'S') {
        this.paddleOneDir = 0;
      } else if (event.key === 'ArrowUp' || event.key === 'ArrowDown') {
        this.paddleTwoDir = 0;
      }
    });
  }

  private togglePause(): void {
    if (this.gameEnded) {
      return;
    }

    this.isPaused = !this.isPaused;

    const pauseCounterElement = document.getElementById('pause-counter');
    const pauseTimeElement = document.querySelector('#pause-counter .pause-time') as HTMLElement;
    
    if (this.isPaused) {
      // Show HTML pause counter (hide timer for local play)
      if (pauseCounterElement) {
        pauseCounterElement.style.display = 'block';
      }
      if (pauseTimeElement) {
        pauseTimeElement.style.display = 'none';
      }
      this.ball.visibility = 0;
    } else {
      if (pauseCounterElement) {
        pauseCounterElement.style.display = 'none';
      }
      if (pauseTimeElement) {
        pauseTimeElement.style.display = 'block';
      }
      this.ball.visibility = 1;
    }
  }

  /**
   * Check for collision between the ball and a paddle. Adjust ball position and velocity if a collision is detected.
   * @param ball 
   * @param paddle 
   * @returns 
   */
  private isColliding(ball: BABYLON.Mesh, paddle: BABYLON.Mesh): boolean {
    const paddleHalfWidth = 0.1 / 2;
    const paddleHalfHeight = 0.6 / 2;
    const paddleHalfDepth = 0.4 / 2;
    const paddleMin = paddle.position.subtract(new BABYLON.Vector3(paddleHalfWidth, paddleHalfHeight, paddleHalfDepth));
    const paddleMax = paddle.position.add(new BABYLON.Vector3(paddleHalfWidth, paddleHalfHeight, paddleHalfDepth));
    const ballMin = ball.position.subtract(new BABYLON.Vector3(0.1, 0.1, 0.1));
    const ballMax = ball.position.add(new BABYLON.Vector3(0.1, 0.1, 0.1));

    if (ball.position.y < 0.22) {
      ball.position.y = 0.22;
      this.ballVelocity.y = Math.abs(this.ballVelocity.y);
    } else if (ball.position.y > 2.78) {
      ball.position.y = 2.78;
      this.ballVelocity.y = -Math.abs(this.ballVelocity.y);
    }

    return (
      ballMin.x <= paddleMax.x && ballMax.x >= paddleMin.x &&
      ballMin.y <= paddleMax.y && ballMax.y >= paddleMin.y &&
      ballMin.z <= paddleMax.z && ballMax.z >= paddleMin.z
    );
  }

  /**
   * Update game state, including paddle and ball positions, handle collisions, and render the scene.
   */
  private updateGame(): void {
    if (this.gameEnded) {
      this.scene.render();
      return;
    }

    if (this.isPaused) {
      this.scene.render();
      return;
    }

    const paddleMargin = 0.05;

    this.paddleOneVelocityY = this.paddleOne.position.y - this.lastPaddleOneY;
    this.paddleOneVelocityZ = this.paddleOne.position.z - this.lastPaddleOneZ;
    this.lastPaddleOneY = this.paddleOne.position.y;
    this.lastPaddleOneZ = this.paddleOne.position.z;
    this.paddleOne.position.y = Math.max(0.4 + paddleMargin, Math.min(2.6 - paddleMargin, this.paddleOne.position.y + this.paddleSpeed * this.paddleOneDir));

    this.paddleTwoVelocityY = this.paddleTwo.position.y - this.lastPaddleTwoY;
    this.paddleTwoVelocityZ = this.paddleTwo.position.z - this.lastPaddleTwoZ;
    this.lastPaddleTwoY = this.paddleTwo.position.y;
    this.lastPaddleTwoZ = this.paddleTwo.position.z;
    this.paddleTwo.position.y = Math.max(0.4 + paddleMargin, Math.min(2.6 - paddleMargin, this.paddleTwo.position.y + this.paddleSpeed * this.paddleTwoDir));

    this.ball.position.addInPlace(this.ballVelocity);

    if (this.ball.position.y < 0.2 || this.ball.position.y > 2.8) {
      this.ballVelocity.y *= -1;
    }

    /**
     * Handle ball and paddle collisions
     */
    [this.paddleOne, this.paddleTwo].forEach(paddle => {
      if (this.isColliding(this.ball, paddle)) {
        const paddleHalfWidth = 0.1 / 2;
        const paddleHalfHeight = 0.6 / 2;
        const paddleHalfDepth = 0.4 / 2;
        const paddleMin = paddle.position.subtract(new BABYLON.Vector3(paddleHalfWidth, paddleHalfHeight, paddleHalfDepth));
        const paddleMax = paddle.position.add(new BABYLON.Vector3(paddleHalfWidth, paddleHalfHeight, paddleHalfDepth));
        const maxVerSpeed = 0.18;

        //Calculate hit point and adjust ball velocity based on paddle movement
        let inertiaY = 0, inertiaZ = 0;
        if (paddle === this.paddleOne) {
          inertiaY = this.paddleOneVelocityY;
          inertiaZ = this.paddleOneVelocityZ;
        } else {
          inertiaY = this.paddleTwoVelocityY;
          inertiaZ = this.paddleTwoVelocityZ;
        }

        //Normalize hit point to range [-1, 1]
        const hitPointY = (this.ball.position.y - paddle.position.y) / paddleHalfHeight;

        //Adjust ball velocity based on hit point and paddle inertia
        if (hitPointY < 0 && inertiaY > 0) {
          this.ballVelocity.y = Math.abs(this.ballVelocity.y) + inertiaY * 0.2;
        } else if (hitPointY > 0 && inertiaY < 0) {
          this.ballVelocity.y = -Math.abs(this.ballVelocity.y) + inertiaY * 0.2;
        } else {
          this.ballVelocity.y += hitPointY * 0.05 + inertiaY * 0.2;
        }
        
        this.ballVelocity.z += inertiaZ * 0.2;

        //Clamp vertical and depth speeds to prevent excessive velocity
        if (Math.abs(this.ballVelocity.y) > maxVerSpeed) {
          this.ballVelocity.y = (this.ballVelocity.y >= 0 ? 1 : -1) * maxVerSpeed;
        }
        if (Math.abs(this.ballVelocity.z) > maxVerSpeed) {
          this.ballVelocity.z = (this.ballVelocity.z >= 0 ? 1 : -1) * maxVerSpeed;
        }

        //Reverse horizontal direction and increase speed, reposition ball outside paddle
        if (paddle === this.paddleOne) {
          this.ballVelocity.x = Math.abs(this.ballVelocity.x) * 1.1;
          this.ball.position.x = paddleMax.x + 0.11;
        } else {
          this.ballVelocity.x = -Math.abs(this.ballVelocity.x) * 1.1;
          this.ball.position.x = paddleMin.x - 0.11;
        }

        if (Math.abs(this.ballVelocity.y) < 0.01) {
          this.ballVelocity.y = (this.ballVelocity.y >= 0 ? 1 : -1) * 0.02;
        }
      }
    });

    if (this.ball.position.x < -4.8) {
      incrementScoreTwo();
      this.checkGameEnd();
      if (!this.gameEnded) {
        this.resetBall();
      }
    } else if (this.ball.position.x > 4.8) {
      incrementScoreOne();
      this.checkGameEnd();
      if (!this.gameEnded) {
        this.resetBall();
      }
    }

    this.scene.render();
  }

  private checkGameEnd(): void {
    const scoreOne = getScoreOne();
    const scoreTwo = getScoreTwo();

    if (scoreOne >= this.MAX_SCORE || scoreTwo >= this.MAX_SCORE) {
      this.gameEnded = true;
      const winner = scoreOne >= this.MAX_SCORE ? 'Player 1' : 'Player 2';
      
      // Stop ball movement and hide it
      this.ballVelocity.set(0, 0, 0);
      this.ball.setEnabled(false);
      
      // Show win message in floating box only (no 3D banner for local play)
      const gameMessageElement = document.getElementById('game-message');
      if (gameMessageElement) {
        gameMessageElement.textContent = `${winner} wins!`;
        gameMessageElement.style.display = 'block';
      }
    }
  }

  private resetBall(): void {
    this.ball.position.x = 0;
    this.ball.position.y = 1;
    this.ball.position.z = 0;
    this.ballVelocity = new BABYLON.Vector3(
      0.05 * (Math.random() > 0.5 ? 1 : -1),
      0.05 * (Math.random() > 0.5 ? 1 : -1),
      0
    );
  }

  public start(): void {
    console.log('Starting local multiplayer Pong game');

    hideEndGameScreen();
    
    const gameMessageElement = document.getElementById('game-message');
    if (gameMessageElement) {
      gameMessageElement.style.display = 'none';
    }

    this.engine.runRenderLoop(() => {
      this.updateGame();
    });
  }

  public stop(): void {
    console.log('Stopping local multiplayer Pong game');
    
    if (this.gameLoop) {
      clearInterval(this.gameLoop);
      this.gameLoop = null;
    }
    
    this.engine.stopRenderLoop();
    
    //Re-enable ball in case it was hidden
    this.ball.setEnabled(true);
    
    hideEndGameScreen();
    
    //Hide HTML pause counter and restore timer visibility
    const pauseCounterElement = document.getElementById('pause-counter');
    const pauseTimeElement = document.querySelector('#pause-counter .pause-time') as HTMLElement;
    
    if (pauseCounterElement) {
      pauseCounterElement.style.display = 'none';
    }
    if (pauseTimeElement) {
      pauseTimeElement.style.display = 'block';
    }
    
    cleanupScores();
    resetScores();

    //Hide game-message
    const gameMessageElement = document.getElementById('game-message');
    if (gameMessageElement) {
      gameMessageElement.textContent = '';
      gameMessageElement.style.display = 'none';
    }
    
    this.gameEnded = false;
    this.isPaused = false;
  }

  public destroy(): void {
    this.stop();
    this.scene.dispose();
    this.engine.dispose();
  }
}