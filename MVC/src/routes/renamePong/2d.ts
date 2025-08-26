import { FastifyPluginAsync } from "fastify"


/**
 * TENGO QUE REVISAR EL AUTOLOAD DE FASTIFY PORQUE NO ME QUIERE CARGAR LAS RUTAS E IGUAL HAYY QUE METERLO A PELO, 
 * ADEMAS DE ESO TENGO QUE TERMINAR DE CONECTAR EL SERVER SIDE CON EL FRONT
 */


console.log("pong2dRoutes loaded");

const gameState = {
    scoreOne: 0,
    scoreTwo: 0,
    paddleOne: { x: 10, y: 160, width: 15, height: 80, gravity: 2, velocity: 0},
    paddleTwo: { x: 775, y: 160, width: 15, height: 80, gravity: 2, velocity: 0},
    ball: { x: 400, y: 200, width: 15, height: 15, speed: 4, gravity: 1}
}

function movePaddles(input?: { paddleOne?: number, paddleTwo?: number }) {
    if (input && typeof input.paddleOne === "number") {
        gameState.paddleOne.y = Math.max(2, Math.min(400 - gameState.paddleOne.height - 2, input.paddleOne));
    }
    if (input && typeof input.paddleTwo === "number") {
        gameState.paddleTwo.y = Math.max(2, Math.min(400 - gameState.paddleTwo.height - 2, input.paddleTwo));
    }
}

function ballBounce() {
    if (gameState.ball.y + gameState.ball.gravity <= 0 || gameState.ball.y + gameState.ball.gravity + gameState.ball.height >= 400) {
        gameState.ball.gravity = -gameState.ball.gravity;
    }
    gameState.ball.y += gameState.ball.gravity;
    gameState.ball.x += gameState.ball.speed;
    ballWallCollision();
}

function ballWallCollision() {
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

    if (paddleCollision(gameState.paddleTwo)) {
        gameState.ball.speed = -Math.abs(gameState.ball.speed) * 1.1;
        const hitPos = (gameState.ball.y + gameState.ball.height / 2) - gameState.paddleTwo.y;
        const relativeIntersect = hitPos / gameState.paddleTwo.height;
        gameState.ball.gravity = ((relativeIntersect < 0.5 ? -1 : 1) * Math.max(1, Math.abs(gameState.ball.gravity)));
    } else if (paddleCollision(gameState.paddleOne)) {
        gameState.ball.speed = Math.abs(gameState.ball.speed) * 1.1;
        const hitPos = (gameState.ball.y + gameState.ball.height / 2) - gameState.paddleOne.y;
        const relativeIntersect = hitPos / gameState.paddleOne.height;
        gameState.ball.gravity = ((relativeIntersect < 0.5 ? -1 : 1) * Math.max(1, Math.abs(gameState.ball.gravity)));
    } else if (gameState.ball.x + gameState.ball.speed < 0) {
        gameState.scoreTwo += 1;
        gameState.ball.x = 400 - gameState.ball.width / 2;
        gameState.ball.y = 200 - gameState.ball.height / 2;
        gameState.ball.speed = 4;
        gameState.ball.gravity = (Math.random() > 0.5 ? 1 : -1);
        return;
    } else if (gameState.ball.x + gameState.ball.speed > 800) {
        gameState.scoreOne += 1;
        gameState.ball.x = 400 - gameState.ball.width / 2;
        gameState.ball.y = 200 - gameState.ball.height / 2;
        gameState.ball.speed = -4;
        gameState.ball.gravity = (Math.random() > 0.5 ? 1 : -1);
        return;
    }
}

function tickGame(input?: { paddleOne?: number, paddleTwo?: number }) {
    movePaddles(input);
    ballBounce();
}

const pong2dRoutes: FastifyPluginAsync = async (fastify, opts) => {
    fastify.get("/state", async (request, reply) => {
        return gameState;
    });

    fastify.post("/move", async (request, reply) => {
        movePaddles(request.body as { paddleOne?: number, paddleTwo?: number } | undefined);
        return gameState;
    });

    fastify.post("/tick", async (request, reply) => {
        tickGame(request.body as { paddleOne?: number, paddleTwo?: number } | undefined);
        return gameState;
    });

    fastify.post("/reset", async (request, reply) => {
        gameState.scoreOne = 0;
        gameState.scoreTwo = 0;
        gameState.paddleOne.y = 160;
        gameState.paddleTwo.y = 160;
        gameState.ball.x = 400;
        gameState.ball.y = 200;
        gameState.ball.speed = 4;
        gameState.ball.gravity = 4;
        return gameState;
    });

}

export default pong2dRoutes;