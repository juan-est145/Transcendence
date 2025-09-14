import { FastifyPluginAsync } from "fastify"

console.log("pong2dRoutes loaded");

/*
*
*   I HAVE TO IMPLEMENT SAME PHYSICS AS IN 2D FULL FRONT END PONG, BUT AFTER 3D IS FULLY PORTED TO SERVER SIDE, ALSO HAVE TO CHECK
*   THAT WHEN BALL GOES TO FAST MAY SURPASS PADDLE AND SCORE REGARDLESS OF PADDLE COLLISION
* 
*/


/**
 * Represents the current state of the game and each numeric value of every element in 2d pong
 */
const gameState = {
    scoreOne: 0,
    scoreTwo: 0,
    paddleOne: { x: 10, y: 160, width: 15, height: 80, gravity: 2, velocity: 0},
    paddleTwo: { x: 775, y: 160, width: 15, height: 80, gravity: 2, velocity: 0},
    ball: { x: 400, y: 200, width: 15, height: 15, speed: 4, gravity: 1}
}

/**
 * Moves the paddles based on user input. 
 * @param input - The user input for paddle positions and velocities.
 */
function movePaddles(input?: { paddleOne?: number, paddleTwo?: number , paddleOneVelocity?: number, paddleTwoVelocity?: number}) {

    if (input && typeof input.paddleOne === "number") {
        gameState.paddleOne.y = Math.max(2, Math.min(400 - gameState.paddleOne.height - 2, input.paddleOne));
    }
    if (input && typeof input.paddleTwo === "number") {
        gameState.paddleTwo.y = Math.max(2, Math.min(400 - gameState.paddleTwo.height - 2, input.paddleTwo));
    }

    gameState.paddleOne.velocity = input?.paddleOneVelocity ?? 0;
    gameState.paddleTwo.velocity = input?.paddleTwoVelocity ?? 0;
}

/**
 * Handles the ball's collision with the walls and paddles. Will have into account paddle speed and ball velocity when colliding with walls and paddles, as 
 * well as adjust ball speed acording with paddle speed at time of collision
 * @returns void
 */
function ballWallCollision() {

    /**
     * Checks for a collision between the ball and a paddle. 
     * @param paddle - The paddle to check for collision.
     * @returns True if the ball collides with the paddle, false otherwise.
     */
    function paddleCollision(paddle: typeof gameState.paddleOne | typeof gameState.paddleTwo): boolean {
        const nextBallX = gameState.ball.x + gameState.ball.speed;
        const nextBallY = gameState.ball.y + gameState.ball.gravity;
        return (
            nextBallX < paddle.x + paddle.width &&
            nextBallX + gameState.ball.width > paddle.x &&
            nextBallY < paddle.y + paddle.height &&
            nextBallY + gameState.ball.height > paddle.y
        );
    }

    //This part checks collision of the ball with the walls
    if (gameState.ball.y + gameState.ball.gravity <= 0 || gameState.ball.y + gameState.ball.gravity + gameState.ball.height >= 400) {
        gameState.ball.gravity *= -1;
        gameState.ball.y += gameState.ball.gravity;
        gameState.ball.x += gameState.ball.speed;
    }

    //This part checks collision with each of the paddles individually
    if (paddleCollision(gameState.paddleTwo)) {
        gameState.ball.speed = -Math.abs(gameState.ball.speed) * 1.1;
        const hitPos = (gameState.ball.y + gameState.ball.height / 2) - gameState.paddleTwo.y;
        const relativeIntersect = hitPos / gameState.paddleTwo.height;
        gameState.ball.gravity = ((relativeIntersect < 0.5 ? -1 : 1) * Math.max(1, Math.abs(gameState.ball.gravity))) + gameState.paddleTwo.velocity * 0.5;
    } else if (paddleCollision(gameState.paddleOne)) {
        gameState.ball.speed = Math.abs(gameState.ball.speed) * 1.1;
        const hitPos = (gameState.ball.y + gameState.ball.height / 2) - gameState.paddleOne.y;
        const relativeIntersect = hitPos / gameState.paddleOne.height;
        gameState.ball.gravity = ((relativeIntersect < 0.5 ? -1 : 1) * Math.max(1, Math.abs(gameState.ball.gravity))) + gameState.paddleOne.velocity * 0.5;
    }
 
    //This handles point scoring and resets the ball
    else if (gameState.ball.x + gameState.ball.speed < 0) {
        gameState.scoreTwo += 1;
        gameState.ball.x = 400 - gameState.ball.width / 2;
        gameState.ball.y = 200 - gameState.ball.height / 2;
        gameState.ball.speed = 4;
        gameState.ball.gravity = (Math.random() > 0.5 ? 1 : -1);
        return;
    }
    else if (gameState.ball.x + gameState.ball.speed > 800) {
        gameState.scoreOne += 1;
        gameState.ball.x = 400 - gameState.ball.width / 2;
        gameState.ball.y = 200 - gameState.ball.height / 2;
        gameState.ball.speed = -4;
        gameState.ball.gravity = (Math.random() > 0.5 ? 1 : -1);
        return;
    }
}

/**
 * Updates the game state for each tick.
 * @param input - The user input for the game tick.
 */
function tickGame(input?: { paddleOne?: number, paddleTwo?: number, paddleOneVelocity?: number, paddleTwoVelocity?: number }) {
    movePaddles(input);
    gameState.ball.x += gameState.ball.speed;
    gameState.ball.y += gameState.ball.gravity;
    ballWallCollision();
}

/**
 * Endpoint that handles game state retrieval, as well as paddle and ball movement and tickrate. Also handles resets when necesary
 * @param fastify 
 * @param opts 
 */
const pong2dRoutes: FastifyPluginAsync = async (fastify, opts) => {
    fastify.get("/state", async (request, reply) => {
        return gameState;
    });

    fastify.post("/move", async (request, reply) => {
        movePaddles(request.body as { paddleOne?: number, paddleTwo?: number, paddleOneVelocity?: number, paddleTwoVelocity?: number } | undefined);
        return gameState;
    });

    fastify.post("/tick", async (request, reply) => {
        tickGame(request.body as { paddleOne?: number, paddleTwo?: number, paddleOneVelocity?: number, paddleTwoVelocity?: number } | undefined);
        return gameState;
    });

    fastify.post("/reset", async (request, reply) => {
        gameState.scoreOne = 0;
        gameState.scoreTwo = 0;
        gameState.paddleOne.y = 160;
        gameState.paddleTwo.y = 160;
        gameState.ball.x = 400 - gameState.ball.width / 2;
        gameState.ball.y = 200 - gameState.ball.height / 2;
        gameState.ball.speed = 4;
        gameState.ball.gravity = (Math.random() > 0.5 ? 1 : -1);
        return gameState;
});

}

export default pong2dRoutes;