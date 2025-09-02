import * as BABYLON from '@babylonjs/core';
import earcut from 'earcut';

const canvasEl = document.getElementById('renderCanvas');
if (!(canvasEl instanceof HTMLCanvasElement)) {
    throw new Error("Canvas element not found or not a canvas");
}
const canvas: HTMLCanvasElement = canvasEl;
const engine = new BABYLON.Engine(canvas, true);
(window as any).earcut = earcut; 

const createScene = function () {
	const scene = new BABYLON.Scene(engine);
	
	const camera = new BABYLON.FreeCamera("camera1", new BABYLON.Vector3(0, 1, -8), scene);
	camera.setTarget(new BABYLON.Vector3(0, 1, 0));
	camera.fov = 1.1;
	//camera.attachControl(canvas, true);

	const paddleOne = BABYLON.MeshBuilder.CreateBox("paddleOne", {
		size: 1,
		width: 0.1,
		height: 0.6,
		depth: 0.4
	}, scene);
	paddleOne.position.x = -4;
	paddleOne.position.y = 1;
	const paddleOneMat = new BABYLON.StandardMaterial("paddleOneMat", scene);
	paddleOneMat.diffuseColor = new BABYLON.Color3(0.5, 0.5, 0.5);
	paddleOneMat.emissiveColor = new BABYLON.Color3(0.5, 0.5, 0.5);
	paddleOneMat.backFaceCulling = false;
	paddleOne.material = paddleOneMat;

	const paddleTwo = BABYLON.MeshBuilder.CreateBox("paddleTwo", {
		size: 1,
		width: 0.1,
		height: 0.6,
		depth: 0.4
	}, scene);
	paddleTwo.position.x = 4;
	paddleTwo.position.y = 1;
	const paddleTwoMat = new BABYLON.StandardMaterial("paddleTwoMat", scene);
	paddleTwoMat.diffuseColor = new BABYLON.Color3(0.5, 0.5, 0.5);
	paddleTwoMat.emissiveColor = new BABYLON.Color3(0.5, 0.5, 0.5);
	paddleTwoMat.backFaceCulling = false;
	paddleTwo.material = paddleTwoMat;

	const ball = BABYLON.MeshBuilder.CreateSphere("ball", {
		diameter: 0.2,
		segments: 2
	}, scene);
	ball.position.x = 0;
	ball.position.y = 1;
	ball.position.z = 0;
	const ballMat = new BABYLON.StandardMaterial("ballMat", scene);
	ballMat.diffuseColor = new BABYLON.Color3(0.5, 0.5, 0.5);
	ballMat.emissiveColor = new BABYLON.Color3(0.5, 0.5, 0.5);
	ballMat.backFaceCulling = false;
	ball.material = ballMat;

	const light = new BABYLON.HemisphericLight("light1", new BABYLON.Vector3(0, 1, 0), scene);
	light.intensity = 0.9;

	const ground = BABYLON.MeshBuilder.CreateGround("ground", {
		width: 20,
		height: 20,
	}, scene);
	const groundMat = new BABYLON.StandardMaterial("groundMat", scene);
	groundMat.diffuseColor = new BABYLON.Color3(0.05, 0.05, 0.30);
	ground.position.y = 0;
	ground.material = groundMat;

	const ceilMat = new BABYLON.StandardMaterial("ceilMat", scene);
	ceilMat.diffuseColor = new BABYLON.Color3(0.05, 0.05, 0.30);
	ceilMat.backFaceCulling = false;
	const ceiling = BABYLON.MeshBuilder.CreateGround("ceiling", {
		width: 100,
		height: 100,
	}, scene);
	ceiling.position.y = 3;
	ceiling.material = ceilMat;

	const backWallMat = new BABYLON.StandardMaterial("backWallMat", scene);
	backWallMat.diffuseColor = new BABYLON.Color3(0.05, 0.05, 0.3);
	const backWall = BABYLON.MeshBuilder.CreateBox("backWall", {
		width: 100,
		height: 100,
		depth: 0.2
	}, scene);
	backWall.position.x = 0;
	backWall.position.y = 1;
	backWall.position.z = 4;
	backWall.material = backWallMat;

	const leftWallMat = new BABYLON.StandardMaterial("leftWallMat", scene);
	leftWallMat.diffuseColor = new BABYLON.Color3(0.05, 0.05, 0.90);
	const leftWall = BABYLON.MeshBuilder.CreateBox("leftWall", {
		width: 0.2,
		height: 100,
		depth: 100
	}, scene);
	leftWall.position.x = -5;
	leftWall.position.y = 1;
	leftWall.position.z = 0;
	leftWall.material = leftWallMat;

	const rightWallMat = new BABYLON.StandardMaterial("rightWallMat", scene);
	rightWallMat.diffuseColor = new BABYLON.Color3(0.05, 0.05, 0.90);
	const rightWall = BABYLON.MeshBuilder.CreateBox("rightWall", {
		width: 0.2,
		height: 100,
		depth: 100
	}, scene);
	rightWall.position.x = 5;
	rightWall.position.y = 1;
	rightWall.position.z = 0;
	rightWall.material = rightWallMat;

	return {
		scene,
		paddleOne,
		paddleTwo,
		ball
	};
}

window.addEventListener('resize', function () {
	engine.resize();
});
const { scene, paddleOne, paddleTwo, ball } = createScene();

engine.runRenderLoop(function () {
    scene.render();
});

let paddleOneY = 1;
let paddleTwoY = 1;
const paddleSpeed = 0.08;
const keysPressed: { [key: string]: boolean } = {};

window.addEventListener('keydown', (event) => {
    keysPressed[event.key] = true;
});

window.addEventListener('keyup', (event) => {
    keysPressed[event.key] = false;
});

function handlePaddleInput() {
	if (keysPressed["w"]) {
		paddleOneY -= paddleSpeed;
	}
	if (keysPressed["s"]) {
		paddleOneY += paddleSpeed;
	}
	if (keysPressed["ArrowUp"]) {
		paddleTwoY -= paddleSpeed;
	}
	if (keysPressed["ArrowDown"]) {
		paddleTwoY += paddleSpeed;
	}
	paddleOneY = Math.max(0, Math.min(1 - paddleOne.scaling.y, paddleOneY));
	paddleTwoY = Math.max(0, Math.min(1 - paddleTwo.scaling.y, paddleTwoY));
}

async function sendMove() {
	await fetch("https://localhost:8000/renamePong3D/move", {
		method: 'POST',
		headers: { 'Content-Type': 'application/json' },
		body: JSON.stringify({ paddleOne: paddleOneY, paddleTwo: paddleTwoY }),
	});
}

async function tickGame() {
	await fetch("https://localhost:8000/renamePong3D/tick", {
		method: 'POST',
		headers: { 'Content-Type': 'application/json' },
		body: JSON.stringify({ paddleOne: paddleOneY, paddleTwo: paddleTwoY }),
	});
}

async function getGameState() {
	const result = await fetch("https://localhost:8000/renamePong3D/state");
	return await result.json();
}

async function mainLoop() {
	handlePaddleInput();
	await sendMove();
	await tickGame();
	const gameState = await getGameState();

	paddleOne.position.x = gameState.paddleOne.x;
	paddleOne.position.y = gameState.paddleOne.y;
	paddleOne.position.z = gameState.paddleOne.z;

	paddleTwo.position.x = gameState.paddleTwo.x;
	paddleTwo.position.y = gameState.paddleTwo.y;
	paddleTwo.position.z = gameState.paddleTwo.z;

	ball.position.x = gameState.ball.x;
	ball.position.y = gameState.ball.y;
	ball.position.z = gameState.ball.z;

	window.requestAnimationFrame(mainLoop);
}
mainLoop();