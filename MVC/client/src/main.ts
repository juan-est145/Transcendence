import { LocalPongGame } from './local-pong';
import { RemotePongGame } from './remote-pong';

class PongGameManager {
  private currentGame: LocalPongGame | RemotePongGame | null = null;
  private canvas: HTMLCanvasElement;
  private gameMode: HTMLElement;
  private gameUI: HTMLElement;

  constructor() {
    this.canvas = document.getElementById('renderCanvas') as HTMLCanvasElement;
    this.gameMode = document.getElementById('gameMode') as HTMLElement;
    this.gameUI = document.getElementById('gameUI') as HTMLElement;

    if (!this.canvas || !this.gameMode || !this.gameUI) {
      throw new Error('Required DOM elements not found');
    }

    this.setupEventListeners();
  }

  private setupEventListeners(): void {
    const localModeBtn = document.getElementById('localMode');
    if (localModeBtn) {
      localModeBtn.addEventListener('click', () => {
        this.startLocalGame();
      });
    }

    const remoteModeBtn = document.getElementById('remoteMode');
    if (remoteModeBtn) {
      remoteModeBtn.addEventListener('click', () => {
        this.startRemoteGame();
      });
    }

    const backToMenuBtn = document.getElementById('backToMenu');
    if (backToMenuBtn) {
      backToMenuBtn.addEventListener('click', () => {
        this.backToMenu();
      });
    }

    window.addEventListener('resize', () => {
      if (this.currentGame && 'engine' in this.currentGame) {
        (this.currentGame as any).engine.resize();
      }
    });
  }

  private startLocalGame(): void {
    console.log('Starting local multiplayer game');
    
    this.gameMode.style.display = 'none';
    this.canvas.style.display = 'block';
    this.gameUI.style.display = 'block';

    this.currentGame = new LocalPongGame(this.canvas);
    this.currentGame.start();

    const gameStatus = document.getElementById('gameStatus');
    if (gameStatus) {
      gameStatus.textContent = 'Local Multiplayer - Player 1: W/S, Player 2: Arrow Keys';
    }
  }

  private startRemoteGame(): void {
    console.log('Starting remote multiplayer game');
    
    this.gameMode.style.display = 'none';
    this.canvas.style.display = 'block';
    this.gameUI.style.display = 'block';

    this.currentGame = new RemotePongGame(this.canvas);
    this.currentGame.start();
  }

  private backToMenu(): void {
    console.log('Returning to main menu');
    
    if (this.currentGame) {
      this.currentGame.stop();
      this.currentGame.destroy();
      this.currentGame = null;
    }

    this.gameMode.style.display = 'flex';
    this.canvas.style.display = 'none';
    this.gameUI.style.display = 'none';

    const gameStatus = document.getElementById('gameStatus');
    if (gameStatus) {
      gameStatus.textContent = '';
    }
  }
}

document.addEventListener('DOMContentLoaded', () => {
  console.log('Initializing 3D Pong Game Manager');
  new PongGameManager();
});