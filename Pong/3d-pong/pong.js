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
		depth: 0.2
	}, scene);
	paddleOne.position.x = -4;
	paddleOne.position.y = 0.4;
	
	const paddleTwo = BABYLON.MeshBuilder.CreateBox("paddleTwo", {
		size: 1,
		width: 0.2,
		height: 0.8,
		depth: 0.2
	}, scene);
	paddleTwo.position.x = 4;
	paddleTwo.position.y = 0.4;
	
	const ball = BABYLON.MeshBuilder.CreateSphere("ball", {
		diameter: 0.2,
		segments: 16
	}, scene);
	ball.position.x = 0;
	ball.position.y = 0.4;
	ball.position.z = 0;

	const camera = new BABYLON.FreeCamera("camera1", new BABYLON.Vector3(0, 1, -8), scene);
	camera.setTarget(new BABYLON.Vector3(0, 1, 0));
	camera.fov = 1.1;
	//camera.attachControl(canvas, true);

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

	const frontWall = BABYLON.MeshBuilder.CreateGround("frontWall", {
		width: 100,
		height: 100,
		depth: 0.2
	}, scene);
	frontWall.rotation.x = Math.PI / 2;
	frontWall.position.y = 0.5;
	frontWall.position.z = 5;

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

	return scene;
}


window.addEventListener('resize', function () {
	engine.resize();
});
const scene = createScene();

engine.runRenderLoop(function () {
	scene.render();
});