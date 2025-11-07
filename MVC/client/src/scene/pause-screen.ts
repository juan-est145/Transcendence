import * as BABYLON from '@babylonjs/core';

let pauseContainer: BABYLON.Mesh | null = null;
let pauseTexture: BABYLON.DynamicTexture | null = null;

/**
 * Creates and displays the pause screen in the 3D scene for local games
 * @param scene The Babylon.js scene
 */
export function showPauseScreen(scene: BABYLON.Scene): void {
  cleanupPauseScreen();

  pauseContainer = BABYLON.MeshBuilder.CreatePlane('pauseContainer', {
    width: 6,
    height: 3
  }, scene);
  pauseContainer.position = new BABYLON.Vector3(0, 1.5, 1);
  pauseContainer.rotation.y = 0;

  pauseTexture = new BABYLON.DynamicTexture('pauseTexture', {
    width: 1024,
    height: 512
  }, scene, false);
  pauseTexture.hasAlpha = true;

  const ctx = pauseTexture.getContext() as CanvasRenderingContext2D;
  ctx.fillStyle = 'rgba(10, 10, 40, 0.95)';
  ctx.fillRect(0, 0, 1024, 512);
  
  ctx.strokeStyle = 'lightgrey';
  ctx.lineWidth = 8;
  ctx.strokeRect(10, 10, 1004, 492);

  pauseTexture.drawText(
    'PAUSED',
    null,
    200,
    "bold 80px 'PressStart', Courier New",
    '#ffff00',
    null,
    true,
    true
  );

  pauseTexture.drawText(
    'Press ESC to resume',
    null,
    350,
    "32px 'PressStart', Courier New",
    'lightgrey',
    null,
    true,
    true
  );

  const pauseMaterial = new BABYLON.StandardMaterial('pauseMaterial', scene);
  pauseMaterial.diffuseTexture = pauseTexture;
  pauseMaterial.emissiveColor = new BABYLON.Color3(1, 1, 1);
  pauseMaterial.transparencyMode = BABYLON.Material.MATERIAL_ALPHABLEND;
  pauseMaterial.backFaceCulling = false;
  pauseContainer.material = pauseMaterial;
}

export function hidePauseScreen(): void {
  cleanupPauseScreen();
}

function cleanupPauseScreen(): void {
  if (pauseContainer) {
    pauseContainer.dispose();
    pauseContainer = null;
  }
  if (pauseTexture) {
    pauseTexture.dispose();
    pauseTexture = null;
  }
}

export function isPauseScreenVisible(): boolean {
  return pauseContainer !== null;
}
