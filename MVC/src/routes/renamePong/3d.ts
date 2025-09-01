import { FastifyPluginAsync } from 'fastify';

console.log("pong3dRoutes loaded");

/**
 * Represents the current state of the game and each numeric value of every element in 3d pong
 */
const gameState = {
    scoreOne: 0,
    scoreTwo: 0,
    paddleOne: { x: -4, y: 1, z: 0, width: 0.1, height: 0.6, depth: 0.4, velocityY: 0, velocityZ: 0 },
    paddleTwo: { x: 4, y: 1, z: 0, width: 0.1, height: 0.6, depth: 0.4, velocityY: 0, velocityZ: 0 },
    ball: { x: 0, y: 1, z: 0, radius: 0.1, velocityX: 0.05, velocityY: 0.05, velocityZ: 0 }
};

function movePaddles(input?: { paddleOne?: number, paddleTwo?: number, paddleOneVelocity?: number, paddleTwoVelocity?: number }) {
    if (input && typeof input.paddleOne === "number") {
        gameState.paddleOne.y = Math.max(0, Math.min(1 - gameState.paddleOne.height, input.paddleOne));
    }
    if (input && typeof input.paddleTwo === "number") {
        gameState.paddleTwo.y = Math.max(0, Math.min(1 - gameState.paddleTwo.height, input.paddleTwo));
    }

    gameState.paddleOne.velocityY = input?.paddleOneVelocity ?? 0;
    gameState.paddleTwo.velocityY = input?.paddleTwoVelocity ?? 0;
}

function isColliding(paddle, ball) {
	const paddleMin = {
		x: paddle.x - paddle.width / 2,
		y: paddle.y - paddle.height / 2,
	};
	const paddleMax = {
		x: paddle.x + paddle.width / 2,
		y: paddle.y + paddle.height / 2,
	};
	const ballMin = {
		x: ball.x - ball.radius,
		y: ball.y - ball.radius,
	};
	const ballMax = {
		x: ball.x + ball.radius,
		y: ball.y + ball.radius,
	};

	return (
		ballMax.x >= paddleMin.x &&
		ballMin.x <= paddleMax.x &&
		ballMax.y >= paddleMin.y &&
		ballMin.y <= paddleMax.y
	);
}

function ballWallCollision(){
	if (gameState.ball.y < 0.2 || gameState.ball.y > 2.8) {
		gameState.ball.velocityY *= -1;
	}

	[gameState.paddleOne, gameState.paddleTwo].forEach(paddle => {
		if (isColliding(gameState.ball, paddle)){
			const hitPos = (gameState.ball.y - paddle.y) + paddle.height / 2;
			const relativeIntersect = hitPos / paddle.height;
			const direction = (relativeIntersect < 0.5 ? -1 : 1);
			gameState.ball.velocityY = direction * Math.abs(gameState.ball.velocityY);
			if (idx === 0){
				gameState.ball.velocityX = Math.abs(gameState.ball.velocityX);
				gameState.ball.x = paddle.x + paddle.width / 2 + gameState.ball.radius;
			} else {
				gameState.ball.velocityX = -Math.abs(gameState.ball.velocityX);
				gameState.ball.x = paddle.x - paddle.width / 2 - gameState.ball.radius;
			}
		}
	});

	if (gameState.ball.x < -4.8) {
		gameState.scoreTwo++;
		resetBall();
	} else if (gameState.ball.x > 4.8) {
		gameState.scoreOne++;
		resetBall();
	}
}


function resetBall() {
	gameState.ball.x = 0;
	gameState.ball.y = 1;
	gameState.ball.z = 0;
	gameState.ball.velocityX = 0.05;
	gameState.ball.velocityY = 0.05 * (Math.random() > 0.5 ? 1 : -1);
	gameState.ball.velocityZ = 0;
}

function tickGame(input?: { paddleOne?: number, paddleTwo?: number, paddleOneVelocity?: number, paddleTwoVelocity?: number }) {
	movePaddles(input);
	gameState.ball.x += gameState.ball.velocityX;
	gameState.ball.y += gameState.ball.velocityY;
	ballWallCollision();
}

const pong3dRoutes: FastifyPluginAsync = async (fastify, options) => {

	fastify.get('/state', async (request, reply) => {
		return gameState;
	});

	fastify.post("/move", async (request, reply) => {
		movePaddles(request.body as any);
		return gameState;
	});

	fastify.post('/tick', async (request, reply) => {
		tickGame(request.body as any);
		return gameState;
	});

	fastify.post('/reset', async (request, reply) => {
		gameState.scoreOne = 0;
		gameState.scoreTwo = 0;
		gameState.paddleOne.y = 1;
		gameState.paddleTwo.y = 1;
		resetBall();
		return gameState;
	});
};

export default pong3dRoutes;