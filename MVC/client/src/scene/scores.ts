import * as BABYLON from '@babylonjs/core';


let scoreOne = 0;
let scoreTwo = 0;

let scoreOneDT: BABYLON.DynamicTexture;
let scoreTwoDT: BABYLON.DynamicTexture;
let scoreOneCube: BABYLON.Mesh;
let scoreTwoCube: BABYLON.Mesh;

export function setupScores(scene: BABYLON.Scene) {
	scoreOneDT = new BABYLON.DynamicTexture("scoreOneDT", {width:256, height:128}, scene, false);
    scoreOneDT.hasAlpha = true;
    scoreOneDT.drawText(scoreOne.toString(), 100, 100, "bold 64px 'PressStart', Courier New", "lightgrey", "#0b0ba5ff", true);

    scoreTwoDT = new BABYLON.DynamicTexture("scoreTwoDT", {width:256, height:128}, scene, false);
    scoreTwoDT.hasAlpha = true;
    scoreTwoDT.drawText(scoreTwo.toString(), 100, 100, "bold 64px 'PressStart', Courier New", "lightgrey", "#0b0ba5ff", true);

    const scoreOneMat = new BABYLON.StandardMaterial("scoreOneMat", scene);
    scoreOneMat.diffuseTexture = scoreOneDT;
    scoreOneMat.emissiveColor = new BABYLON.Color3(1, 1, 1);
    scoreOneMat.diffuseColor = new BABYLON.Color3(0.05, 0.05, 0.3);
    scoreOneMat.transparencyMode = BABYLON.Material.MATERIAL_ALPHABLEND;

    const scoreTwoMat = new BABYLON.StandardMaterial("scoreTwoMat", scene);
    scoreTwoMat.diffuseTexture = scoreTwoDT;
    scoreTwoMat.emissiveColor = new BABYLON.Color3(1, 1, 1);
    scoreTwoMat.diffuseColor = new BABYLON.Color3(0.05, 0.05, 0.3);
    scoreTwoMat.transparencyMode = BABYLON.Material.MATERIAL_ALPHABLEND;

    const plainMat = new BABYLON.StandardMaterial("plainMat", scene);
    plainMat.diffuseColor = new BABYLON.Color3(0.5, 0.7, 1);

    const multiMatOne = new BABYLON.MultiMaterial("multiMatOne", scene);
    multiMatOne.subMaterials.push(plainMat, scoreOneMat, plainMat, plainMat, plainMat, plainMat);

    scoreOneCube = BABYLON.MeshBuilder.CreateBox("scoreOneCube", {size: 1, width: 2, height: 1, depth: 0.3, faceUV: undefined, faceColors: undefined}, scene);
    scoreOneCube.position = new BABYLON.Vector3(-2, 1.6, 0.9);
    scoreOneCube.scaling = new BABYLON.Vector3(0.7, 0.7, 1);
	scoreOneCube.rotation.x = -Math.PI / 12;
	scoreOneCube.rotation.y = -Math.PI / 8;
    scoreOneCube.material = multiMatOne;
	scoreOneCube.subMeshes = [];
	for (let i = 0; i < 6; i++) {
		scoreOneCube.subMeshes.push(new BABYLON.SubMesh(i, 0, scoreOneCube.getTotalVertices(), i * 6, 6, scoreOneCube));
	}

    const multiMatTwo = new BABYLON.MultiMaterial("multiMatTwo", scene);
    multiMatTwo.subMaterials.push(plainMat, scoreTwoMat, plainMat, plainMat, plainMat, plainMat);

    scoreTwoCube = BABYLON.MeshBuilder.CreateBox("scoreTwoCube", {size: 1, width: 2, height: 1, depth: 0.3, faceUV: undefined, faceColors: undefined}, scene);
    scoreTwoCube.position = new BABYLON.Vector3(2, 1.6, 0.9);
    scoreTwoCube.scaling = new BABYLON.Vector3(0.7, 0.7, 1);
	scoreTwoCube.rotation.x = -Math.PI / 12;
	scoreTwoCube.rotation.y = Math.PI / 8;
    scoreTwoCube.material = multiMatTwo;
	scoreTwoCube.subMeshes = [];
	for (let i = 0; i < 6; i++) {
		scoreTwoCube.subMeshes.push(new BABYLON.SubMesh(i, 0, scoreTwoCube.getTotalVertices(), i * 6, 6, scoreTwoCube));
	}
}

function updateScores() {
	scoreOneDT.clear();
    if (scoreOne < 10)
	    scoreOneDT.drawText(scoreOne.toString(), 100, 100, "bold 64px 'PressStart', Courier New", "lightgrey", "#0b0ba5ff", true);
    else
        scoreOneDT.drawText(scoreOne.toString(), 60, 100, "bold 64px 'PressStart', Courier New", "lightgrey", "#0b0ba5ff", true);

	scoreTwoDT.clear();
    if (scoreTwo < 10)
        scoreTwoDT.drawText(scoreTwo.toString(), 100, 100, "bold 64px 'PressStart', Courier New", "lightgrey", "#0b0ba5ff", true);
    else
        scoreTwoDT.drawText(scoreTwo.toString(), 60, 100, "bold 64px 'PressStart', Courier New", "lightgrey", "#0b0ba5ff", true);
}

export function incrementScoreOne() {
	scoreOne++;
	updateScores();
}

export function incrementScoreTwo() {
	scoreTwo++;
	updateScores();
}