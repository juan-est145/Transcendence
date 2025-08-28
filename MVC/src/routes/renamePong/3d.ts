import { FastifyPluginAsync } from 'fastify';

console.log("pong3dRoutes loaded");

/**
 * Represents the current state of the game and each numeric value of every element in 2d pong
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

function isColliding(ball, paddle) {
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