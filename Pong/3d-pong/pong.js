import * as BABYLON from '@babylonjs/core';
import { createDefaultImportMeta } from 'vite/module-runner';

const canvas = document.getElementById('renderCanvas');
const engine = new BABYLON.Engine(canvas, true);

const createScene = function () {
	const scene = new BABYLON.Scene(engine);
	
	const paddleOne = BABYLON.MeshBuilder.CreateBox("paddleOne", {
		size: 1,
		width: 0.2,
		height: 0.8,
		depth: 0.8
	}, scene);
	paddleOne.position.x = -4;
	paddleOne.position.y = 1;
	
	const paddleTwo = BABYLON.MeshBuilder.CreateBox("paddleTwo", {
		size: 1,
		width: 0.2,
		height: 0.8,
		depth: 0.8
	}, scene);
	paddleTwo.position.x = 4;
	paddleTwo.position.y = 1;
	
	const ball = BABYLON.MeshBuilder.CreateSphere("ball", {
		diameter: 0.2,
		segments: 16
	}, scene);
	ball.position.x = 0;
	ball.position.y = 1;
	ball.position.z = 0;

	const camera = new BABYLON.FreeCamera("camera1", new BABYLON.Vector3(0, 1, -4), scene);
	camera.setTarget(new BABYLON.Vector3(0, 1, 0));
	camera.fov = 1.2;
	camera.attachControl(canvas, true);

	const light = new BABYLON.HemisphericLight("light1", new BABYLON.Vector3(0, 1, 0), scene);
	light.intensity = 0.9;

	const groundMat = new BABYLON.StandardMaterial("groundMat", scene);
	groundMat.diffuseColor = new BABYLON.Color3(1, 1, 1);
	const ground = BABYLON.MeshBuilder.CreateGround("ground", {
		width: 20,
		height: 20,
	}, scene);
	ground.position.y = 0;
	ground.material = groundMat;

	const ceilMat = new BABYLON.StandardMaterial("ceilMat", scene);
	ceilMat.diffuseColor = new BABYLON.Color3(1, 1, 1);
	ceilMat.backFaceCulling = false;
	const ceiling = BABYLON.MeshBuilder.CreateGround("ceiling", {
		width: 100,
		height: 100,
	}, scene);
	ceiling.position.y = 3;
	ceiling.material = ceilMat;

	const frontWallMat = new BABYLON.StandardMaterial("frontWallMat", scene);
	frontWallMat.diffuseColor = new BABYLON.Color3(1, 0.5, 0);
	frontWallMat.backFaceCulling = false;
	const frontWall = BABYLON.MeshBuilder.CreateBox("frontWall", {
		width: 10,
		height: 100,
		depth: 0.2
	}, scene);
	frontWall.position.x = 0;
	frontWall.position.y = 0.5;
	frontWall.position.z = -4;
	frontWall.material = frontWallMat;

	const backWallMat = new BABYLON.StandardMaterial("backWallMat", scene);
	backWallMat.diffuseColor = new BABYLON.Color3(1, 0, 0);
	const backWall = BABYLON.MeshBuilder.CreateBox("backWall", {
		width: 10,
		height: 100,
		depth: 0.2
	}, scene);
	backWall.position.x = 0;
	backWall.position.y = 1;
	backWall.position.z = 4;
	backWall.material = backWallMat;

	const leftWallMat = new BABYLON.StandardMaterial("leftWallMat", scene);
	leftWallMat.diffuseColor = new BABYLON.Color3(0, 1, 0);
	const leftWall = BABYLON.MeshBuilder.CreateBox("leftWall", {
		width: 0.2,
		height: 100,
		depth: 10
	}, scene);
	leftWall.position.x = -5;
	leftWall.position.y = 1;
	leftWall.position.z = 0;
	leftWall.material = leftWallMat;

	const rightWallMat = new BABYLON.StandardMaterial("rightWallMat", scene);
	rightWallMat.diffuseColor = new BABYLON.Color3(0, 0, 1);
	const rightWall = BABYLON.MeshBuilder.CreateBox("rightWall", {
		width: 0.2,
		height: 100,
		depth: 10
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

engine.runRenderLoop(function () {
	paddleOne.position.y = Math.max(0.4, Math.min(2.6, paddleOne.position.y + paddleSpeed * paddleOneDir));
	paddleTwo.position.y = Math.max(0.4, Math.min(2.6, paddleTwo.position.y + paddleSpeed * paddleTwoDir));

	ball.position.addInPlace(ballVelocity);
	if (ball.position.y < 0.2 || ball.position.y > 2.8) 
		ballVelocity.y *= -1;
	
	if ((ball.position.x < paddleOne.position.x + 0.2 && ball.position.x > paddleOne.position.x - 0.2
	&& Math.abs(ball.position.y - paddleOne.position.y) < 0.5) || (ball.position.x > paddleTwo.position.x - 0.2
	&& ball.position.x < paddleTwo.position.x + 0.2 && Math.abs(ball.position.y - paddleTwo.position.y) < 0.5))
		ballVelocity.x *= -1;

	if (ball.position.x < -4.8 || ball.position.x > 4.8) {
		ball.position.x = 0;
		ball.position.y = 1;
		ball.position.z = 0;
		ballVelocity = new BABYLON.Vector3(0.05 * (Math.random() > 0.5 ? 1 : -1), 0.05 * (Math.random() > 0.5 ? 1 : -1), 0);
	}

	scene.render();
});