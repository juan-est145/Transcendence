import { LocalPongGame } from './local-pong';
import { RemotePongGame } from './remote-pong';

/**
 * Manages the overall game state, including switching between local and remote multiplayer modes.
 * Handles UI interactions and initializes the appropriate game mode based on user selection.
 */
class PongGameManager {
  private currentGame: LocalPongGame | RemotePongGame | null = null;
  private canvas: HTMLCanvasElement;
  private gameMode: HTMLElement;
  private gameUI: HTMLElement;

  //Initialize the game manager and setup event listeners for UI buttons
  constructor() {
    this.canvas = document.getElementById('renderCanvas') as HTMLCanvasElement;
    this.gameMode = document.getElementById('gameMode') as HTMLElement;
    this.gameUI = document.getElementById('gameUI') as HTMLElement;

    if (!this.canvas || !this.gameMode || !this.gameUI) {
      throw new Error('Required DOM elements not found');
    }

    this.setupEventListeners();
    
    // Check if coming from matchmaking
    this.checkMatchmakingMode();
  }

  //Setup event listeners for UI buttons to switch game modes and return to the main menu
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

    const backToHomeBtn = document.getElementById('backToHome');
    if (backToHomeBtn) {
      backToHomeBtn.addEventListener('click', () => {
        window.location.href = '/';
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

  /**
   * Start a local multiplayer game. Hides the main menu and shows the game canvas and UI.
   */
  private startLocalGame(): void {
    console.log('Starting local multiplayer game');
    
    // Test WebGL support before starting (Firefox compatibility)
    if (!this.testWebGLSupport()) {
      alert('WebGL is not supported or enabled in your browser. Please enable WebGL to play.');
      return;
    }
    
    this.gameMode.style.display = 'none';
    this.canvas.style.display = 'block';
    this.gameUI.style.display = 'block';

    try {
      this.currentGame = new LocalPongGame(this.canvas);
      this.currentGame.start();

      const gameStatus = document.getElementById('gameStatus');
      if (gameStatus) {
        gameStatus.textContent = 'Local Multiplayer - Player 1: W/S, Player 2: Arrow Keys';
      }
    } catch (error) {
      console.error('Error starting local game:', error);
      alert('Failed to start the game. Please check your browser console for details.');
      this.backToMenu();
    }
  }

  private startRemoteGame(): void {
    console.log('Starting remote multiplayer game');
    
    // Test WebGL support before starting (Firefox compatibility)
    if (!this.testWebGLSupport()) {
      alert('WebGL is not supported or enabled in your browser. Please enable WebGL to play.');
      return;
    }
    
    this.gameMode.style.display = 'none';
    this.canvas.style.display = 'block';
    this.gameUI.style.display = 'block';

    try {
      this.currentGame = new RemotePongGame(this.canvas);
      this.currentGame.start();
    } catch (error) {
      console.error('Error starting remote game:', error);
      alert('Failed to start the game. Please check your browser console for details.');
      this.backToMenu();
    }
  }

  private testWebGLSupport(): boolean {
    try {
      const canvas = document.createElement('canvas');
      const gl = canvas.getContext('webgl2') || canvas.getContext('webgl') || canvas.getContext('experimental-webgl');
      return !!gl;
    } catch (e) {
      return false;
    }
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

  /**
   * Check if the page was loaded from matchmaking and automatically start remote game
   */
  private checkMatchmakingMode(): void {
    const isFromMatchmaking = sessionStorage.getItem('matchmakingMode');
    
    if (isFromMatchmaking === 'true') {
      console.log('Starting remote game from matchmaking');
      // Clear the flag
      sessionStorage.removeItem('matchmakingMode');
      
      // Automatically start remote game
      this.startRemoteGame();
    }
  }
}

document.addEventListener('DOMContentLoaded', () => {
  console.log('Initializing 3D Pong Game Manager');
  new PongGameManager();
});