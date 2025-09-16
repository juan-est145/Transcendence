import * as BABYLON from '@babylonjs/core';
import earcut from 'earcut';
import { createScene } from './scene/scene';
import { setupScores, incrementScoreOne, incrementScoreTwo } from './scene/scores';

/**
 * + Sets up the BabylonJS engine, creates the scene and contains the game loop with all the game logic
 */
const canvasEl = document.getElementById('renderCanvas');
if (!(canvasEl instanceof HTMLCanvasElement)) {
    throw new Error("Canvas element not found or not a canvas");
}
const canvas: HTMLCanvasElement = canvasEl;
const engine = new BABYLON.Engine(canvas, true);
(window as any).earcut = earcut; 
window.addEventListener('resize', function () {
	engine.resize();
});

export const { scene, paddleOne, paddleTwo, ball } = createScene(engine);
setupScores(scene);

let ballVelocity = new BABYLON.Vector3(0.05, 0.05, 0);
let paddleSpeed = 0.1;
let paddleOneDir = 0;
let paddleTwoDir = 0;
let lastPaddleOneY = paddleOne.position.y;
let lastPaddleTwoY = paddleTwo.position.y;
let lastPaddleOneZ = paddleOne.position.z;
let lastPaddleTwoZ = paddleTwo.position.z;
let paddleOneVelocityY = 0;
let paddleTwoVelocityY = 0;
let paddleOneVelocityZ = 0;
let paddleTwoVelocityZ = 0;

window.addEventListener('keydown', function (event) {
	if (event.key == "w")
		paddleOneDir = 1;
	else if (event.key == "s")
		paddleOneDir = -1;
	else if (event.key == "ArrowUp")
		paddleTwoDir = 1;
	else if (event.key == "ArrowDown")
		paddleTwoDir = -1;
});

window.addEventListener('keyup', function (event) {
	if (event.key == "w" || event.key == "s")
		paddleOneDir = 0;
	else if (event.key == "ArrowUp" || event.key == "ArrowDown")
		paddleTwoDir = 0;
});

/**
 * Checks for ball collision with paddles, walls and checks if it has crossed the scoring borders
 * @param ball 
 * @param paddle 
 * @returns 
 */
function isColliding(ball: BABYLON.Mesh, paddle: BABYLON.Mesh) {
    const paddleHalfWidth = 0.1 / 2;
	const paddleHalfHeight = 0.6 / 2;
	const paddleHalfDepth = 0.4 / 2;
	const paddleMin = paddle.position.subtract(new BABYLON.Vector3(paddleHalfWidth, paddleHalfHeight, paddleHalfDepth));
	const paddleMax = paddle.position.add(new BABYLON.Vector3(paddleHalfWidth, paddleHalfHeight, paddleHalfDepth));
    const ballMin = ball.position.subtract(new BABYLON.Vector3(0.1, 0.1, 0.1));
    const ballMax = ball.position.add(new BABYLON.Vector3(0.1, 0.1, 0.1));

    return (
        ballMin.x <= paddleMax.x && ballMax.x >= paddleMin.x &&
        ballMin.y <= paddleMax.y && ballMax.y >= paddleMin.y &&
        ballMin.z <= paddleMax.z && ballMax.z >= paddleMin.z
    );
}

/**
 * Main game loop, updates positions, checks for collisions and scores and renders the scene
 */
engine.runRenderLoop(function () {
    const paddleMargin = 0.05;
    paddleOneVelocityY = paddleOne.position.y - lastPaddleOneY;
    paddleTwoVelocityY = paddleTwo.position.y - lastPaddleTwoY;
    paddleOneVelocityZ = paddleOne.position.z - lastPaddleOneZ;
    paddleTwoVelocityZ = paddleTwo.position.z - lastPaddleTwoZ;
    lastPaddleOneY = paddleOne.position.y;
    lastPaddleTwoY = paddleTwo.position.y;
    lastPaddleOneZ = paddleOne.position.z;
    lastPaddleTwoZ = paddleTwo.position.z;

    paddleOne.position.y = Math.max(0.4 + paddleMargin, Math.min(2.6 - paddleMargin, paddleOne.position.y + paddleSpeed * paddleOneDir));
    paddleTwo.position.y = Math.max(0.4 + paddleMargin, Math.min(2.6 - paddleMargin, paddleTwo.position.y + paddleSpeed * paddleTwoDir));

    ball.position.addInPlace(ballVelocity);
    if (ball.position.y < 0.2 || ball.position.y > 2.8) 
        ballVelocity.y *= -1;

	/** 
	 * Handles ball collision with paddles, including paddle inertia effect
	 * and increases ball speed slightly on each hit calling isColliding to check and then updating ballVelocity accordingly
	 */
    [paddleOne, paddleTwo].forEach(paddle => {
		if (isColliding(ball, paddle)) {
			const paddleHalfWidth = 0.1 / 2;
			const paddleHalfHeight = 0.6 / 2;
			const paddleHalfDepth = 0.4 / 2;
			const paddleMin = paddle.position.subtract(new BABYLON.Vector3(paddleHalfWidth, paddleHalfHeight, paddleHalfDepth));
			const paddleMax = paddle.position.add(new BABYLON.Vector3(paddleHalfWidth, paddleHalfHeight, paddleHalfDepth));

			let inertiaY = 0, inertiaZ = 0;
			if (paddle === paddleOne) {
				inertiaY = paddleOneVelocityY;
				inertiaZ = paddleOneVelocityZ;
			} else {
				inertiaY = paddleTwoVelocityY;
				inertiaZ = paddleTwoVelocityZ;
			}

			//Have to check if 0.2 is good or if it needs more
			ballVelocity.y += inertiaY * 0.2;
			ballVelocity.z += inertiaZ * 0.2;

			if (paddle === paddleOne) {
				ballVelocity.x = Math.abs(ballVelocity.x) * 1.1;
				ball.position.x = paddleMax.x + 0.11;
			} else {
				ballVelocity.x = -Math.abs(ballVelocity.x) * 1.1;
				ball.position.x = paddleMin.x - 0.11;
			}
		}
	});

	if (ball.position.x < -4.8) {
        incrementScoreTwo();
        ball.position.x = 0;
        ball.position.y = 1;
        ball.position.z = 0;
        ballVelocity = new BABYLON.Vector3(0.05 * (Math.random() > 0.5 ? 1 : -1), 0.05 * (Math.random() > 0.5 ? 1 : -1), 0);
    } else if (ball.position.x > 4.8) {
        incrementScoreOne();
        ball.position.x = 0;
        ball.position.y = 1;
        ball.position.z = 0;
        ballVelocity = new BABYLON.Vector3(-0.05 * (Math.random() > 0.5 ? 1 : -1), 0.05 * (Math.random() > 0.5 ? 1 : -1), 0);
    }

    scene.render();
});