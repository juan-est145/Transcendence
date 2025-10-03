import { GameState, Ball, Paddle, PlayerInput } from './pong.types';

export class PongGame {
  private gameState: GameState;
  private gameLoop: NodeJS.Timeout | null = null;
  private readonly GAME_SPEED = 1000 / 60; //FPS
  private readonly PADDLE_SPEED = 0.08;
  private readonly BALL_SPEED = 0.04;
  private readonly MAX_SCORE = 11;

  constructor(gameId: string) {
    this.gameState = this.initializeGameState(gameId);
  }

  private initializeGameState(gameId: string): GameState {
    return {
      id: gameId,
      paddles: {
        left: {
          id: 'left',
          position: { x: -4, y: 1, z: 0 },
          velocity: 0,
          size: { width: 0.1, height: 0.6, depth: 0.4 }
        },
        right: {
          id: 'right',
          position: { x: 4, y: 1, z: 0 },
          velocity: 0,
          size: { width: 0.1, height: 0.6, depth: 0.4 }
        }
      },
      ball: {
        position: { x: 0, y: 1, z: 0 },
        velocity: { 
          x: Math.random() > 0.5 ? this.BALL_SPEED : -this.BALL_SPEED, 
          y: (Math.random() - 0.5) * this.BALL_SPEED * 0.5, 
          z: 0 
        },
        size: 0.2
      },
      scores: { left: 0, right: 0 },
      gameStatus: 'waiting',
      players: {},
      bounds: { width: 10, height: 3, depth: 8 },
      lastUpdate: Date.now()
    };
  }

  public getGameState(): GameState {
    return { ...this.gameState };
  }

  public addPlayer(playerId: string): 'left' | 'right' | null {
    if (!this.gameState.players.left) {
      this.gameState.players.left = playerId;
      return 'left';
    } else if (!this.gameState.players.right) {
      this.gameState.players.right = playerId;
      return 'right';
    }
    return null;
  }

  public removePlayer(playerId: string): void {
    if (this.gameState.players.left === playerId) {
      this.gameState.players.left = undefined;
    } else if (this.gameState.players.right === playerId) {
      this.gameState.players.right = undefined;
    }

    if (!this.gameState.players.left && !this.gameState.players.right) {
      this.gameState.gameStatus = 'waiting';
      this.stopGameLoop();
    }
  }

  public handlePlayerInput(input: PlayerInput): boolean {
    const isLeftPlayer = this.gameState.players.left === input.playerId;
    const isRightPlayer = this.gameState.players.right === input.playerId;

    if (!isLeftPlayer && !isRightPlayer) {
      return false;
    }

    const paddle = isLeftPlayer ? this.gameState.paddles.left : this.gameState.paddles.right;
    
    switch (input.direction) {
      case 'up':
        paddle.velocity = this.PADDLE_SPEED;
        break;
      case 'down':
        paddle.velocity = -this.PADDLE_SPEED;
        break;
      case 'stop':
        paddle.velocity = 0;
        break;
    }

    return true;
  }

  public startGame(): void {
    if (this.gameState.players.left && this.gameState.players.right) {
      this.gameState.gameStatus = 'playing';
      this.startGameLoop();
    }
  }

  public pauseGame(): void {
    this.gameState.gameStatus = 'paused';
    this.stopGameLoop();
  }

  private startGameLoop(): void {
    if (this.gameLoop) {
      clearInterval(this.gameLoop);
    }

    console.log(`Starting game loop at ${1000/this.GAME_SPEED} FPS`);
    this.gameLoop = setInterval(() => {
      this.updateGame();
    }, this.GAME_SPEED);
  }

  private stopGameLoop(): void {
    if (this.gameLoop) {
      clearInterval(this.gameLoop);
      this.gameLoop = null;
    }
  }

  private updateGame(): void {
    const now = Date.now();
    const deltaTime = (now - this.gameState.lastUpdate) / 1000;
    this.gameState.lastUpdate = now;

    if (this.gameState.gameStatus !== 'playing') {
      return;
    }

    this.updatePaddle(this.gameState.paddles.left, deltaTime);
    this.updatePaddle(this.gameState.paddles.right, deltaTime);

    this.updateBall(deltaTime);

    this.checkCollisions();

    this.checkGoals();
  }

  private updatePaddle(paddle: Paddle, deltaTime: number): void {
    if (paddle.velocity !== 0) {
      const movementScale = Math.min(deltaTime * 60, 2);
      paddle.position.y += paddle.velocity * movementScale;
      paddle.position.y = Math.max(0.3, Math.min(2.7, paddle.position.y));
    }
  }

  private updateBall(deltaTime: number): void {
    const ball = this.gameState.ball;
    const movementScale = 1.0;
    
    const oldPosition = { ...ball.position };
    
    ball.position.x += ball.velocity.x * movementScale;
    ball.position.y += ball.velocity.y * movementScale;
    ball.position.z = 0;

    if (Math.abs(ball.position.x) > 3.0) {
      console.log('Ball update near paddle:', {
        oldPos: oldPosition,
        newPos: ball.position,
        velocity: ball.velocity
      });
    }

    const ballRadius = ball.size / 2;

    if (ball.position.y - ballRadius <= 0.3 || ball.position.y + ballRadius >= 2.7) {
      ball.velocity.y *= -1;
      ball.position.y = Math.max(0.3 + ballRadius, Math.min(2.7 - ballRadius, ball.position.y));
      console.log('Ball bounced off top/bottom wall');
    }
  }

  private checkCollisions(): void {
    const ball = this.gameState.ball;
    const leftPaddle = this.gameState.paddles.left;
    const rightPaddle = this.gameState.paddles.right;

    if (Math.abs(ball.position.x - leftPaddle.position.x) < 0.5 && Math.abs(ball.velocity.x) > 0) {
      console.log(`Ball approaching left paddle: ballX=${ball.position.x.toFixed(2)}, distance=${Math.abs(ball.position.x - leftPaddle.position.x).toFixed(2)}`);
    }
    if (Math.abs(ball.position.x - rightPaddle.position.x) < 0.5 && Math.abs(ball.velocity.x) > 0) {
      console.log(`Ball approaching right paddle: ballX=${ball.position.x.toFixed(2)}, distance=${Math.abs(ball.position.x - rightPaddle.position.x).toFixed(2)}`);
    }

    if (this.checkBallPaddleCollision(ball, leftPaddle)) {
      console.log('LEFT PADDLE COLLISION DETECTED!', { 
        ballPos: ball.position, 
        ballVel: ball.velocity, 
        paddlePos: leftPaddle.position,
        distance: Math.abs(ball.position.x - leftPaddle.position.x)
      });
      this.addSpinToBall(ball, leftPaddle);
    }

    if (this.checkBallPaddleCollision(ball, rightPaddle)) {
      console.log('RIGHT PADDLE COLLISION DETECTED!', { 
        ballPos: ball.position, 
        ballVel: ball.velocity, 
        paddlePos: rightPaddle.position,
        distance: Math.abs(ball.position.x - rightPaddle.position.x)
      });
      this.addSpinToBall(ball, rightPaddle);
    }
  }

  private checkBallPaddleCollision(ball: Ball, paddle: Paddle): boolean {
    const ballRadius = ball.size / 2;
    const paddleHalfWidth = paddle.size.width / 2;
    const paddleHalfHeight = paddle.size.height / 2;

    const paddleLeft = paddle.position.x - paddleHalfWidth;
    const paddleRight = paddle.position.x + paddleHalfWidth;
    const paddleTop = paddle.position.y + paddleHalfHeight;
    const paddleBottom = paddle.position.y - paddleHalfHeight;

    const collisionTolerance = 0.1;
    const ballLeft = ball.position.x - ballRadius;
    const ballRight = ball.position.x + ballRadius;
    const ballTop = ball.position.y + ballRadius;
    const ballBottom = ball.position.y - ballRadius;

    const overlapX = (ballRight + collisionTolerance) >= paddleLeft && (ballLeft - collisionTolerance) <= paddleRight;
    const overlapY = ballTop >= paddleBottom && ballBottom <= paddleTop;
    
    const hasCollision = overlapX && overlapY;

    if (hasCollision && Math.abs(ball.position.x - paddle.position.x) < 0.3) {
      console.log(`${paddle.id} paddle collision check:`, {
        ballPos: { x: ball.position.x.toFixed(2), y: ball.position.y.toFixed(2) },
        paddlePos: { x: paddle.position.x.toFixed(2), y: paddle.position.y.toFixed(2) },
        overlapX, overlapY,
        ballVelocity: { x: ball.velocity.x.toFixed(3), y: ball.velocity.y.toFixed(3) }
      });
    }
    
    if (hasCollision) {
      const movingTowardsLeft = ball.velocity.x < 0 && paddle.id === 'left' && ball.position.x > paddle.position.x;
      const movingTowardsRight = ball.velocity.x > 0 && paddle.id === 'right' && ball.position.x < paddle.position.x;
      
      const isValidCollision = movingTowardsLeft || movingTowardsRight;
      
      if (isValidCollision) {
        console.log(`VALID COLLISION with ${paddle.id} paddle!`);
        return true;
      } else {
        console.log(`Invalid collision direction with ${paddle.id} paddle (ballX: ${ball.position.x}, paddleX: ${paddle.position.x}, velX: ${ball.velocity.x})`);
      }
    }
    
    return false;
  }

  private addSpinToBall(ball: Ball, paddle: Paddle): void {
    console.log(`Ball collision with ${paddle.id} paddle!`);
    
    const relativeHitY = ball.position.y - paddle.position.y;
    const normalizedHitY = Math.max(-1, Math.min(1, relativeHitY / (paddle.size.height / 2)));
    
    const baseSpeed = this.BALL_SPEED * 1.3;
    ball.velocity.x = paddle.id === 'left' ? baseSpeed : -baseSpeed;
    
    ball.velocity.y = normalizedHitY * baseSpeed * 0.8;
    ball.velocity.z = 0;

    if (Math.abs(paddle.velocity) > 0.001) {
      ball.velocity.y += paddle.velocity * 0.7;
    }
    
    const ballRadius = ball.size / 2;
    const paddleHalfWidth = paddle.size.width / 2;
    const clearanceDistance = 0.12;
    
    if (paddle.id === 'left') {
      ball.position.x = paddle.position.x + paddleHalfWidth + ballRadius + clearanceDistance;
    } else {
      ball.position.x = paddle.position.x - paddleHalfWidth - ballRadius - clearanceDistance;
    }
    
    ball.position.z = 0;
    
    const maxSpeed = this.BALL_SPEED * 3;
    ball.velocity.x = Math.max(-maxSpeed, Math.min(maxSpeed, ball.velocity.x));
    ball.velocity.y = Math.max(-maxSpeed, Math.min(maxSpeed, ball.velocity.y));
    ball.velocity.z = 0;
    console.log(`Ball velocity after collision:`, ball.velocity);
    console.log(`Ball position after collision:`, ball.position);
  }

  private checkGoals(): void {
    const ball = this.gameState.ball;
    
    if (ball.position.x < -5) {
      this.gameState.scores.right++;
      this.resetBall();
      this.checkGameEnd();
    }
    
    if (ball.position.x > 5) {
      this.gameState.scores.left++;
      this.resetBall();
      this.checkGameEnd();
    }
  }

  private resetBall(): void {
    this.gameState.ball.position = { x: 0, y: 1, z: 0 };
    this.gameState.ball.velocity = {
      x: Math.random() > 0.5 ? this.BALL_SPEED * 1.2 : -this.BALL_SPEED * 1.2,
      y: (Math.random() - 0.5) * this.BALL_SPEED * 0.5,
      z: 0
    };
  }

  private checkGameEnd(): void {
    if (this.gameState.scores.left >= this.MAX_SCORE || this.gameState.scores.right >= this.MAX_SCORE) {
      this.gameState.gameStatus = 'finished';
      this.stopGameLoop();
    }
  }

  public destroy(): void {
    this.stopGameLoop();
  }
}