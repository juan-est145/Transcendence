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
    
    // Check if coming from matchmaking/rooms (has matchId in sessionStorage)
    this.checkOnlineMode();
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
        // Always go back to home page and clean up session storage
        sessionStorage.removeItem('matchId');
        sessionStorage.removeItem('matchmakingMode');
        sessionStorage.removeItem('tournamentMode');
        window.location.href = '/';
      });
    }

    window.addEventListener('resize', () => {
      if (this.currentGame && 'engine' in this.currentGame) {
        (this.currentGame as any).engine.resize();
      }
    });
  }

  /**
   * Start a local multiplayer game with a 5-second countdown.
   * Hides the main menu and shows the game canvas and UI.
   */
  private async startLocalGame(): Promise<void> {
    console.log('Starting local multiplayer game');
    
    // Test WebGL support before starting (Firefox compatibility)
    if (!this.testWebGLSupport()) {
      alert('WebGL is not supported or enabled in your browser. Please enable WebGL to play.');
      return;
    }
    
    this.gameMode.style.display = 'none';
    this.canvas.style.display = 'block';
    this.gameUI.style.display = 'block';

    //Show countdown
    const gameMessage = document.getElementById('game-message');
    if (gameMessage) {
      gameMessage.style.display = 'block';
      
      for (let i = 5; i > 0; i--) {
        gameMessage.textContent = `Game starting in ${i}...`;
        await this.sleep(1000);
      }
      
      gameMessage.textContent = 'GO!';
      await this.sleep(500);
      gameMessage.style.display = 'none';
    }

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

  private sleep(ms: number): Promise<void> {
    return new Promise(resolve => setTimeout(resolve, ms));
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
   * Check if the page was loaded from matchmaking/rooms and automatically start remote game
   * For tournaments, show menu to choose local or remote
   * Otherwise, start local game by default
   */
  private checkOnlineMode(): void {
    // Check for matchId from matchmaking or rooms
    const matchId = sessionStorage.getItem('matchId');
    const isFromMatchmaking = sessionStorage.getItem('matchmakingMode');
    const isFromTournament = sessionStorage.getItem('tournamentMode');
    
    if (isFromTournament === 'true') {
      // Tournament mode - let players choose local or remote
      console.log('Tournament mode - showing menu for local/remote choice');
      sessionStorage.removeItem('tournamentMode');
      this.showTournamentMenu();
    } else if (matchId || isFromMatchmaking === 'true') {
      console.log('Starting remote game from online mode');
      // Clear the matchmaking flag
      sessionStorage.removeItem('matchmakingMode');
      
      // Automatically start remote game
      this.startRemoteGame();
    } else {
      // Direct access to /pong - start local game automatically with countdown
      console.log('Starting local game (default mode)');
      this.startLocalGame();
    }
  }

  /**
   * Show menu for tournament players to choose local or remote play
   */
  private showTournamentMenu(): void {
    // Update menu text for tournament
    const title = this.gameMode.querySelector('.game-title');
    if (title) {
      title.textContent = 'TOURNAMENT MATCH';
    }

    const modeDescription = this.gameMode.querySelector('.mode-description');
    if (modeDescription) {
      modeDescription.innerHTML = `
        <p><strong>Local:</strong> Both players on same computer</p>
        <p><strong>Remote:</strong> Play online against opponent</p>
      `;
    }

    // Show remote mode button if hidden
    const remoteModeBtn = document.getElementById('remoteMode');
    if (remoteModeBtn) {
      remoteModeBtn.style.display = 'block';
    }

    // Keep menu visible
    this.gameMode.style.display = 'flex';
  }
}

document.addEventListener('DOMContentLoaded', () => {
  console.log('Initializing 3D Pong Game Manager');
  new PongGameManager();
});