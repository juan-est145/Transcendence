import * as BABYLON from '@babylonjs/core';
import earcut from 'earcut';
import { createScene } from './scene';

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
const { scene, paddleOne, paddleTwo, ball } = createScene(engine);

let scoreOne = 0;
let scoreTwo = 0;

const scoreOneDT = new BABYLON.DynamicTexture("scoreOneDT", {width:256, height:128}, scene, false);
scoreOneDT.hasAlpha = true;
scoreOneDT.drawText(scoreOne.toString(), 80, 90, "bold 64px 'Press Start 2P', Courier New", "lightgrey", "#010123ff", true);

const scoreTwoDT = new BABYLON.DynamicTexture("scoreTwoDT", {width:256, height:128}, scene, false);
scoreTwoDT.hasAlpha = true;
scoreTwoDT.drawText(scoreTwo.toString(), 80, 90, "bold 64px 'Press Start 2P', Courier New", "lightgrey", "#010123ff", true);

const scoreOnePlane = BABYLON.MeshBuilder.CreatePlane("scoreOnePlane", {width:2, height:1}, scene);
scoreOnePlane.position = new BABYLON.Vector3(-2.5, 1.8, 0.2);
scoreOnePlane.scaling = new BABYLON.Vector3(0.7, 0.7, 1);
const scoreOneMat = new BABYLON.StandardMaterial("scoreOneMat", scene);
scoreOneMat.diffuseTexture = scoreOneDT;
scoreOneMat.emissiveColor = new BABYLON.Color3(1, 1, 1);
scoreOneMat.diffuseColor = new BABYLON.Color3(0.05, 0.05, 0.3);
scoreOneMat.backFaceCulling = false;
scoreOneMat.transparencyMode = BABYLON.Material.MATERIAL_ALPHABLEND;
scoreOnePlane.material = scoreOneMat;

const scoreTwoPlane = BABYLON.MeshBuilder.CreatePlane("scoreTwoPlane", {width:2, height:1}, scene);
scoreTwoPlane.position = new BABYLON.Vector3(2.5, 1.8, 0.2);
scoreTwoPlane.scaling = new BABYLON.Vector3(0.7, 0.7, 1);
const scoreTwoMat = new BABYLON.StandardMaterial("scoreTwoMat", scene);
scoreTwoMat.diffuseTexture = scoreTwoDT;
scoreTwoMat.emissiveColor = new BABYLON.Color3(1, 1, 1);
scoreTwoMat.diffuseColor = new BABYLON.Color3(0.05, 0.05, 0.3);
scoreTwoMat.backFaceCulling = false;
scoreTwoMat.transparencyMode = BABYLON.Material.MATERIAL_ALPHABLEND;
scoreTwoPlane.material = scoreTwoMat;

function updateScores() {
    scoreOneDT.clear();
    scoreOneDT.drawText(scoreOne.toString(), 80, 90, "bold 64px 'Press Start 2P', Courier New", "lightgrey", "#010123ff", true);

    scoreTwoDT.clear();
    scoreTwoDT.drawText(scoreTwo.toString(), 80, 90, "bold 64px 'Press Start 2P', Courier New", "lightgrey", "#010123ff", true);
}

let ballVelocity = new BABYLON.Vector3(0.05, 0.05, 0);
let paddleSpeed = 0.1;
let paddleOneDir = 0;
let paddleTwoDir = 0;

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

let lastPaddleOneY = paddleOne.position.y;
let lastPaddleTwoY = paddleTwo.position.y;
let lastPaddleOneZ = paddleOne.position.z;
let lastPaddleTwoZ = paddleTwo.position.z;
let paddleOneVelocityY = 0;
let paddleTwoVelocityY = 0;
let paddleOneVelocityZ = 0;
let paddleTwoVelocityZ = 0;

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

    [paddleOne, paddleTwo].forEach(paddle => {
		if (isColliding(ball, paddle)) {
			const paddleHalfWidth = 0.1 / 2;
			const paddleHalfHeight = 0.6 / 2;
			const paddleHalfDepth = 0.4 / 2;
			const paddleMin = paddle.position.subtract(new BABYLON.Vector3(paddleHalfWidth, paddleHalfHeight, paddleHalfDepth));
			const paddleMax = paddle.position.add(new BABYLON.Vector3(paddleHalfWidth, paddleHalfHeight, paddleHalfDepth));
			const ballCenterY = ball.position.y;
			const relativeIntersect = (ballCenterY - paddleMin.y) / (paddleMax.y - paddleMin.y);

			let inertiaY = 0, inertiaZ = 0;
			if (paddle === paddleOne) {
				inertiaY = paddleOneVelocityY;
				inertiaZ = paddleOneVelocityZ;
			} else {
				inertiaY = paddleTwoVelocityY;
				inertiaZ = paddleTwoVelocityZ;
			}

			//Have to check if 0.2 is good or if it needs more
			const direction = (relativeIntersect < 0.5 ? -1 : 1);
			ballVelocity.y = direction * Math.abs(ballVelocity.y) + inertiaY * 0.2;

			ballVelocity.z += inertiaZ * 0.5;
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
        scoreTwo++;
        updateScores();
        ball.position.x = 0;
        ball.position.y = 1;
        ball.position.z = 0;
        ballVelocity = new BABYLON.Vector3(0.05 * (Math.random() > 0.5 ? 1 : -1), 0.05 * (Math.random() > 0.5 ? 1 : -1), 0);
    } else if (ball.position.x > 4.8) {
        scoreOne++;
        updateScores();
        ball.position.x = 0;
        ball.position.y = 1;
        ball.position.z = 0;
        ballVelocity = new BABYLON.Vector3(-0.05 * (Math.random() > 0.5 ? 1 : -1), 0.05 * (Math.random() > 0.5 ? 1 : -1), 0);
    }

    scene.render();
});