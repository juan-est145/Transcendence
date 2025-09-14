import * as BABYLON from '@babylonjs/core';

export function createScene (engine: BABYLON.Engine) {
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
	// paddleOne.enableEdgesRendering();
	// paddleOne.edgesWidth = 1.0;
	// paddleOne.edgesColor = new BABYLON.Color4(0, 0, 0, 1);

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
	// paddleTwo.enableEdgesRendering();
	// paddleTwo.edgesWidth = 1.0;
	// paddleTwo.edgesColor = new BABYLON.Color4(1, 1, 1, 1);

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
	// ball.enableEdgesRendering();
	// ball.edgesWidth = 1.0;
	// ball.edgesColor = new BABYLON.Color4(0, 0, 0, 1);

// 	const fieldLineMat = new BABYLON.StandardMaterial("fieldLineMat", scene);
// 	fieldLineMat.diffuseColor = new BABYLON.Color3(1, 1, 1);
// 	fieldLineMat.emissiveColor = new BABYLON.Color3(1, 1, 1);
// 	const fieldTop = BABYLON.MeshBuilder.CreateBox("fieldTop", {
// 		width: 0.07,
// 		height: 9.87,
// 		depth: 0.07
// 	}, scene);
// 	fieldTop.position.x = 0;
// 	fieldTop.rotation.z = BABYLON.Tools.ToRadians(90);
// 	fieldTop.position.y = 2.9;
// 	fieldTop.position.z = 0;
// 	fieldTop.material = fieldLineMat;

// 	const fieldBottom = BABYLON.MeshBuilder.CreateBox("fieldBottom", {
// 		width: 0.07,
// 		height: 9.87,
// 		depth: 0.07
// 	}, scene);
// 	fieldBottom.position.x = 0;
// 	fieldBottom.rotation.z = BABYLON.Tools.ToRadians(90);
// 	fieldBottom.position.y = 0.1;
// 	fieldBottom.position.z = 0;
// 	fieldBottom.material = fieldLineMat;

//    const midLine = BABYLON.MeshBuilder.CreateBox("midLine", {
// 		width: 0.02,
// 		height: 2.8,
// 		depth: 0.04
// 	}, scene);
// 	midLine.position.x = 0;
// 	midLine.position.y = 1.5;
// 	midLine.position.z = 0.05;
// 	midLine.material = fieldLineMat;

// 	const fieldLeft = BABYLON.MeshBuilder.CreateBox("fieldLeft", {
// 		width: 0.07,
// 		height: 2.8,
// 		depth: 0.07
// 	}, scene);
// 	fieldLeft.position.x = -4.9;
// 	fieldLeft.position.y = 1.5;
// 	fieldLeft.position.z = 0;
// 	fieldLeft.material = fieldLineMat;

// 	const fieldRight = BABYLON.MeshBuilder.CreateBox("fieldRight", {
// 		width: 0.07,
// 		height: 2.8,
// 		depth: 0.07
// 	}, scene);
// 	fieldRight.position.x = 4.9;
// 	fieldRight.position.y = 1.5;
// 	fieldRight.position.z = 0;
// 	fieldRight.material = fieldLineMat;


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

	// const frontWallMat = new BABYLON.StandardMaterial("frontWallMat", scene);
	// frontWallMat.diffuseColor = new BABYLON.Color3(0, 0, 0);
	// frontWallMat.backFaceCulling = false;
	// const frontWall = BABYLON.MeshBuilder.CreateBox("frontWall", {
	// 	width: 100,
	// 	height: 100,
	// 	depth: 0.2
	// }, scene);
	// frontWall.position.x = 0;
	// frontWall.position.y = 0.5;
	// frontWall.position.z = -4;
	// frontWall.material = frontWallMat;

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