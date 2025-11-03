const createTournamentBtn = document.getElementById('create-tournament-btn');
const createModal = document.getElementById('create-modal');
const cancelCreateBtn = document.getElementById('cancel-create-btn');
const createTournamentForm = document.getElementById('create-tournament-form');
const bracketView = document.getElementById('bracket-view');
const closeBracketBtn = document.getElementById('close-bracket-btn');
const joinByCodeBtn = document.getElementById('join-by-code-btn');
const joinCodeModal = document.getElementById('join-code-modal');
const cancelJoinCodeBtn = document.getElementById('cancel-join-code-btn');
const joinCodeForm = document.getElementById('join-code-form');

createTournamentBtn?.addEventListener('click', () => {
    console.log('Create tournament button clicked!');
    createModal?.classList.remove('hidden');
});

cancelCreateBtn?.addEventListener('click', () => {
    createModal?.classList.add('hidden');
});

createModal?.addEventListener('click', (e) => {
    if (e.target === createModal) {
        createModal.classList.add('hidden');
    }
});

joinByCodeBtn?.addEventListener('click', () => {
    joinCodeModal?.classList.remove('hidden');
});

cancelJoinCodeBtn?.addEventListener('click', () => {
    joinCodeModal?.classList.add('hidden');
});

joinCodeModal?.addEventListener('click', (e) => {
    if (e.target === joinCodeModal) {
        joinCodeModal.classList.add('hidden');
    }
});

/**
 * Handle tournament creation form submission. Sends data to server and reloads tournaments list on success.
 */
createTournamentForm?.addEventListener('submit', async (e) => {
    e.preventDefault();
    
    console.log('Tournament form submitted!');
    
    const nameInput = document.getElementById('tournament-name') as HTMLInputElement;
    const sizeInput = document.getElementById('tournament-size') as HTMLSelectElement;
    const maxScoreInput = document.getElementById('tournament-max-score') as HTMLInputElement;
    
    const tournamentData = {
        name: nameInput?.value || '',
        size: parseInt(sizeInput?.value || '4'),
        maxScore: parseInt(maxScoreInput?.value || '5')
    };
    
    console.log('Tournament data:', tournamentData);
    
    try {
        const response = await fetch('/pong/tournaments/create', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            credentials: 'same-origin',
            body: JSON.stringify(tournamentData)
        });
        
        console.log('Response status:', response.status);
        const data = await response.json();
        console.log('Response data:', data);
        
        if (data.success) {
            createModal?.classList.add('hidden');
            (createTournamentForm as HTMLFormElement).reset();
            
            await loadTournaments();
            
            alert(`¡Torneo creado exitosamente!\n\nCódigo de invitación: ${data.tournament.inviteCode}\n\nComparte este código con tus amigos para que puedan unirse.`);
            
            viewTournament(data.tournament.id);
        } else {
            alert(data.error || 'Error al crear el torneo');
        }
    } catch (error) {
        console.error('Error creating tournament:', error);
        alert('Error al crear el torneo');
    }
});

/**
 * Handle join by code form submission
 */
joinCodeForm?.addEventListener('submit', async (e) => {
    e.preventDefault();
    
    const codeInput = document.getElementById('invite-code') as HTMLInputElement;
    const inviteCode = codeInput?.value.toUpperCase().trim();
    
    if (!inviteCode || inviteCode.length !== 5) {
        alert('Por favor ingresa un código válido de 5 letras');
        return;
    }
    
    try {
        const response = await fetch('/pong/tournaments/join-by-code', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            credentials: 'same-origin',
            body: JSON.stringify({ inviteCode })
        });
        
        const data = await response.json();
        
        if (data.success) {
            joinCodeModal?.classList.add('hidden');
            (joinCodeForm as HTMLFormElement).reset();
            
            await loadTournaments();
            
            alert('¡Te has unido al torneo exitosamente!');
            viewTournament(data.tournament.id);
        } else {
            alert(data.error || 'Error al unirse al torneo');
        }
    } catch (error) {
        console.error('Error joining by code:', error);
        alert('Error al unirse al torneo');
    }
});

closeBracketBtn?.addEventListener('click', () => {
    bracketView?.classList.add('hidden');
});

/**
 * Load tournaments from the server. Displays active and upcoming tournaments.
 * @returns 
 */
async function loadTournaments() {
    try {
        const response = await fetch('/pong/tournaments/list', {
            credentials: 'same-origin'
        });
        const data = await response.json();
        
        const activeContainer = document.getElementById('active-tournaments');
        const upcomingContainer = document.getElementById('upcoming-tournaments');
        
        if (!activeContainer || !upcomingContainer) return;
        
        //Render active tournaments
        if (data.active && data.active.length > 0) {
            activeContainer.innerHTML = data.active.map((tournament: any) => `
                <div class="active-tournament-card bg-gray-700 rounded-lg p-4 hover:bg-gray-600 ${tournament.isParticipant ? 'cursor-pointer' : ''} transition-colors" 
                     data-tournament-id="${tournament.id}"
                     data-is-participant="${tournament.isParticipant}">
                    <h3 class="font-bold text-lg mb-2">${tournament.name}</h3>
                    <div class="flex justify-between text-sm text-gray-400">
                        <span>${tournament.participants?.length || 0}/${tournament.size} jugadores</span>
                        <span class="text-green-500">${tournament.status}</span>
                    </div>
                    ${tournament.isParticipant 
                        ? `<button class="view-active-lobby-btn mt-3 w-full bg-blue-600 hover:bg-blue-700 rounded px-4 py-2 text-sm font-semibold"
                                data-tournament-id="${tournament.id}">
                            Ver Partidas
                          </button>`
                        : `<p class="mt-3 text-center text-gray-400 text-sm">Torneo en curso</p>`
                    }
                </div>
            `).join('');
            
            //Add event listeners to active tournament cards
            const activeTournamentCards = activeContainer.querySelectorAll('.active-tournament-card');
            activeTournamentCards.forEach((card) => {
                const tournamentId = card.getAttribute('data-tournament-id');
                const isParticipant = card.getAttribute('data-is-participant') === 'true';
                if (tournamentId && isParticipant) {
                    card.addEventListener('click', (e) => {
                        if (!(e.target as HTMLElement).classList.contains('view-active-lobby-btn')) {
                            viewTournament(tournamentId);
                        }
                    });
                }
            });
            
            const viewActiveButtons = activeContainer.querySelectorAll('.view-active-lobby-btn');
            viewActiveButtons.forEach((btn) => {
                const tournamentId = btn.getAttribute('data-tournament-id');
                if (tournamentId) {
                    btn.addEventListener('click', (e) => {
                        e.stopPropagation();
                        viewTournament(tournamentId);
                    });
                }
            });
        } else {
            activeContainer.innerHTML = '<p class="text-gray-400 text-center py-4">No hay torneos activos</p>';
        }
        
        //Render upcoming tournaments
        if (data.upcoming && data.upcoming.length > 0) {
            upcomingContainer.innerHTML = data.upcoming.map((tournament: any, index: number) => `
                <div class="tournament-card bg-gray-700 rounded-lg p-4 ${tournament.isParticipant ? 'hover:bg-gray-600 cursor-pointer' : ''} transition-colors" 
                     data-tournament-id="${tournament.id}"
                     data-is-participant="${tournament.isParticipant}">
                    <h3 class="font-bold text-lg mb-2">${tournament.name}</h3>
                    <div class="flex justify-between text-sm text-gray-400">
                        <span>${tournament.participants?.length || 0}/${tournament.size} jugadores</span>
                        <span class="text-yellow-500">Esperando</span>
                    </div>
                    ${tournament.isParticipant 
                        ? `<button class="view-lobby-btn mt-3 w-full bg-blue-600 hover:bg-blue-700 rounded px-4 py-2 text-sm font-semibold"
                                data-tournament-id="${tournament.id}">
                            Ver Lobby
                          </button>`
                        : `<p class="mt-3 text-center text-gray-400 text-sm">Usa el código para unirte</p>`
                    }
                </div>
            `).join('');
            
            //Add event listeners only to participant tournament cards
            const tournamentCards = upcomingContainer.querySelectorAll('.tournament-card');
            tournamentCards.forEach((card) => {
                const tournamentId = card.getAttribute('data-tournament-id');
                const isParticipant = card.getAttribute('data-is-participant') === 'true';
                if (tournamentId && isParticipant) {
                    card.addEventListener('click', (e) => {
                        if (!(e.target as HTMLElement).classList.contains('view-lobby-btn')) {
                            viewTournament(tournamentId);
                        }
                    });
                }
            });
            
            const viewLobbyButtons = upcomingContainer.querySelectorAll('.view-lobby-btn');
            viewLobbyButtons.forEach((btn) => {
                const tournamentId = btn.getAttribute('data-tournament-id');
                if (tournamentId) {
                    btn.addEventListener('click', (e) => {
                        e.stopPropagation();
                        viewTournament(tournamentId);
                    });
                }
            });
        } else {
            upcomingContainer.innerHTML = '<p class="text-gray-400 text-center py-4">No hay torneos próximos</p>';
        }
    } catch (error) {
        console.error('Error loading tournaments:', error);
    }
}

/**
 * Join a tournament. Sends join request to server and reloads tournaments list on success.
 * @param tournamentId 
 */
async function joinTournament(tournamentId: string) {
    try {
        const response = await fetch(`/pong/tournaments/${tournamentId}/join`, {
            method: 'POST',
            credentials: 'same-origin'
        });
        
        const data = await response.json();
        
        if (data.success) {
            alert('Te has unido al torneo!');
            await loadTournaments();
            viewTournament(tournamentId);
        } else {
            alert(data.error || 'Error al unirse al torneo');
        }
    } catch (error) {
        console.error('Error joining tournament:', error);
        alert('Error al unirse al torneo');
    }
}

/**
 * View tournament details. Shows bracket and match info or lobby if waiting.
 * @param tournamentId 
 */
async function viewTournament(tournamentId: string) {
    try {
        const response = await fetch(`/pong/tournaments/${tournamentId}`, {
            credentials: 'same-origin'
        });
        
        if (!response.ok) {
            if (response.status === 403) {
                alert('Solo los participantes del torneo pueden ver el lobby');
                return;
            }
            throw new Error('Failed to fetch tournament');
        }
        
        const tournament = await response.json();
        
        bracketView?.classList.remove('hidden');
        
        //Render based on tournament status
        const bracketContainer = document.getElementById('bracket-container');
        if (bracketContainer) {
            if (tournament.status === 'waiting') {
                const participantsList = tournament.participants.map((p: any) => 
                    `<li class="bg-gray-700 px-4 py-2 rounded">${p.username}</li>`
                ).join('');
                
                const startButton = tournament.isOwner && tournament.isFull
                    ? `<button id="start-tournament-btn" data-tournament-id="${tournament.id}"
                              class="mt-4 bg-green-600 hover:bg-green-700 rounded-lg px-6 py-3 font-semibold">
                         Iniciar Torneo
                       </button>`
                    : tournament.isOwner && !tournament.isFull
                    ? `<p class="mt-4 text-yellow-400">Esperando a que se llene el torneo (${tournament.participants.length}/${tournament.size})</p>`
                    : '';
                
                const leaveButton = `<button id="leave-tournament-btn" data-tournament-id="${tournament.id}"
                          class="mt-4 bg-red-600 hover:bg-red-700 rounded-lg px-6 py-3 font-semibold">
                     Salir del Torneo
                   </button>`;
                
                bracketContainer.innerHTML = `
                    <div class="max-w-2xl mx-auto">
                        <div class="bg-gray-700 rounded-lg p-6 mb-6">
                            <h3 class="text-2xl font-bold mb-4">${tournament.name}</h3>
                            <div class="grid grid-cols-2 gap-4 text-sm mb-4">
                                <div>
                                    <p class="text-gray-400">Código de invitación:</p>
                                    <p class="text-2xl font-bold text-purple-400">${tournament.inviteCode}</p>
                                    <button id="copy-code-btn" data-code="${tournament.inviteCode}"
                                            class="text-xs bg-gray-600 hover:bg-gray-500 rounded px-3 py-1 mt-2">
                                        Copiar código
                                    </button>
                                </div>
                                <div>
                                    <p class="text-gray-400">Jugadores:</p>
                                    <p class="text-xl font-bold">${tournament.participants.length}/${tournament.size}</p>
                                </div>
                            </div>
                            <div class="text-sm text-gray-400">
                                <p>Creador: ${tournament.creatorUsername}</p>
                                <p>Puntos para ganar: ${tournament.maxScore}</p>
                            </div>
                        </div>
                        
                        <div class="bg-gray-700 rounded-lg p-6">
                            <h4 class="text-xl font-bold mb-4">Participantes</h4>
                            <ul class="space-y-2">
                                ${participantsList}
                            </ul>
                            ${tournament.participants.length < 2 ? 
                                '<p class="text-yellow-400 mt-4">Se necesitan al menos 2 jugadores para iniciar</p>' 
                                : ''}
                        </div>
                        
                        <div class="flex gap-4 justify-center mt-6">
                            ${startButton}
                            ${leaveButton}
                        </div>
                    </div>
                `;
                
                //Add event listeners after creating the HTML
                const copyBtn = document.getElementById('copy-code-btn');
                if (copyBtn) {
                    copyBtn.addEventListener('click', () => {
                        const code = copyBtn.getAttribute('data-code');
                        if (code) copyInviteCode(code);
                    });
                }
                
                const leaveBtn = document.getElementById('leave-tournament-btn');
                if (leaveBtn) {
                    leaveBtn.addEventListener('click', () => {
                        const tournamentId = leaveBtn.getAttribute('data-tournament-id');
                        if (tournamentId) leaveTournament(tournamentId);
                    });
                }
                
                const startBtn = document.getElementById('start-tournament-btn');
                if (startBtn) {
                    startBtn.addEventListener('click', () => {
                        const tournamentId = startBtn.getAttribute('data-tournament-id');
                        if (tournamentId) startTournament(tournamentId);
                    });
                }
            } else if (tournament.status === 'active') {
                const currentRoundNumber = tournament.currentRound || 1;
                const totalRounds = tournament.bracket?.length || 0;
                
                const currentRoundMatches = tournament.bracket?.[currentRoundNumber - 1] || [];
                
                const matchesList = currentRoundMatches.map((match: any) => {
                    const player1Name = match.player1?.username || 'TBD';
                    const player2Name = match.player2?.username || 'TBD';
                    
                    let matchStatusHTML = '';
                    let statusColor = '';
                    
                    if (match.status === 'completed') {
                        matchStatusHTML = '✓ Completado';
                        statusColor = 'text-green-400';
                    } else if (match.status === 'playing') {
                        matchStatusHTML = '⚡ En juego';
                        statusColor = 'text-yellow-400';
                    } else if (match.status === 'ready') {
                        matchStatusHTML = '🎮 Listo para empezar';
                        statusColor = 'text-blue-400';
                    } else if (match.status === 'lobby') {
                        matchStatusHTML = '⏳ Esperando jugadores';
                        statusColor = 'text-orange-400';
                    } else {
                        matchStatusHTML = '⏳ Esperando';
                        statusColor = 'text-gray-400';
                    }
                    
                    return `
                        <div class="bg-gray-700 rounded-lg p-4 mb-3">
                            <div class="flex justify-between items-center mb-2">
                                <span class="font-bold">${player1Name}</span>
                                <span class="text-gray-400">vs</span>
                                <span class="font-bold">${player2Name}</span>
                            </div>
                            <div class="text-center ${statusColor} text-sm">
                                ${matchStatusHTML}
                            </div>
                            ${match.winner ? `<div class="text-center text-green-400 mt-2">Ganador: ${match.winner === match.player1?.userId ? player1Name : player2Name}</div>` : ''}
                        </div>
                    `;
                }).join('');
                
                bracketContainer.innerHTML = `
                    <div class="max-w-4xl mx-auto">
                        <div class="bg-gray-700 rounded-lg p-6 mb-6">
                            <h3 class="text-2xl font-bold mb-4">${tournament.name}</h3>
                            <div class="text-center mb-4">
                                <p class="text-lg text-green-400">🏆 Torneo en Progreso</p>
                                <p class="text-gray-400 mt-2">Ronda ${currentRoundNumber} de ${totalRounds}</p>
                            </div>
                        </div>
                        
                        <div class="bg-gray-700 rounded-lg p-6">
                            <h4 class="text-xl font-bold mb-4">Partidas de la Ronda Actual</h4>
                            ${matchesList || '<p class="text-gray-400 text-center">No hay partidas en esta ronda</p>'}
                        </div>
                        
                        <div class="text-center mt-6">
                            <button id="check-my-match-btn" data-tournament-id="${tournament.id}"
                                    class="bg-blue-600 hover:bg-blue-700 rounded-lg px-6 py-3 font-semibold mr-3">
                                Ver Mi Partida
                            </button>
                            <button id="refresh-tournament-btn" 
                                    class="bg-gray-600 hover:bg-gray-700 rounded-lg px-6 py-3 font-semibold">
                                🔄 Actualizar
                            </button>
                        </div>
                    </div>
                `;
                
                const checkMatchBtn = document.getElementById('check-my-match-btn');
                if (checkMatchBtn) {
                    checkMatchBtn.addEventListener('click', () => {
                        const tournamentId = checkMatchBtn.getAttribute('data-tournament-id');
                        if (tournamentId) viewMyMatch(tournamentId);
                    });
                }
                
                const refreshBtn = document.getElementById('refresh-tournament-btn');
                if (refreshBtn) {
                    refreshBtn.addEventListener('click', () => viewTournament(tournamentId));
                }
            } else {
                //Completed tournament
                bracketContainer.innerHTML = `
                    <div class="text-center py-8">
                        <h3 class="text-xl font-bold mb-4">${tournament.name}</h3>
                        <p class="text-green-400 text-2xl mb-4">¡Torneo Completado!</p>
                        <p class="text-gray-400">Ganador: ${tournament.winner?.username || 'Desconocido'}</p>
                    </div>
                `;
            }
        }
    } catch (error) {
        console.error('Error viewing tournament:', error);
        alert('Error al cargar el torneo');
    }
}

/**
 * Copy invite code to clipboard
 */
function copyInviteCode(code: string) {
    navigator.clipboard.writeText(code).then(() => {
        alert('¡Código copiado al portapapeles!');
    }).catch(err => {
        console.error('Error copying code:', err);
        alert('Error al copiar el código');
    });
}

/**
 * Start tournament (only owner can do this)
 */
async function startTournament(tournamentId: string) {
    if (!confirm('¿Estás seguro de que quieres iniciar el torneo?')) {
        return;
    }
    
    try {
        const response = await fetch(`/pong/tournaments/${tournamentId}/start`, {
            method: 'POST',
            credentials: 'same-origin'
        });
        
        const data = await response.json();
        
        if (data.success) {
            alert('¡Torneo iniciado!');
            viewTournament(tournamentId);
        } else {
            alert(data.error || 'Error al iniciar el torneo');
        }
    } catch (error) {
        console.error('Error starting tournament:', error);
        alert('Error al iniciar el torneo');
    }
}

/**
 * Leave tournament
 */
async function leaveTournament(tournamentId: string) {
    if (!confirm('¿Estás seguro de que quieres salir del torneo?')) {
        return;
    }
    
    try {
        const response = await fetch(`/pong/tournaments/${tournamentId}/leave`, {
            method: 'POST',
            credentials: 'same-origin'
        });
        
        const data = await response.json();
        
        if (data.success) {
            alert('Has salido del torneo');
            bracketView?.classList.add('hidden');
            loadTournaments();
        } else {
            alert(data.error || 'Error al salir del torneo');
        }
    } catch (error) {
        console.error('Error leaving tournament:', error);
        alert('Error al salir del torneo');
    }
}

/**
 * View player's current match in a tournament
 */
async function viewMyMatch(tournamentId: string) {
    try {
        if (matchPollingInterval) {
            clearInterval(matchPollingInterval);
            matchPollingInterval = null;
        }
        
        const response = await fetch(`/pong/tournaments/${tournamentId}/my-match`, {
            credentials: 'same-origin'
        });
        
        const data = await response.json();
        
        if (!data.success || !data.match) {
            alert('No tienes ninguna partida activa en este momento');
            return;
        }
        
        const match = data.match;
        const isPlayer1 = match.player1?.userId === data.match.currentUserId;
        const myReadyStatus = isPlayer1 ? match.player1Ready : match.player2Ready;
        const opponentReadyStatus = isPlayer1 ? match.player2Ready : match.player1Ready;
        const opponentName = isPlayer1 ? match.player2?.username : match.player1?.username;

        const bracketContainer = document.getElementById('bracket-container');
        if (!bracketContainer) return;
        
        bracketView?.classList.remove('hidden');
        
        if (match.status === 'lobby' || match.status === 'ready') {
            bracketContainer.innerHTML = `
                <div class="max-w-2xl mx-auto">
                    <div class="bg-gray-700 rounded-lg p-6 mb-6 text-center">
                        <h3 class="text-2xl font-bold mb-4">🎮 Lobby de Partida</h3>
                        <p class="text-gray-400 mb-6">Prepárate para tu partida del torneo</p>
                        
                        <div class="grid grid-cols-2 gap-6 mb-6">
                            <!-- You -->
                            <div class="bg-gray-800 rounded-lg p-4">
                                <p class="text-sm text-gray-400 mb-2">Tú</p>
                                <p class="text-xl font-bold mb-3">${isPlayer1 ? match.player1?.username : match.player2?.username}</p>
                                <div class="flex items-center justify-center">
                                    ${myReadyStatus 
                                        ? '<span class="text-green-400 text-2xl">✓ Listo</span>' 
                                        : '<span class="text-gray-400 text-lg">⏳ No listo</span>'}
                                </div>
                            </div>
                            
                            <!-- Opponent -->
                            <div class="bg-gray-800 rounded-lg p-4">
                                <p class="text-sm text-gray-400 mb-2">Oponente</p>
                                <p class="text-xl font-bold mb-3">${opponentName}</p>
                                <div class="flex items-center justify-center">
                                    ${opponentReadyStatus 
                                        ? '<span class="text-green-400 text-2xl">✓ Listo</span>' 
                                        : '<span class="text-gray-400 text-lg">⏳ No listo</span>'}
                                </div>
                            </div>
                        </div>
                        
                        <!-- Countdown display -->
                        <div id="countdown-display" class="hidden mb-4">
                            <p class="text-green-400 text-lg font-bold mb-2">¡Ambos jugadores listos!</p>
                            <p class="text-white text-3xl font-bold mb-2">Iniciando en <span id="countdown-number">3</span>...</p>
                        </div>
                        
                        ${match.status === 'ready' && !myReadyStatus && !opponentReadyStatus
                            ? '<p class="text-green-400 text-lg font-bold mb-4">¡Ambos jugadores listos!</p>'
                            : match.status !== 'ready'
                            ? '<p class="text-yellow-400 mb-4">Esperando a que ambos jugadores estén listos...</p>'
                            : ''
                        }
                        
                        <div class="flex gap-4 justify-center">
                            ${!myReadyStatus 
                                ? `<button id="ready-btn" data-tournament-id="${tournamentId}" data-match-id="${match.id}"
                                          class="bg-green-600 hover:bg-green-700 rounded-lg px-8 py-3 font-semibold text-lg">
                                       ¡Estoy Listo!
                                   </button>`
                                : `<button id="unready-btn" data-tournament-id="${tournamentId}" data-match-id="${match.id}"
                                          class="bg-yellow-600 hover:bg-yellow-700 rounded-lg px-8 py-3 font-semibold">
                                       Cancelar
                                   </button>`
                            }
                        </div>
                        
                        <button id="back-to-bracket-btn" data-tournament-id="${tournamentId}"
                                class="mt-6 text-gray-400 hover:text-white underline">
                            Volver al bracket
                        </button>
                    </div>
                </div>
            `;
            
            //Add event listeners
            const readyBtn = document.getElementById('ready-btn');
            if (readyBtn) {
                readyBtn.addEventListener('click', () => {
                    const tournamentId = readyBtn.getAttribute('data-tournament-id');
                    const matchId = readyBtn.getAttribute('data-match-id');
                    if (tournamentId && matchId) toggleReady(tournamentId, matchId, true);
                });
            }
            
            const unreadyBtn = document.getElementById('unready-btn');
            if (unreadyBtn) {
                unreadyBtn.addEventListener('click', () => {
                    const tournamentId = unreadyBtn.getAttribute('data-tournament-id');
                    const matchId = unreadyBtn.getAttribute('data-match-id');
                    if (tournamentId && matchId) toggleReady(tournamentId, matchId, false);
                });
            }
            
            const backBtn = document.getElementById('back-to-bracket-btn');
            if (backBtn) {
                backBtn.addEventListener('click', () => {
                    if (matchPollingInterval) {
                        clearInterval(matchPollingInterval);
                        matchPollingInterval = null;
                    }
                    const tournamentId = backBtn.getAttribute('data-tournament-id');
                    if (tournamentId) viewTournament(tournamentId);
                });
            }
            
            if (match.status === 'ready') {
                startMatchCountdown(tournamentId, match.id);
            }
            
            matchPollingInterval = setInterval(() => {
                pollMatchStatus(tournamentId);
            }, 1000);
            
        } else if (match.status === 'playing') {
            if (matchPollingInterval) {
                clearInterval(matchPollingInterval);
                matchPollingInterval = null;
            }
            
            bracketContainer.innerHTML = `
                <div class="max-w-2xl mx-auto text-center">
                    <div class="bg-gray-700 rounded-lg p-6">
                        <h3 class="text-2xl font-bold mb-4">⚡ Partida en Curso</h3>
                        <p class="text-gray-400 mb-4">Tu partida ya ha comenzado</p>
                        <p class="text-white text-lg mb-6">vs ${opponentName}</p>
                        <button onclick="window.location.href='/pong'" 
                                class="bg-blue-600 hover:bg-blue-700 rounded-lg px-8 py-3 font-semibold">
                            Ir al juego
                        </button>
                    </div>
                </div>
            `;
        }
    } catch (error) {
        console.error('Error viewing match:', error);
        alert('Error al cargar la partida');
    }
}

// Global variable to track countdown interval
let countdownInterval: NodeJS.Timeout | null = null;
let matchPollingInterval: NodeJS.Timeout | null = null;

/**
 * Poll match status to detect changes
 */
async function pollMatchStatus(tournamentId: string) {
    try {
        const response = await fetch(`/pong/tournaments/${tournamentId}/my-match`, {
            credentials: 'same-origin'
        });
        
        const data = await response.json();
        
        if (!data.success || !data.match) {
            return;
        }
        
        const match = data.match;
        
        if (match.status === 'ready' && !countdownInterval) {
            viewMyMatch(tournamentId);
        }

        if (match.status === 'playing') {
            if (matchPollingInterval) {
                clearInterval(matchPollingInterval);
                matchPollingInterval = null;
            }
            window.location.href = '/pong';
        }
    } catch (error) {
        console.error('Error polling match status:', error);
    }
}

/**
 * Start countdown when both players are ready
 */
function startMatchCountdown(tournamentId: string, matchId: string) {
    if (countdownInterval) {
        clearInterval(countdownInterval);
        countdownInterval = null;
    }
    
    const countdownDisplay = document.getElementById('countdown-display');
    const countdownNumber = document.getElementById('countdown-number');
    
    if (!countdownDisplay || !countdownNumber) return;
    
    countdownDisplay.classList.remove('hidden');
    
    let timeLeft = 3;
    countdownNumber.textContent = timeLeft.toString();
    
    countdownInterval = setInterval(() => {
        timeLeft--;
        
        if (timeLeft > 0) {
            countdownNumber.textContent = timeLeft.toString();
        } else {
            clearInterval(countdownInterval!);
            countdownInterval = null;
            createMatchGameSilent(tournamentId, matchId);
        }
    }, 1000);
}

/**
 * Create match game without showing errors (used by countdown)
 */
async function createMatchGameSilent(tournamentId: string, matchId: string) {
    try {
        await fetch(`/pong/tournaments/${tournamentId}/matches/${matchId}/create-game`, {
            method: 'POST',
            credentials: 'same-origin'
        });
    } catch (error) {
        console.log('Game creation handled by other player or already created');
    }
}

/**
 * Toggle player ready status
 */
async function toggleReady(tournamentId: string, matchId: string, ready: boolean) {
    try {
        if (!ready && countdownInterval) {
            clearInterval(countdownInterval);
            countdownInterval = null;
        }
        
        const endpoint = ready ? 'ready' : 'unready';
        const response = await fetch(`/pong/tournaments/${tournamentId}/matches/${matchId}/${endpoint}`, {
            method: 'POST',
            credentials: 'same-origin'
        });
        
        const data = await response.json();
        
        if (data.success) {
            viewMyMatch(tournamentId);
        } else {
            alert(data.error || 'Error al cambiar estado');
        }
    } catch (error) {
        console.error('Error toggling ready:', error);
        alert('Error al cambiar estado');
    }
}

/**
 * Start the match game
 */
async function startMatchGame(tournamentId: string, matchId: string) {
    try {
        if (countdownInterval) {
            clearInterval(countdownInterval);
            countdownInterval = null;
        }
        
        const response = await fetch(`/pong/tournaments/${tournamentId}/matches/${matchId}/create-game`, {
            method: 'POST',
            credentials: 'same-origin'
        });
        
        const data = await response.json();
        
        if (data.success) {
            window.location.href = '/pong';
        } else {
            alert(data.error || 'Error al iniciar la partida');
            viewMyMatch(tournamentId);
        }
    } catch (error) {
        console.error('Error starting match:', error);
        alert('Error al iniciar la partida');
    }
}

//Make functions global for onclick handlers
(window as any).joinTournament = joinTournament;
(window as any).viewTournament = viewTournament;
(window as any).copyInviteCode = copyInviteCode;
(window as any).startTournament = startTournament;
(window as any).leaveTournament = leaveTournament;
(window as any).viewMyMatch = viewMyMatch;
(window as any).toggleReady = toggleReady;
(window as any).startMatchGame = startMatchGame;
(window as any).startMatchCountdown = startMatchCountdown;
(window as any).pollMatchStatus = pollMatchStatus;
(window as any).createMatchGameSilent = createMatchGameSilent;

//Load tournaments on page load
loadTournaments();

//Refresh tournaments every 10 seconds
setInterval(loadTournaments, 10000);
