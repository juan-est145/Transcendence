import * as BABYLON from '@babylonjs/core';
import type { PaddleConstructor } from './scene.type';

/**
 * Creates the main scene with paddles, enviroment and ball, renders it and returns the scene object
 * @param engine 
 * @returns 
 */
export function createScene (engine: BABYLON.Engine) {
	const scene = new BABYLON.Scene(engine);
	
	const camera = new BABYLON.FreeCamera("camera1", new BABYLON.Vector3(0, 1, -8), scene);
	camera.setTarget(new BABYLON.Vector3(0, 1, 0));
	camera.fov = 1.1;

	const paddleOne = createPaddle(scene, {
		paddleName: "paddleOne",
		dimensions: {
			size: 1,
			width: 0.1,
			height: 0.6,
			depth: 0.4,
		},
		positionX: -4,
		positionY: 1
	});

	const paddleTwo = createPaddle(scene, {
		paddleName: "paddleTwo",
		dimensions: {
			size: 1,
			width: 0.1,
			height: 0.6,
			depth: 0.4,
		},
		positionX: 4,
		positionY : 1
	});
	

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

function createPaddle(scene: BABYLON.Scene, constructor: PaddleConstructor) {
	const { size, width, height, depth } = constructor.dimensions;
	const material = createMaterial(scene, constructor.paddleName);
	const paddle = BABYLON.MeshBuilder.CreateBox(constructor.paddleName, {
		size,
		width,
		height,
		depth,
	}, scene);

	paddle.position.x = constructor.positionX;
	paddle.position.y = constructor.positionY;
	paddle.material = material;
	return paddle;
}

function createMaterial(scene: BABYLON.Scene, paddleName: string) {
	const material = new BABYLON.StandardMaterial(`${paddleName}Mat`, scene);
	material.diffuseColor = new BABYLON.Color3(0.5, 0.5, 0.5);
	material.emissiveColor = new BABYLON.Color3(0.5, 0.5, 0.5);
	material.backFaceCulling = false;
	return material;
}

// const paddleTwo = BABYLON.MeshBuilder.CreateBox("paddleTwo", {
// 		size: 1,
// 		width: 0.1,
// 		height: 0.6,
// 		depth: 0.4
// 	}, scene);
// 	paddleTwo.position.x = 4;
// 	paddleTwo.position.y = 1;
// 	const paddleTwoMat = new BABYLON.StandardMaterial("paddleTwoMat", scene);
// 	paddleTwoMat.diffuseColor = new BABYLON.Color3(0.5, 0.5, 0.5);
// 	paddleTwoMat.emissiveColor = new BABYLON.Color3(0.5, 0.5, 0.5);
// 	paddleTwoMat.backFaceCulling = false;
// 	paddleTwo.material = paddleTwoMat;