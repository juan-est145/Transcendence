let searchInterval: ReturnType<typeof setInterval> | null = null;
let waitTime = 0;
let isSearching = false;

const idleState = document.getElementById('idle-state');
const searchingState = document.getElementById('searching-state');
const matchFoundState = document.getElementById('match-found-state');

const findMatchBtn = document.getElementById('find-match-btn');
const cancelMatchBtn = document.getElementById('cancel-match-btn');
const waitTimeElement = document.getElementById('wait-time');

//Find match button handler. 
findMatchBtn?.addEventListener('click', async () => {
    console.log('Find match button clicked!');
    try {
        const response = await fetch('/pong/matchmaking/join', {
            method: 'POST',
            credentials: 'same-origin'
        });
        
        console.log('Response status:', response.status);
        const data = await response.json();
        console.log('Response data:', data);
        
        if (data.success) {
            startSearching();
        } else {
            alert(data.error || 'Failed to join matchmaking');
        }
    } catch (error) {
        console.error('Error joining matchmaking:', error);
        alert('Error joining matchmaking queue');
    }
});

//Cancel match button handler
cancelMatchBtn?.addEventListener('click', async () => {
    try {
        const response = await fetch('/pong/matchmaking/leave', {
            method: 'POST',
            credentials: 'same-origin'
        });
        
        const data = await response.json();
        
        if (data.success) {
            stopSearching();
        }
    } catch (error) {
        console.error('Error leaving matchmaking:', error);
    }
});

/**
 * Start searching for a match. Waits for server to notify when a match is found.
 */
function startSearching() {
    isSearching = true;
    waitTime = 0;
    
    //Hide idle, show searching
    idleState?.classList.add('hidden');
    searchingState?.classList.remove('hidden');
    matchFoundState?.classList.add('hidden');
    
    //Start timer
    searchInterval = setInterval(() => {
        waitTime++;
        if (waitTimeElement) {
            waitTimeElement.textContent = waitTime.toString();
        }

        //Check for match every second
        checkMatchStatus();
    }, 1000);
}

async function checkMatchStatus() {
    try {
        const response = await fetch('/pong/matchmaking/status', {
            credentials: 'same-origin'
        });
        const data = await response.json();
        
        if (data.match && data.match.status === 'ready') {
            foundMatch(data.match);
        }
    } catch (error) {
        console.error('Error checking match status:', error);
    }
}

/**
 * Stop searching for a match. Cancels queueing and resets UI.
 */
function stopSearching() {
    isSearching = false;
    
    if (searchInterval) {
        clearInterval(searchInterval);
        searchInterval = null;
    }
    
    waitTime = 0;
    
    //Show idle state
    idleState?.classList.remove('hidden');
    searchingState?.classList.add('hidden');
    matchFoundState?.classList.add('hidden');
}

function foundMatch(matchData: any) {
    if (searchInterval) {
        clearInterval(searchInterval);
        searchInterval = null;
    }
    
    //Hide searching, show match found
    searchingState?.classList.add('hidden');
    matchFoundState?.classList.remove('hidden');
    
    //Set opponent info
    const opponentName = document.getElementById('opponent-name');
    const opponentRank = document.getElementById('opponent-rank');
    
    if (opponentName) opponentName.textContent = matchData.opponent || 'Unknown';
    if (opponentRank) opponentRank.textContent = 'Ready to play!';
    
    //Store match data in sessionStorage for the pong page to use
    sessionStorage.setItem('matchmakingMode', 'true');
    sessionStorage.setItem('matchId', matchData.id || 'default-game');
    
    //Redirect to pong game after 3 seconds
    setTimeout(() => {
        window.location.href = '/pong';
    }, 3000);
}

/**
 * Load active matches from the server. Shows them in the active matches container and score every 5 seconds.
 * @returns 
 */
async function loadActiveMatches() {
    try {
        const response = await fetch('/pong/games', {
            credentials: 'same-origin'
        });
        const data = await response.json();
        
        const container = document.getElementById('active-matches');
        if (!container) return;
        
        if (data.games && data.games.length > 0) {
            container.innerHTML = data.games.map((game: any) => `
                <div class="bg-gray-700 rounded-lg p-4">
                    <div class="flex justify-between items-center">
                        <div>
                            <p class="font-semibold">Match #${game.id}</p>
                            <p class="text-sm text-gray-400">${game.status}</p>
                        </div>
                        <div class="text-right">
                            <p class="text-lg font-bold">${game.scores?.left || 0} - ${game.scores?.right || 0}</p>
                        </div>
                    </div>
                </div>
            `).join('');
        } else {
            container.innerHTML = '<p class="text-gray-400 text-center">No active matches</p>';
        }
    } catch (error) {
        console.error('Error loading active matches:', error);
    }
}

//Load active matches on page load
loadActiveMatches();

//Refresh active matches every 5 seconds
setInterval(loadActiveMatches, 5000);
