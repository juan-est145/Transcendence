import * as BABYLON from '@babylonjs/core';

let endGameContainer: BABYLON.Mesh | null = null;
let endGameTexture: BABYLON.DynamicTexture | null = null;

/**
 * Creates and displays the end-game screen in the 3D scene
 * @param scene The Babylon.js scene
 * @param winner The winner of the game ('Player 1' or 'Player 2')
 */
export function showEndGameScreen(scene: BABYLON.Scene, winner: string): void {
  // Clean up any existing end-game screen
  cleanupEndGameScreen();

  // Create a container plane for the end-game message
  endGameContainer = BABYLON.MeshBuilder.CreatePlane('endGameContainer', {
    width: 6,
    height: 3
  }, scene);
  endGameContainer.position = new BABYLON.Vector3(0, 1.5, 1);
  endGameContainer.rotation.y = 0;

  // Create dynamic texture for the end-game message
  endGameTexture = new BABYLON.DynamicTexture('endGameTexture', {
    width: 1024,
    height: 512
  }, scene, false);
  endGameTexture.hasAlpha = true;

  // Draw the background
  // Firefox compatibility: Explicitly cast context
  const ctx = endGameTexture.getContext() as CanvasRenderingContext2D;
  ctx.fillStyle = 'rgba(10, 10, 40, 0.95)';
  ctx.fillRect(0, 0, 1024, 512);
  
  // Draw border
  ctx.strokeStyle = 'lightgrey';
  ctx.lineWidth = 8;
  ctx.strokeRect(10, 10, 1004, 492);

  // Draw "GAME OVER" text
  endGameTexture.drawText(
    'GAME OVER',
    null,
    140,
    "bold 60px 'PressStart', Courier New",
    'lightgrey',
    null,
    true,
    true
  );

  // Draw winner text
  endGameTexture.drawText(
    `${winner} WINS!`,
    null,
    250,
    "bold 50px 'PressStart', Courier New",
    '#00ff00',
    null,
    true,
    true
  );

  // Draw instruction text
  endGameTexture.drawText(
    'Return to menu to play again',
    null,
    380,
    "28px 'PressStart', Courier New",
    'lightgrey',
    null,
    true,
    true
  );

  // Create material for the end-game container
  const endGameMaterial = new BABYLON.StandardMaterial('endGameMaterial', scene);
  endGameMaterial.diffuseTexture = endGameTexture;
  endGameMaterial.emissiveColor = new BABYLON.Color3(1, 1, 1);
  endGameMaterial.transparencyMode = BABYLON.Material.MATERIAL_ALPHABLEND;
  endGameMaterial.backFaceCulling = false;
  endGameContainer.material = endGameMaterial;
}

/**
 * Hides and cleans up the end-game screen
 */
export function hideEndGameScreen(): void {
  cleanupEndGameScreen();
}

/**
 * Cleans up all end-game screen resources
 */
function cleanupEndGameScreen(): void {
  if (endGameContainer) {
    endGameContainer.dispose();
    endGameContainer = null;
  }
  if (endGameTexture) {
    endGameTexture.dispose();
    endGameTexture = null;
  }
}

/**
 * Checks if the end-game screen is currently visible
 */
export function isEndGameScreenVisible(): boolean {
  return endGameContainer !== null;
}
