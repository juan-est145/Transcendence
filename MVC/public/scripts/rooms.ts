//Room management for casual pong matches

interface Room {
  id: string;
  code: string;
  name: string;
  maxScore: number;
  createdBy: string;
  creatorUsername: string;
  players: {
    userId: string;
    username: string;
    ready: boolean;
  }[];
  status: 'waiting' | 'ready' | 'playing' | 'finished';
  gameId?: string;
  isOwner: boolean;
}

let currentRoom: Room | null = null;
let pollInterval: number | null = null;
let currentUserId: string | null = null;
let autoStartTriggered = false;

//Initialize when DOM is loaded
document.addEventListener('DOMContentLoaded', () => {
  initializeRoomSystem();
});

async function initializeRoomSystem() {
  //Get current user info from account.js
  try {
    const response = await fetch('/account/info');
    if (response.ok) {
      const data = await response.json();
      currentUserId = data.email;
    }
  } catch (error) {
    console.error('Failed to get user info:', error);
  }

  await checkCurrentRoom();
  await loadAvailableRooms();
  setupEventListeners();

  //Poll for updates every 2 seconds
  pollInterval = window.setInterval(async () => {
    if (currentRoom) {
      await checkCurrentRoom();
    }
    await loadAvailableRooms();
  }, 2000);
}

function setupEventListeners() {
  const createForm = document.getElementById('create-room-form') as HTMLFormElement;
  createForm?.addEventListener('submit', async (e) => {
    e.preventDefault();
    const formData = new FormData(createForm);
    await createRoom(formData.get('name') as string, parseInt(formData.get('maxScore') as string));
  });

  const joinForm = document.getElementById('join-room-form') as HTMLFormElement;
  joinForm?.addEventListener('submit', async (e) => {
    e.preventDefault();
    const formData = new FormData(joinForm);
    await joinRoomByCode(formData.get('code') as string);
  });

  const roomCodeInput = document.getElementById('room-code') as HTMLInputElement;
  roomCodeInput?.addEventListener('input', (e) => {
    const target = e.target as HTMLInputElement;
    target.value = target.value.toUpperCase();
  });

  document.getElementById('leave-room-btn')?.addEventListener('click', leaveRoom);
  document.getElementById('ready-btn')?.addEventListener('click', setReady);
  document.getElementById('unready-btn')?.addEventListener('click', setUnready);
  document.getElementById('start-game-btn')?.addEventListener('click', startGame);
  document.getElementById('copy-code-btn')?.addEventListener('click', copyRoomCode);
  document.getElementById('refresh-rooms-btn')?.addEventListener('click', loadAvailableRooms);
}

async function createRoom(name: string, maxScore: number) {
  try {
    const response = await fetch('/pong/rooms/create', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ name, maxScore })
    });

    const data = await response.json();
    
    if (response.ok && data.success) {
      currentRoom = data.room;
      showCurrentRoom();
      showNotification('Room created! Share the code with your friend.', 'success');
    } else {
      showNotification(data.error || 'Failed to create room', 'error');
    }
  } catch (error) {
    console.error('Error creating room:', error);
    showNotification('Failed to create room', 'error');
  }
}

async function joinRoomByCode(code: string) {
  try {
    const response = await fetch('/pong/rooms/join-by-code', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ code })
    });

    const data = await response.json();
    
    if (data.success) {
      currentRoom = data.room;
      showCurrentRoom();
      showNotification('Joined room successfully!', 'success');
    } else {
      showNotification(data.error || 'Failed to join room', 'error');
    }
  } catch (error) {
    console.error('Error joining room:', error);
    showNotification('Failed to join room', 'error');
  }
}

async function checkCurrentRoom() {
  try {
    const response = await fetch('/pong/rooms/my-room');
    const data = await response.json();
    
    if (data.success && data.room) {
      currentRoom = data.room;
      showCurrentRoom();
    } else {
      currentRoom = null;
      hideCurrentRoom();
    }
  } catch (error) {
    console.error('Error checking current room:', error);
  }
}

async function leaveRoom() {
  if (!currentRoom) return;

  try {
    const response = await fetch(`/pong/rooms/${currentRoom.id}/leave`, {
      method: 'POST'
    });

    const data = await response.json();
    
    if (data.success) {
      currentRoom = null;
      hideCurrentRoom();
      showNotification('Left room', 'success');
      await loadAvailableRooms();
    }
  } catch (error) {
    console.error('Error leaving room:', error);
    showNotification('Failed to leave room', 'error');
  }
}

async function setReady() {
  if (!currentRoom) return;

  try {
    const response = await fetch(`/pong/rooms/${currentRoom.id}/ready`, {
      method: 'POST'
    });

    const data = await response.json();
    
    if (data.success) {
      await checkCurrentRoom();
    }
  } catch (error) {
    console.error('Error setting ready:', error);
    showNotification('Failed to set ready', 'error');
  }
}

async function setUnready() {
  if (!currentRoom) return;

  try {
    const response = await fetch(`/pong/rooms/${currentRoom.id}/unready`, {
      method: 'POST'
    });

    const data = await response.json();
    
    if (data.success) {
      await checkCurrentRoom();
    }
  } catch (error) {
    console.error('Error setting unready:', error);
    showNotification('Failed to set unready', 'error');
  }
}

async function startGame() {
  if (!currentRoom) return;

  try {
    const response = await fetch(`/pong/rooms/${currentRoom.id}/create-game`, {
      method: 'POST'
    });

    const data = await response.json();
    
    if (data.success && data.gameId) {
      sessionStorage.setItem('matchId', data.gameId);
      window.location.href = '/pong';
    } else {
      showNotification(data.error || 'Failed to start game', 'error');
    }
  } catch (error) {
    console.error('Error starting game:', error);
    showNotification('Failed to start game', 'error');
  }
}

function showCurrentRoom() {
  if (!currentRoom) {
    return;
  }

  const createFormParent = document.getElementById('create-room-form')?.closest('.bg-gray-800');
  const joinFormParent = document.getElementById('join-room-form')?.closest('.bg-gray-800');
  
  if (createFormParent) {
    createFormParent.classList.add('hidden');
  }
  if (joinFormParent) {
    joinFormParent.classList.add('hidden');
  }

  const container = document.getElementById('current-room-container');
  if (container) {
    container.classList.remove('hidden');
  } else {
    console.error('current-room-container element not found');
    return;
  }

  const roomNameEl = document.getElementById('current-room-name');
  const roomCodeEl = document.getElementById('current-room-code');
  
  if (roomNameEl) roomNameEl.textContent = currentRoom.name;
  if (roomCodeEl) roomCodeEl.textContent = currentRoom.code;

  const player1 = currentRoom.players[0];
  if (player1) {
    const player1Name = document.getElementById('player1-name');
    const player1Status = document.getElementById('player1-status');
    if (player1Name) player1Name.textContent = player1.username;
    if (player1Status) {
      player1Status.textContent = player1.ready ? 'Ready ✓' : 'Not Ready';
      player1Status.className = player1.ready ? 'text-sm text-green-400' : 'text-sm text-gray-400';
    }
  }

  const player2 = currentRoom.players[1];
  if (player2) {
    const player2Name = document.getElementById('player2-name');
    const player2Status = document.getElementById('player2-status');
    if (player2Name) player2Name.textContent = player2.username;
    if (player2Status) {
      player2Status.textContent = player2.ready ? 'Ready ✓' : 'Not Ready';
      player2Status.className = player2.ready ? 'text-sm text-green-400' : 'text-sm text-gray-400';
    }
  } else {
    const player2Name = document.getElementById('player2-name');
    const player2Status = document.getElementById('player2-status');
    if (player2Name) player2Name.textContent = 'Waiting...';
    if (player2Status) {
      player2Status.textContent = 'Not Ready';
      player2Status.className = 'text-sm text-gray-400';
    }
  }

  const currentPlayer = currentRoom.players.find(p => p.userId === currentUserId);
  const readyBtn = document.getElementById('ready-btn') as HTMLButtonElement | null;
  const unreadyBtn = document.getElementById('unready-btn') as HTMLButtonElement | null;

  if (readyBtn && unreadyBtn) {
    if (currentPlayer?.ready) {
      readyBtn.classList.add('hidden');
      unreadyBtn.classList.remove('hidden');
    } else {
      readyBtn.classList.remove('hidden');
      unreadyBtn.classList.add('hidden');
    }
  }

  const startGameContainer = document.getElementById('start-game-container');
  if (currentRoom.status === 'ready' && currentRoom.players.length === 2) {
    startGameContainer?.classList.remove('hidden');
    
    if (!autoStartTriggered) {
      autoStartTriggered = true;
      const countdownEl = document.querySelector('#start-game-container p');
      if (countdownEl) {
        let countdown = 3;
        countdownEl.textContent = `Starting in ${countdown}...`;
        
        const countdownInterval = setInterval(() => {
          countdown--;
          if (countdown > 0) {
            countdownEl.textContent = `Starting in ${countdown}...`;
          } else {
            clearInterval(countdownInterval);
            startGame();
          }
        }, 1000);
      } else {
        setTimeout(() => startGame(), 3000);
      }
    }
  } else {
    startGameContainer?.classList.add('hidden');
    autoStartTriggered = false;
  }
}

function hideCurrentRoom() {
  document.getElementById('create-room-form')?.closest('.bg-gray-800')?.classList.remove('hidden');
  document.getElementById('join-room-form')?.closest('.bg-gray-800')?.classList.remove('hidden');
  document.getElementById('current-room-container')?.classList.add('hidden');
}

async function loadAvailableRooms() {
  try {
    const response = await fetch('/pong/rooms/available');
    const data = await response.json();
    
    if (data.success) {
      displayAvailableRooms(data.rooms);
    }
  } catch (error) {
    console.error('Error loading available rooms:', error);
  }
}

function displayAvailableRooms(rooms: any[]) {
  const container = document.getElementById('available-rooms');
  if (!container) {
    console.error('available-rooms container not found');
    return;
  }

  if (!rooms || rooms.length === 0) {
    container.innerHTML = '<p class="text-gray-400 text-center">No available rooms</p>';
    return;
  }

  container.innerHTML = rooms.map(room => `
    <div class="bg-gray-700 rounded-lg p-4">
      <h3 class="font-bold text-lg">${escapeHtml(room.name)}</h3>
      <p class="text-sm text-gray-400">
        Created by ${escapeHtml(room.creatorUsername)} • 
        Players: ${room.playerCount}/2 • 
        Max Score: ${room.maxScore}
      </p>
    </div>
  `).join('');
}

function showNotification(message: string, type: 'success' | 'error') {
  const notification = document.createElement('div');
  notification.className = `fixed top-4 right-4 px-6 py-4 rounded-lg shadow-lg text-white z-50 ${
    type === 'success' ? 'bg-green-600' : 'bg-red-600'
  }`;
  notification.textContent = message;
  
  document.body.appendChild(notification);
  
  setTimeout(() => {
    notification.remove();
  }, 3000); //3 seconds
}

async function copyRoomCode() {
  const codeElement = document.getElementById('current-room-code');
  const notificationElement = document.getElementById('copy-notification');
  
  if (!codeElement) return;
  
  const code = codeElement.textContent || '';
  
  try {
    await navigator.clipboard.writeText(code);
    
    if (notificationElement) {
      notificationElement.classList.remove('hidden');
      setTimeout(() => {
        notificationElement.classList.add('hidden');
      }, 2000);
    }
  } catch (error) {
    console.error('Failed to copy code:', error);
    showNotification('Failed to copy code', 'error');
  }
}

function escapeHtml(text: string): string {
  const div = document.createElement('div');
  div.textContent = text;
  return div.innerHTML;
}

window.addEventListener('beforeunload', () => {
  if (pollInterval) {
    clearInterval(pollInterval);
  }
});
