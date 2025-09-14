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

window.addEventListener('resize', function () {
	engine.resize();
});
const { scene, paddleOne, paddleTwo, ball } = createScene();

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

function isColliding(ball, paddle) {
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