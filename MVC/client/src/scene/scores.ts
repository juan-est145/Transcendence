import * as BABYLON from '@babylonjs/core';
import { scene } from '../main';

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

export function incrementScoreOne() {
	scoreOne++;
	updateScores();
}

export function incrementScoreTwo() {
	scoreTwo++;
	updateScores();
}