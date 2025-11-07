import * as BABYLON from '@babylonjs/core';

let endGameContainer: BABYLON.Mesh | null = null;
let endGameTexture: BABYLON.DynamicTexture | null = null;

export function hideEndGameScreen(): void {
  if (endGameContainer) {
    endGameContainer.dispose();
    endGameContainer = null;
  }
  if (endGameTexture) {
    endGameTexture.dispose();
    endGameTexture = null;
  }
}
