// SET! 4-of-a-Kind Multiplayer Game Engine & Audio Synthesizer
(function() {
  'use strict';

  // --- AUDIO SYNTHESIZER (Web Audio API - Zero External Assets) ---
  const AudioEngine = (function() {
    let ctx = null;
    let enabled = true;

    function init() {
      if (!ctx && (window.AudioContext || window.webkitAudioContext)) {
        ctx = new (window.AudioContext || window.webkitAudioContext)();
      }
      if (ctx && ctx.state === 'suspended') {
        ctx.resume();
      }
    }

    function playTone(freq, type, duration, gainValue = 0.15) {
      if (!enabled) return;
      init();
      if (!ctx) return;
      try {
        const osc = ctx.createOscillator();
        const gain = ctx.createGain();
        osc.type = type;
        osc.frequency.setValueAtTime(freq, ctx.currentTime);
        gain.gain.setValueAtTime(gainValue, ctx.currentTime);
        gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + duration);
        osc.connect(gain);
        gain.connect(ctx.destination);
        osc.start();
        osc.stop(ctx.currentTime + duration);
      } catch (e) {}
    }

    return {
      toggle() {
        enabled = !enabled;
        return enabled;
      },
      isEnabled() { return enabled; },
      cardSelect() {
        playTone(520, 'sine', 0.08, 0.2);
      },
      cardPass() {
        if (!enabled) return;
        init();
        if (!ctx) return;
        try {
          const osc = ctx.createOscillator();
          const gain = ctx.createGain();
          osc.type = 'triangle';
          osc.frequency.setValueAtTime(300, ctx.currentTime);
          osc.frequency.exponentialRampToValueAtTime(700, ctx.currentTime + 0.15);
          gain.gain.setValueAtTime(0.2, ctx.currentTime);
          gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.15);
          osc.connect(gain);
          gain.connect(ctx.destination);
          osc.start();
          osc.stop(ctx.currentTime + 0.15);
        } catch (e) {}
      },
      cardReceive() {
        playTone(650, 'sine', 0.12, 0.18);
        setTimeout(() => playTone(880, 'sine', 0.15, 0.2), 70);
      },
      turnAlert() {
        playTone(440, 'sine', 0.1, 0.25);
        setTimeout(() => playTone(660, 'sine', 0.15, 0.3), 110);
      },
      victory() {
        if (!enabled) return;
        init();
        const chords = [523.25, 659.25, 783.99, 1046.50]; // C Major arpeggio
        chords.forEach((note, i) => {
          setTimeout(() => playTone(note, 'triangle', 0.4, 0.25), i * 110);
        });
      },
      slap() {
        playTone(180, 'square', 0.12, 0.35);
      },
      error() {
        playTone(150, 'sawtooth', 0.2, 0.2);
      }
    };
  })();

  // --- HAPTIC FEEDBACK ---
  function vibrate(pattern = [40]) {
    if ('vibrate' in navigator) {
      try { navigator.vibrate(pattern); } catch (e) {}
    }
  }

  // --- PLAYER PROFILE ---
  const DEFAULT_AVATARS = {
    fox: { name: 'Cyber Fox', icon: '🦊' },
    cat: { name: 'Neon Cat', icon: '🐱' },
    bot: { name: 'Pixel Bot', icon: '🤖' },
    astro: { name: 'Astro Kid', icon: '🧑‍🚀' }
  };

  const storedId = localStorage.getItem('set_player_id') || `p_${Math.random().toString(36).substr(2, 8)}`;
  localStorage.setItem('set_player_id', storedId);

  // --- DEFAULT PRESET CATEGORIES (Ensures offline/standalone play always works) ---
  const DEFAULT_PRESET_CATEGORIES = {
    Fruits: {
      icon: '🍓',
      items: [
        { name: 'Apple', icon: '🍎' },
        { name: 'Mango', icon: '🥭' },
        { name: 'Cherry', icon: '🍒' },
        { name: 'Banana', icon: '🍌' },
        { name: 'Grape', icon: '🍇' },
        { name: 'Kiwi', icon: '🥝' },
        { name: 'Orange', icon: '🍊' },
        { name: 'Pineapple', icon: '🍍' },
        { name: 'Strawberry', icon: '🍓' },
        { name: 'Watermelon', icon: '🍉' }
      ]
    },
    Cars: {
      icon: '🏎️',
      items: [
        { name: 'BMW', icon: '🏎️' },
        { name: 'Tesla', icon: '⚡' },
        { name: 'Audi', icon: '🚗' },
        { name: 'Honda', icon: '🚙' },
        { name: 'Ford', icon: '🛻' },
        { name: 'Toyota', icon: '🚘' },
        { name: 'Mercedes', icon: '🏎️' },
        { name: 'Lamborghini', icon: '🔥' },
        { name: 'Ferrari', icon: '🏎️' },
        { name: 'Bugatti', icon: '🚀' }
      ]
    },
    Cyberpunk: {
      icon: '👾',
      items: [
        { name: 'NeuralChip', icon: '🧠' },
        { name: 'LaserBlade', icon: '🗡️' },
        { name: 'QuantumCore', icon: '⚛️' },
        { name: 'HoverBike', icon: '🏍️' },
        { name: 'PlasmaRifle', icon: '🔫' },
        { name: 'CyborgArm', icon: '🦾' },
        { name: 'HoloDeck', icon: '🥽' },
        { name: 'DataNode', icon: '💾' }
      ]
    },
    Animals: {
      icon: '🐾',
      items: [
        { name: 'Tiger', icon: '🐯' },
        { name: 'Lion', icon: '🦁' },
        { name: 'Hippo', icon: '🦛' },
        { name: 'Monkey', icon: '🐒' },
        { name: 'Elephant', icon: '🐘' },
        { name: 'Panda', icon: '🐼' },
        { name: 'Fox', icon: '🦊' },
        { name: 'Wolf', icon: '🐺' }
      ]
    }
  };

  const state = {
    playerId: storedId,
    playerName: localStorage.getItem('set_player_name') || `Player_${Math.floor(100 + Math.random() * 900)}`,
    playerAvatar: localStorage.getItem('set_player_avatar') || 'fox',
    activeScreen: 'lobby', // 'lobby' | 'game'
    activeRoom: null,
    selectedCardId: null,
    categories: { ...DEFAULT_PRESET_CATEGORIES },
    selectedCategory: 'Fruits',
    ws: null,
    wsConnected: false,
    pollTimer: null,
    isPassAndPlay: false,
    isSoloBots: false,
    streak: parseInt(localStorage.getItem('set_player_streak') || '0', 10),
    passAndPlayData: null,
    autoPilot: false,
    autoPilotTimer: null,
    serverUrl: window.location.origin
  };

  function getApiUrl(path) {
    if (window.location.protocol === 'file:') {
      if (state.serverUrl && !state.serverUrl.startsWith('file:')) {
        return new URL(path, state.serverUrl).toString();
      }
    }
    return path;
  }

  // --- WEBSOCKET REAL-TIME SYNC ---
  const pendingWsQueue = [];

  function connectWebSocket() {
    if (window.location.protocol === 'file:' && (!state.serverUrl || state.serverUrl.startsWith('file:'))) {
      return;
    }
    let wsUrl;
    if (window.location.protocol === 'file:') {
      const cleanUrl = state.serverUrl.replace(/^http/, 'ws');
      wsUrl = `${cleanUrl}/ws`;
    } else {
      const protocol = window.location.protocol === 'https:' ? 'wss:' : 'ws:';
      wsUrl = `${protocol}//${window.location.host}/ws`;
    }

    try {
      state.ws = new WebSocket(wsUrl);

      state.ws.onopen = () => {
        state.wsConnected = true;
        updateConnectionStatus(true);

        // Flush any queued messages that were clicked while connecting
        while (pendingWsQueue.length > 0) {
          const raw = pendingWsQueue.shift();
          try { state.ws.send(raw); } catch (e) {}
        }

        // If we were inside a room, re-join
        if (state.activeRoom) {
          sendWsMessage('join_room', { roomId: state.activeRoom.id });
        }
      };

      state.ws.onmessage = (event) => {
        try {
          const msg = JSON.parse(event.data);
          handleServerMessage(msg);
        } catch (e) {
          console.error('WS parse error:', e);
        }
      };

      state.ws.onclose = () => {
        state.wsConnected = false;
        updateConnectionStatus(false);
        setTimeout(connectWebSocket, 1500);
      };

      state.ws.onerror = () => {
        state.wsConnected = false;
        updateConnectionStatus(false);
      };
    } catch (e) {
      console.warn('WebSocket connection failed', e);
    }
  }

  function sendWsMessage(action, options = {}) {
    const payload = JSON.stringify({
      action,
      roomId: options.roomId || (state.activeRoom ? state.activeRoom.id : null),
      playerId: state.playerId,
      data: {
        name: state.playerName,
        avatar: state.playerAvatar,
        ...options.data
      }
    });

    if (state.ws && state.ws.readyState === WebSocket.OPEN) {
      state.ws.send(payload);
      return true;
    } else {
      pendingWsQueue.push(payload);
      if (!state.ws || state.ws.readyState === WebSocket.CLOSED) {
        connectWebSocket();
      }
      return false;
    }
  }

  function handleServerMessage(msg) {
    const { event, data } = msg;

    if (event === 'joined_room_success') {
      state.activeRoom = data.room;
      showGameScreen();
      renderActiveRoom();
    } else if (event === 'player_joined' || event === 'player_left') {
      if (state.activeRoom && (!data.roomState || state.activeRoom.id === data.roomState.id)) {
        state.activeRoom = data.roomState;
        renderActiveRoom();
      }
    } else if (event === 'game_started') {
      state.activeRoom = data;
      state.selectedCardId = null;
      AudioEngine.cardReceive();
      vibrate([50, 30, 50]);
      showGameScreen();
      renderActiveRoom();
      checkTurnNotification();
    } else if (event === 'card_passed') {
      state.activeRoom = data.roomState;
      state.selectedCardId = null;

      const passer = state.activeRoom?.players.find(p => p.id === data.passerId);
      const receiver = state.activeRoom?.players.find(p => p.id === data.receiverId);
      const tickerText = document.getElementById('liveActionTickerText');

      if (data.receiverId === state.playerId) {
        AudioEngine.cardReceive();
        vibrate([60]);
        if (tickerText) {
          tickerText.innerHTML = `🎁 <b>${passer ? passer.name : 'Bot'}</b> passed <b>${data.passedCardName || 'Card'} ${data.passedCardIcon || ''}</b> to <b>YOU!</b>`;
        }
      } else if (data.passerId === state.playerId) {
        AudioEngine.cardPass();
        if (tickerText) {
          tickerText.innerHTML = `⚡ You passed <b>${data.passedCardName || 'Card'}</b> to <b>${receiver ? receiver.name : 'Player'}</b> ➔`;
        }
      } else {
        if (tickerText) {
          tickerText.innerHTML = `🔄 <b>${passer ? passer.name : 'Bot'}</b> passed to <b>${receiver ? receiver.name : 'Bot'}</b> ➔`;
        }
      }

      renderActiveRoom();
      checkTurnNotification();
    } else if (event === 'game_over') {
      state.activeRoom = data;
      showVictoryModal(data);
    } else if (event === 'player_reaction') {
      displayFloatingReaction(data.emoji, data.senderName);
    } else if (event === 'error') {
      showToast(data.message || 'Action failed', 'error');
      if (!state.activeRoom || state.activeRoom.status !== 'playing') {
        showLobbyScreen();
      }
    }
  }

  function checkTurnNotification() {
    if (!state.activeRoom || state.activeRoom.status !== 'playing') return;
    const current = state.activeRoom.players[state.activeRoom.turn];
    if (current && current.id === state.playerId) {
      AudioEngine.turnAlert();
      vibrate([100, 50, 100]);
    }
  }

  function updateConnectionStatus(online) {
    const pingEl = document.getElementById('pingIndicator');
    if (pingEl) {
      pingEl.innerHTML = online 
        ? `<span class="material-symbols-outlined text-[13px] text-primary" style="color:#ccff00;">bolt</span> Online`
        : `<span class="material-symbols-outlined text-[13px] text-error" style="color:#ffb4ab;">cloud_off</span> Reconnecting`;
    }
  }

  function updateStreakBadge() {
    const badgeText = document.getElementById('streakCountText');
    const badgeContainer = document.getElementById('playerStreakBadge');
    const streak = state.streak || 0;
    if (badgeText) {
      badgeText.textContent = `Streak: ${streak}`;
    }
    if (badgeContainer) {
      if (streak > 0) {
        badgeContainer.style.background = 'linear-gradient(90deg, rgba(255, 77, 109, 0.25), rgba(0, 245, 212, 0.2))';
        badgeContainer.style.borderColor = '#ff4d6d';
        badgeContainer.style.color = '#ff4d6d';
        badgeContainer.style.boxShadow = '0 0 12px rgba(255, 77, 109, 0.4)';
      } else {
        badgeContainer.style.background = '';
        badgeContainer.style.borderColor = '';
        badgeContainer.style.color = '';
        badgeContainer.style.boxShadow = '';
      }
    }
  }

  // --- API CALLS ---
  async function fetchCategories() {
    try {
      const res = await fetch(getApiUrl('/api/categories'));
      if (res.ok) {
        state.categories = await res.json();
        renderCategoryPills();
      }
    } catch (e) {
      renderCategoryPills();
    }
  }

  async function fetchRoomsList() {
    try {
      const res = await fetch(getApiUrl('/api/rooms'));
      if (res.ok) {
        const rooms = await res.json();
        renderRoomsFeed(rooms);
      }
    } catch (e) {}
  }

  async function fetchServerIpInfo() {
    try {
      const res = await fetch(getApiUrl('/api/ip'));
      if (res.ok) {
        const data = await res.json();
        state.serverUrl = data.url;
        const qrEl = document.getElementById('qrCodeImage');
        if (qrEl) {
          qrEl.src = getApiUrl(`/api/qr?url=${encodeURIComponent(data.url)}`);
        }
        const ipDisplay = document.getElementById('serverIpDisplay');
        if (ipDisplay) {
          ipDisplay.textContent = data.url;
        }
      }
    } catch (e) {}
  }

  // --- SCREEN SWITCHING ---
  function showLobbyScreen() {
    state.activeScreen = 'lobby';
    state.activeRoom = null;
    state.selectedCardId = null;
    document.getElementById('lobbyView').classList.remove('hidden');
    document.getElementById('gameView').classList.add('hidden');
    document.getElementById('bottomNav').classList.remove('hidden');
    closeAllModals();
    updateStreakBadge();
  }

  function showGameScreen() {
    if (!state.activeRoom) {
      console.warn('Attempted to show game screen with no active room');
      return;
    }
    state.activeScreen = 'game';
    document.getElementById('lobbyView').classList.add('hidden');
    document.getElementById('gameView').classList.remove('hidden');
    document.getElementById('bottomNav').classList.add('hidden');
    closeAllModals();
  }

  // --- RENDERING VIEWS ---
  function renderCategoryPills() {
    const container = document.getElementById('categoriesContainer');
    if (!container) return;

    container.innerHTML = '';
    const keys = Object.keys(state.categories);

    keys.forEach(key => {
      const cat = state.categories[key];
      const isSelected = state.selectedCategory === key;
      const btn = document.createElement('button');
      btn.className = `deck-pill flex items-center space-x-2 px-3.5 py-2 rounded-full border flex-shrink-0 transition-all cursor-pointer ${
        isSelected 
          ? 'bg-tertiary-container/30 border-2 border-tertiary-container text-white glow-coral font-bold' 
          : 'bg-surface-high border-outline-variant/60 text-on-surface hover:border-primary-neon/60'
      }`;
      btn.style.borderColor = isSelected ? '#ccff00' : '';
      btn.innerHTML = `
        <span class="text-base">${cat.icon || '🃏'}</span>
        <span class="text-xs font-semibold">${key}</span>
        ${isSelected ? '<span class="w-1.5 h-1.5 rounded-full" style="background:#ccff00;"></span>' : ''}
      `;
      btn.onclick = () => {
        state.selectedCategory = key;
        AudioEngine.cardSelect();
        renderCategoryPills();
        updateCategoryPreview();
      };
      container.appendChild(btn);
    });

    // Custom Workshop Button
    const customBtn = document.createElement('button');
    customBtn.className = 'deck-pill flex items-center space-x-2 px-3.5 py-2 rounded-full bg-surface-high border border-secondary/60 text-secondary hover:bg-secondary/20 transition-all flex-shrink-0 cursor-pointer';
    customBtn.innerHTML = `
      <span class="text-base">✨</span>
      <span class="text-xs font-bold">+ New Deck</span>
    `;
    customBtn.onclick = () => openCustomDeckModal();
    container.appendChild(customBtn);

    updateCategoryPreview();
  }

  function updateCategoryPreview() {
    const previewBox = document.getElementById('deckPreviewBox');
    const cat = state.categories[state.selectedCategory];
    if (!previewBox || !cat) return;

    const firstItem = cat.items[0] || { name: 'Item 1', icon: '🍓' };
    previewBox.innerHTML = `
      <div class="flex items-center space-x-2.5">
        <div class="flex -space-x-2">
          <span class="w-7 h-9 rounded bg-surface-high border border-white/20 flex items-center justify-center text-xs shadow">${firstItem.icon}</span>
          <span class="w-7 h-9 rounded bg-surface-high border border-white/20 flex items-center justify-center text-xs shadow">${firstItem.icon}</span>
          <span class="w-7 h-9 rounded bg-surface-high border border-white/20 flex items-center justify-center text-xs shadow">${firstItem.icon}</span>
          <span class="w-7 h-9 rounded bg-surface-high border-2 border-primary-neon flex items-center justify-center text-xs shadow glow-cyan-sm font-bold">${firstItem.icon}</span>
        </div>
        <div>
          <p class="text-xs font-bold text-on-surface">${firstItem.name} Quartet (4 Cards)</p>
          <p class="text-[11px] text-muted">${cat.items.length} Unique Items in Deck</p>
        </div>
      </div>
      <div class="px-2 py-1 rounded bg-surface-highest text-primary-neon font-bold text-[10px]" style="color:#ccff00;">
        ${state.selectedCategory.toUpperCase()} DECK
      </div>
    `;
  }

  function renderRoomsFeed(rooms) {
    const container = document.getElementById('roomsFeedContainer');
    if (!container) return;

    if (!rooms || rooms.length === 0) {
      container.innerHTML = `
        <div class="p-4 text-center text-muted text-xs glass-panel">
          No open tables right now. Click "Host Room" to create one!
        </div>
      `;
      return;
    }

    container.innerHTML = rooms.map(r => `
      <div class="glass-panel p-3 flex items-center justify-between transition-colors hover:border-primary-neon/40">
        <div class="flex items-center space-x-3">
          <div class="w-10 h-10 rounded-xl bg-surface-high flex flex-col items-center justify-center border border-white/10">
            <span class="text-[10px] text-muted font-mono">#${r.id}</span>
            <span class="text-xs">${r.categoryIcon || '🍓'}</span>
          </div>
          <div>
            <div class="flex items-center space-x-1.5">
              <span class="text-xs font-bold text-on-surface">${r.name}</span>
              ${r.status === 'playing' ? '<span class="w-1.5 h-1.5 rounded-full bg-error" title="In Game"></span>' : '<span class="w-1.5 h-1.5 rounded-full" style="background:#ccff00;" title="Open"></span>'}
            </div>
            <p class="text-[11px] text-muted">${r.category} • ${r.status === 'playing' ? 'Active Match' : 'Waiting for Players'}</p>
          </div>
        </div>
        <div class="flex items-center space-x-3">
          <div class="text-right">
            <span class="text-xs font-bold" style="color:#ccff00;">${r.playerCount}/${r.maxPlayers}</span>
            <span class="block text-[9px] text-muted">Plrs</span>
          </div>
          <button class="px-3.5 py-1.5 rounded-lg font-bold text-xs transition-all active:scale-95 cursor-pointer" 
                  style="background:#ccff00; color:#050914; box-shadow:0 0 12px rgba(204,255,0,0.35);"
                  onclick="window.setApp.joinRoom('${r.id}')">
            ${r.status === 'playing' ? 'WATCH' : 'JOIN'}
          </button>
        </div>
      </div>
    `).join('');
  }

  function renderActiveRoom() {
    const room = state.activeRoom;
    if (!room) return;

    try {
      // Room Header Info
      const roomCodeEl = document.getElementById('gameRoomCode');
      if (roomCodeEl) roomCodeEl.textContent = `#SET-${room.id || 'ARENA'}`;

      const roundEl = document.getElementById('gameRoundBadge');
      if (roundEl) roundEl.textContent = `RD ${room.round || 1}`;

      // Turn indicator & Active Player resolution
      const isPassAndPlay = Boolean(state.isPassAndPlay);
      const currentTurnPlayer = room.players ? room.players[room.turn] : null;
      const myPlayer = isPassAndPlay
        ? currentTurnPlayer
        : (room.players ? (room.players.find(p => p.id === state.playerId) || room.players.find(p => !p.isBot) || room.players[0]) : null);
      const isMyTurn = isPassAndPlay ? true : (currentTurnPlayer?.id === myPlayer?.id);
      const currentTurnName = isPassAndPlay ? (currentTurnPlayer?.name || 'Current Player') : (currentTurnPlayer?.name || 'Player');
      const isTurnBot = isPassAndPlay ? false : (currentTurnPlayer?.isBot || false);

      // Auto Pre-select Odd Card when it's My Turn
      let oddCard = null;
      if (myPlayer && myPlayer.hand && myPlayer.hand.length > 0) {
        const counts = {};
        myPlayer.hand.forEach(c => { counts[c.name] = (counts[c.name] || 0) + 1; });
        let lowestCount = 999;
        oddCard = myPlayer.hand[0];
        for (const card of myPlayer.hand) {
          if (counts[card.name] < lowestCount) {
            lowestCount = counts[card.name];
            oddCard = card;
          }
        }
        if (isMyTurn && (!state.selectedCardId || !myPlayer.hand.some(c => c.id === state.selectedCardId))) {
          state.selectedCardId = oddCard.id;
        }
      }

      const turnBadge = document.getElementById('turnActionPill');
      if (turnBadge) {
        if (isMyTurn) {
          turnBadge.className = 'px-3 py-1 rounded-full flex items-center gap-1.5 glow-cyan';
          turnBadge.style.background = 'linear-gradient(90deg, #ccff00, #b8f000)';
          turnBadge.style.color = '#050914';
          turnBadge.innerHTML = `
            <span class="text-xs font-black animate-bounce">⚡ YOUR TURN</span>
            <span class="text-[9px] font-black uppercase px-1.5 py-0.2 rounded bg-surface-lowest text-primary-neon font-mono">PASS 1</span>
          `;
        } else {
          turnBadge.className = 'px-3 py-1 rounded-full flex items-center gap-1.5 bg-surface-high border border-white/10';
          turnBadge.style.background = '';
          turnBadge.style.color = 'var(--text-main)';
          turnBadge.innerHTML = `
            <span class="w-2 h-2 rounded-full animate-ping" style="background:${isTurnBot ? '#ccff00' : '#2979ff'};"></span>
            <span class="text-xs font-semibold tracking-wide">${currentTurnName.toUpperCase()} ${isTurnBot ? '🤖 THINKING...' : "'S TURN"}</span>
          `;
        }
      }

      // Live Action Ticker status update
      const tickerText = document.getElementById('liveActionTickerText');
      if (tickerText) {
        if (room.status === 'waiting') {
          tickerText.innerHTML = `⏳ Waiting for players (${room.players.length}/${room.maxPlayers})...`;
        } else if (isMyTurn) {
          const selCard = myPlayer?.hand?.find(c => c.id === state.selectedCardId) || oddCard;
          tickerText.innerHTML = `👉 <b class="text-primary-neon">YOUR TURN!</b> Pass <b>${selCard ? selCard.name : 'odd card'}</b> ➔ Tap card or hit Pass!`;
        } else {
          tickerText.innerHTML = isTurnBot 
            ? `🤖 <b>${currentTurnName}</b> is choosing a card to pass...` 
            : `⏳ Waiting for <b>${currentTurnName}</b> to pass a card...`;
        }
      }

      // Auto-Pilot execution
      if (isMyTurn && state.autoPilot && room.status === 'playing') {
        if (!state.autoPilotTimer) {
          state.autoPilotTimer = setTimeout(() => {
            state.autoPilotTimer = null;
            passSelectedCard();
          }, 750);
        }
      }

      // Direction indicator
      const dirEl = document.getElementById('directionBadge');
      if (dirEl) {
        dirEl.innerHTML = `
          <span class="material-symbols-outlined text-[13px] animate-spin" style="color:#ccff00; animation-duration: 4s;">sync</span>
          <span class="text-[10px] font-bold tracking-wider uppercase" style="color:#ccff00;">${(room.passDirection || 'clockwise').toUpperCase()} PASS</span>
        `;
      }

      // Opponent Seats Render
      renderOpponentsTable(room);

      // Hand Render
      renderPlayerHand(myPlayer ? myPlayer.hand : [], isMyTurn);

      // Pass Action Button
      renderPassButton(isMyTurn);

      // Match Progress Bar
      renderHandProgressBar(myPlayer ? myPlayer.hand : []);
    } catch (e) {
      console.error('Error in renderActiveRoom:', e);
    }
  }

  function renderOpponentsTable(room) {
    const container = document.getElementById('opponentsContainer');
    if (!container) return;
    container.innerHTML = '';

    const activePlayerId = (state.isPassAndPlay && room.players ? room.players[room.turn]?.id : null) 
      || (room.players?.find(p => p.id === state.playerId)?.id)
      || (room.players?.find(p => !p.isBot)?.id)
      || room.players?.[0]?.id;

    const otherPlayers = room.players.filter(p => p.id !== activePlayerId);
    const count = otherPlayers.length;

    // Calculate circular positions around table
    otherPlayers.forEach((p, idx) => {
      const angle = (idx / Math.max(count, 1)) * 2 * Math.PI - Math.PI / 2;
      const radius = 105; // radius in px from center
      const x = Math.round(radius * Math.cos(angle));
      const y = Math.round(radius * Math.sin(angle));

      const isTurn = room.players[room.turn]?.id === p.id;
      const avatarIcon = (DEFAULT_AVATARS[p.avatar] || {}).icon || '🦊';

      const seat = document.createElement('div');
      seat.className = 'absolute flex flex-col items-center z-20 transition-all';
      seat.style.transform = `translate(${x}px, ${y}px)`;

      seat.innerHTML = `
        <div class="relative">
          <div class="w-11 h-11 rounded-full p-[2px] transition-all ${isTurn ? 'glow-cyan ring-2 ring-primary-neon' : 'bg-surface-high border border-white/20'}"
               style="${isTurn ? 'background: linear-gradient(135deg, #ccff00, #2979ff);' : ''}">
            <div class="w-full h-full rounded-full bg-surface-high flex items-center justify-center text-xl">
              ${avatarIcon}
            </div>
          </div>
          <div class="absolute -bottom-1 -right-1 bg-surface-low border border-white/20 px-1 py-0.2 rounded-full flex items-center gap-0.5 text-[9px] font-bold">
            <span class="material-symbols-outlined text-[10px] text-secondary">style</span>
            <span>${p.cardCount || 4}</span>
          </div>
        </div>
        <span class="text-[11px] font-semibold text-on-surface mt-0.5 max-w-[70px] truncate text-center">${p.name}</span>
        <span class="text-[9px] font-mono px-1 rounded ${isTurn ? 'text-primary-neon bg-primary-neon/10 font-bold animate-pulse' : 'text-muted'}">
          ${isTurn ? (p.isBot ? 'Thinking 🧠' : 'Turn ⚡') : (p.isBot ? 'Bot 🤖' : 'Ready')}
        </span>

      `;
      container.appendChild(seat);
    });

    // Host Waiting Controls (if in lobby status and host)
    const hostControls = document.getElementById('hostWaitingControls');
    const isHost = room.players.find(p => p.id === state.playerId)?.isHost;
    if (hostControls) {
      if (room.status === 'waiting') {
        hostControls.classList.remove('hidden');
        hostControls.innerHTML = `
          <div class="p-3 glass-panel-heavy mb-3 flex flex-col items-center gap-2.5">
            <p class="text-xs text-muted">Waiting for players (${room.players.length}/${room.maxPlayers})...</p>
            <div class="flex items-center gap-2">
              ${room.players.length < room.maxPlayers ? `
                <button class="btn-secondary px-3 py-1.5 text-xs" onclick="window.setApp.addBot()">
                  + Add Bot
                </button>
              ` : ''}
              ${isHost ? `
                <button class="btn-primary px-4 py-2 text-xs font-bold" onclick="window.setApp.startRoomGame()">
                  🚀 START GAME
                </button>
              ` : `
                <p class="text-[11px] text-primary-neon">Host will start the match</p>
              `}
            </div>
          </div>
        `;
      } else {
        hostControls.classList.add('hidden');
      }
    }
  }

  function renderPlayerHand(hand, isMyTurn) {
    const container = document.getElementById('playerHandGrid');
    if (!container) return;
    container.innerHTML = '';

    if (!hand || hand.length === 0) {
      const isWaiting = state.activeRoom && state.activeRoom.status === 'waiting';
      container.innerHTML = `
        <div class="col-span-4 p-5 text-center text-xs font-semibold text-muted glass-panel flex flex-col items-center justify-center gap-2 border border-white/10">
          <span class="text-2xl animate-bounce">${isWaiting ? '⏳' : '🃏'}</span>
          <span class="text-primary-neon font-bold text-sm">${isWaiting ? 'Waiting for host to start match...' : 'Dealing cards...'}</span>
          <span class="text-[10px] text-muted">${isWaiting ? 'Click "+ Add Bot" or "START GAME" above' : 'Cards arriving now'}</span>
        </div>
      `;
      return;
    }

    // Identify card counts to highlight matching vs odd
    const counts = {};
    hand.forEach(c => { counts[c.name] = (counts[c.name] || 0) + 1; });

    hand.forEach((card, index) => {
      const isSelected = state.selectedCardId === card.id;
      const isMatching = counts[card.name] > 1;

      const cardEl = document.createElement('div');
      cardEl.className = `game-card ${isSelected ? 'selected-pass' : ''} ${isMatching ? 'is-matching' : ''} ${isMyTurn ? 'ring-1 ring-primary-neon/40 cursor-pointer' : ''}`;
      cardEl.innerHTML = `
        ${isSelected ? '<div class="absolute -top-3 left-1/2 -translate-x-1/2 px-1.5 py-0.5 rounded-full text-[9px] font-black uppercase glow-cyan-sm" style="background:#ccff00; color:#050914;">PASS ➔</div>' : ''}
        <div class="w-full flex justify-between items-center text-[10px]">
          <span class="text-muted font-bold">#${index + 1}</span>
          <span class="text-primary-neon font-mono">${card.icon || '🃏'}</span>
        </div>
        <div class="game-card-icon">${card.icon || '🃏'}</div>
        <div class="w-full text-center">
          <span class="text-[11px] font-bold block leading-none text-on-surface truncate">${card.name}</span>
          <span class="text-[8px] font-bold uppercase tracking-wider ${isMatching ? 'text-primary-neon' : 'text-muted'}">
            ${counts[card.name] === 4 ? 'SET! 🔥' : (isMatching ? `${counts[card.name]}x MATCH` : 'ODD')}
          </span>
        </div>
      `;

      cardEl.onclick = () => {
        AudioEngine.cardSelect();
        vibrate([30]);
        if (isMyTurn && state.selectedCardId === card.id) {
          // Double-tap or second tap immediately passes the card!
          passSelectedCard();
        } else {
          state.selectedCardId = card.id;
          renderPlayerHand(hand, isMyTurn);
          renderPassButton(isMyTurn);
        }
      };

      container.appendChild(cardEl);
    });
  }

  function renderPassButton(isMyTurn) {
    const btn = document.getElementById('passCardButton');
    if (!btn) return;

    if (!isMyTurn) {
      btn.disabled = true;
      btn.className = 'w-full py-3 bg-surface-high text-muted font-bold rounded-xl cursor-not-allowed opacity-60 flex items-center justify-center gap-2';
      btn.innerHTML = `
        <span class="material-symbols-outlined text-[18px]">hourglass_empty</span>
        <span>WAITING FOR OPPONENT'S TURN...</span>
      `;
      return;
    }

    const myPlayer = state.activeRoom?.players.find(p => p.id === state.playerId);
    const selCard = myPlayer?.hand?.find(c => c.id === state.selectedCardId) || myPlayer?.hand?.[0];

    btn.disabled = false;
    btn.className = 'w-full py-3.5 btn-primary text-xs font-black rounded-xl glow-cyan cursor-pointer transition-all active:scale-95 flex items-center justify-center gap-2';
    btn.innerHTML = `
      <span class="material-symbols-outlined text-[20px] animate-bounce">send</span>
      <span>PASS ${selCard ? selCard.name.toUpperCase() : 'CARD'} ${selCard?.icon || ''} ➔</span>
      <span class="text-[9px] px-1.5 py-0.5 rounded bg-surface-lowest text-primary-neon font-mono font-black">1-TAP PASS</span>
    `;
    btn.onclick = () => {
      passSelectedCard();
    };
  }

  function renderHandProgressBar(hand) {
    const container = document.getElementById('matchProgressContainer');
    if (!container || !hand || hand.length === 0) return;

    const counts = {};
    let maxCount = 0;
    let maxItem = null;

    hand.forEach(c => {
      counts[c.name] = (counts[c.name] || 0) + 1;
      if (counts[c.name] > maxCount) {
        maxCount = counts[c.name];
        maxItem = c;
      }
    });

    const percent = (maxCount / 4) * 100;
    const remaining = 4 - maxCount;

    container.innerHTML = `
      <div class="flex items-center justify-between mb-1.5">
        <div class="flex items-center gap-1.5">
          <span class="text-base">${maxItem ? maxItem.icon : '🃏'}</span>
          <span class="text-xs font-bold text-on-surface">${maxCount} of 4 Matching (${maxItem ? maxItem.name : ''})</span>
        </div>
        <span class="text-[10px] font-bold font-mono px-2 py-0.5 rounded-full border border-primary-neon/40 text-primary-neon" style="background:#050914; color:#ccff00;">
          ${percent}% SET READY
        </span>
      </div>
      <div class="w-full h-2.5 rounded-full bg-surface-high p-0.5 border border-white/10 relative overflow-hidden">
        <div class="h-full rounded-full transition-all duration-300" style="width: ${percent}%; background: linear-gradient(90deg, #ccff00, #2979ff); box-shadow: 0 0 12px rgba(204,255,0,0.45);"></div>
      </div>
      <div class="flex justify-between items-center mt-1.5 text-[10px]">
        <span class="font-medium" style="color:#e0b6ff;">
          ${maxCount === 4 ? '🔥 4-OF-A-KIND COMPLETE! SLAP SET! 🔥' : `Need ${remaining} more ${maxItem ? maxItem.name : ''} to slam SET!`}
        </span>
        <span class="text-muted flex items-center gap-1 font-mono">
          <span class="material-symbols-outlined text-[12px] text-primary-neon">speed</span> Instant Slap
        </span>
      </div>
    `;

    // Slap Pile Center Glow when ready
    const slapButton = document.getElementById('centerSlapPileBtn');
    if (slapButton) {
      if (maxCount === 4) {
        slapButton.classList.add('glow-cyan', 'ring-4', 'ring-primary-neon', 'animate-bounce');
      } else {
        slapButton.classList.remove('glow-cyan', 'ring-4', 'ring-primary-neon', 'animate-bounce');
      }
    }
  }

  function passSelectedCard() {
    if (!state.activeRoom || !state.selectedCardId) return;

    if (state.isPassAndPlay) {
      handlePassAndPlayStep();
      return;
    }

    if (state.isSoloBots) {
      handleSoloHumanPass();
      return;
    }

    sendWsMessage('pass_card', {
      data: { cardId: state.selectedCardId }
    });
  }

  // Center Slap Pile Trigger
  function slapCenterPile() {
    AudioEngine.slap();
    vibrate([80, 40, 80]);

    if (!state.activeRoom) return;
    const myPlayer = state.activeRoom.players.find(p => p.id === state.playerId);
    if (!myPlayer) return;

    // Check if player has 4 of a kind
    const counts = {};
    myPlayer.hand.forEach(c => { counts[c.name] = (counts[c.name] || 0) + 1; });
    const hasWon = Object.values(counts).some(cnt => cnt === 4);

    if (hasWon) {
      AudioEngine.victory();
      showToast('🔥 SET! 4-OF-A-KIND CLAIMED! 🔥', 'success');
      // Pass card to trigger win validation on server if needed
    } else {
      AudioEngine.error();
      showToast('Not a 4-of-a-kind SET yet! Keep passing!', 'error');
    }
  }

  // --- VICTORY CELEBRATION MODAL ---
  function showVictoryModal(data) {
    AudioEngine.victory();
    vibrate([200, 100, 300, 100, 400]);

    const modal = document.getElementById('victoryModal');
    if (!modal) return;

    const winner = data.winner || {};
    const isMe = winner.id === state.playerId;
    const winningCard = data.winningCard || { name: 'Item', icon: '🍓' };

    // Update Player Streak
    if (isMe) {
      state.streak = (state.streak || 0) + 1;
      localStorage.setItem('set_player_streak', state.streak);
      updateStreakBadge();
    } else {
      if (state.streak > 0) {
        state.streak = 0;
        localStorage.setItem('set_player_streak', 0);
        updateStreakBadge();
      }
    }

    const streakText = document.getElementById('victoryStreakText');
    if (streakText) {
      streakText.innerHTML = isMe 
        ? `🔥 Win Streak: <b>${state.streak}</b> (+1 Streak Bonus!)` 
        : `Streak Broken! Current: <b>0</b> (Winner: ${winner.name || 'Bot'})`;
    }

    document.getElementById('victoryWinnerName').textContent = isMe ? 'YOU WON!' : `${winner.name} WINS!`;
    document.getElementById('victorySubtext').textContent = isMe ? 'You collected 4-of-a-Kind first!' : `${winner.name} collected 4 ${winningCard.name}s first!`;
    document.getElementById('victoryAvatarIcon').textContent = (DEFAULT_AVATARS[winner.avatar] || {}).icon || '🦊';

    // Show 4 winning cards
    const cardsRow = document.getElementById('winningCardsRow');
    if (cardsRow) {
      cardsRow.innerHTML = [1, 2, 3, 4].map(() => `
        <div class="w-14 h-20 rounded-xl p-1 bg-surface-high border-2 border-primary-neon flex flex-col justify-between items-center shadow-lg glow-cyan-sm">
          <span class="text-[9px] font-bold text-primary-neon">SET</span>
          <span class="text-2xl">${winningCard.icon || '🍓'}</span>
          <span class="text-[9px] font-bold text-on-surface truncate">${winningCard.name}</span>
        </div>
      `).join('');
    }

    // Trigger Confetti
    launchConfetti();
    modal.classList.remove('hidden');
  }

  function launchConfetti() {
    const container = document.getElementById('confettiContainer');
    if (!container) return;
    container.innerHTML = '';
    const colors = ['#ccff00', '#2979ff', '#38bdf8', '#b8f000', '#f1f5f9'];

    for (let i = 0; i < 40; i++) {
      const p = document.createElement('div');
      p.className = 'confetti-particle';
      p.style.left = `${Math.random() * 100}%`;
      p.style.backgroundColor = colors[Math.floor(Math.random() * colors.length)];
      p.style.animationDelay = `${Math.random() * 0.8}s`;
      p.style.transform = `rotate(${Math.random() * 360}deg)`;
      container.appendChild(p);
    }
  }

  // --- REACTION FLOATING EMOJIS ---
  function sendReaction(emoji) {
    AudioEngine.cardSelect();
    vibrate([25]);
    displayFloatingReaction(emoji, state.playerName);

    if (state.activeRoom) {
      sendWsMessage('send_reaction', {
        data: { emoji, name: state.playerName }
      });
    }
  }

  function displayFloatingReaction(emoji, sender) {
    const container = document.getElementById('floatingReactionsContainer');
    if (!container) return;

    const el = document.createElement('div');
    el.className = 'reaction-floating';
    el.style.left = `${30 + Math.random() * 40}%`;
    el.style.bottom = '120px';
    el.innerHTML = `<span>${emoji}</span>`;
    container.appendChild(el);

    setTimeout(() => {
      if (el.parentNode) el.parentNode.removeChild(el);
    }, 1900);
  }

  // --- MODALS & WORKFLOWS ---
  function openHostModal() {
    const modal = document.getElementById('hostModal');
    if (modal) {
      fetchServerIpInfo();
      modal.classList.remove('hidden');
    }
  }

  function closeHostModal() {
    const modal = document.getElementById('hostModal');
    if (modal) modal.classList.add('hidden');
  }

  function openJoinModal() {
    const modal = document.getElementById('joinModal');
    if (modal) {
      modal.classList.remove('hidden');
      const firstPin = modal.querySelector('.pin-box');
      if (firstPin) firstPin.focus();
    }
  }

  function closeJoinModal() {
    const modal = document.getElementById('joinModal');
    if (modal) modal.classList.add('hidden');
  }

  function openCustomDeckModal() {
    const modal = document.getElementById('customDeckModal');
    if (modal) modal.classList.remove('hidden');
  }

  function closeCustomDeckModal() {
    const modal = document.getElementById('customDeckModal');
    if (modal) modal.classList.add('hidden');
  }

  function closeAllModals() {
    document.querySelectorAll('.app-modal').forEach(m => m.classList.add('hidden'));
  }

  // Host Creates Room
  async function hostNewRoom() {
    const roomName = document.getElementById('hostRoomNameInput')?.value || `Room ${state.playerName}`;
    const maxPlayers = parseInt(document.getElementById('hostMaxPlayersSelect')?.value || '4', 10);
    const category = state.selectedCategory;

    closeHostModal();

    try {
      const res = await fetch('/api/rooms', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name: roomName, maxPlayers, category })
      });
      const data = await res.json();
      if (data.success && data.room) {
        state.activeRoom = data.room;
        sendWsMessage('join_room', { roomId: data.room.id });
        showGameScreen();
        renderActiveRoom();
      }
    } catch (e) {
      showToast('Failed to create room', 'error');
    }
  }

  // Join Room by 4-digit code
  function confirmJoinByCode() {
    const pins = Array.from(document.querySelectorAll('.pin-box')).map(el => el.value).join('');
    if (pins.length !== 4) {
      showToast('Please enter a 4-digit room code', 'error');
      return;
    }
    closeJoinModal();
    joinRoom(pins);
  }

  function joinRoom(roomId) {
    showToast(`Joining room #${roomId}...`, 'info');
    sendWsMessage('join_room', { roomId });
  }

  // Quick Play against AI bots (Instant, responsive, smart AI bots)
  function triggerQuickPlay() {
    startSoloBotMatch();
  }

  function startSoloBotMatch() {
    state.isPassAndPlay = false;
    state.isSoloBots = true;
    AudioEngine.cardSelect();
    vibrate([40]);

    const cat = state.categories[state.selectedCategory] || state.categories['Fruits'];
    const botPool = [
      { name: 'Cyber Fox', avatar: 'fox' },
      { name: 'Pixel Bot', avatar: 'bot' },
      { name: 'Astro Kid', avatar: 'astro' },
      { name: 'Neon Cat', avatar: 'cat' }
    ].filter(b => b.avatar !== state.playerAvatar).slice(0, 3);

    while (botPool.length < 3) {
      botPool.push({ name: `Bot_${botPool.length + 1}`, avatar: 'bot' });
    }

    // Pick 4 unique items for the 4 players
    const shuffledItems = [...cat.items].sort(() => Math.random() - 0.5);
    const selectedItems = shuffledItems.slice(0, 4);
    while (selectedItems.length < 4) {
      selectedItems.push({ name: `Item ${selectedItems.length + 1}`, icon: '⭐' });
    }

    // Build 16 cards (4 items * 4 duplicates)
    const deck = [];
    selectedItems.forEach(item => {
      for (let i = 0; i < 4; i++) {
        deck.push({
          ...item,
          id: `${item.name}-${i}-${Math.random().toString(36).substr(2, 6)}`
        });
      }
    });
    deck.sort(() => Math.random() - 0.5);

    // 4 Players: Human + 3 Smart AI Bots
    const players = [
      {
        id: state.playerId,
        name: state.playerName,
        avatar: state.playerAvatar,
        isHost: true,
        isBot: false,
        hand: deck.slice(0, 4)
      },
      {
        id: 'bot-1',
        name: botPool[0].name,
        avatar: botPool[0].avatar,
        isHost: false,
        isBot: true,
        hand: deck.slice(4, 8)
      },
      {
        id: 'bot-2',
        name: botPool[1].name,
        avatar: botPool[1].avatar,
        isHost: false,
        isBot: true,
        hand: deck.slice(8, 12)
      },
      {
        id: 'bot-3',
        name: botPool[2].name,
        avatar: botPool[2].avatar,
        isHost: false,
        isBot: true,
        hand: deck.slice(12, 16)
      }
    ];

    state.activeRoom = {
      id: Math.floor(1000 + Math.random() * 9000).toString(),
      name: 'Bot Battle Arena',
      category: state.selectedCategory,
      passDirection: 'clockwise',
      status: 'playing',
      turn: Math.floor(Math.random() * 4),
      round: 1,
      players,
      botTimers: []
    };

    showGameScreen();
    renderActiveRoom();
    AudioEngine.cardReceive();
    showToast('Match Started! Pass your odd card to win!', 'success');

    // Instant win check on deal
    for (const p of players) {
      const counts = {};
      p.hand.forEach(c => { counts[c.name] = (counts[c.name] || 0) + 1; });
      if (Object.values(counts).some(cnt => cnt === 4)) {
        state.activeRoom.status = 'gameover';
        renderActiveRoom();
        showVictoryModal({ winner: p, winningCard: p.hand[0] });
        return;
      }
    }

    scheduleSoloBotTurn();
  }

  function scheduleSoloBotTurn() {
    const room = state.activeRoom;
    if (!room || room.status !== 'playing' || !state.isSoloBots) return;

    if (room.botTimers) {
      room.botTimers.forEach(clearTimeout);
      room.botTimers = [];
    }

    const currentTurnPlayer = room.players[room.turn];
    if (!currentTurnPlayer) return;

    if (currentTurnPlayer.isBot) {
      const delay = 1000 + Math.random() * 500;
      const timer = setTimeout(() => {
        if (!state.activeRoom || state.activeRoom.status !== 'playing' || !state.isSoloBots) return;
        executeSoloBotMove(currentTurnPlayer);
      }, delay);
      room.botTimers.push(timer);
    } else {
      // Auto-Pilot execution if enabled
      if (state.autoPilot) {
        const autoTimer = setTimeout(() => {
          if (!state.activeRoom || state.activeRoom.status !== 'playing' || !state.isSoloBots) return;
          passSelectedCard();
        }, 800);
        room.botTimers.push(autoTimer);
      }
    }
  }

  function executeSoloBotMove(botPlayer) {
    const room = state.activeRoom;
    if (!room || room.status !== 'playing') return;

    // Smart Bot AI: Find least frequent item in hand
    const counts = {};
    botPlayer.hand.forEach(c => { counts[c.name] = (counts[c.name] || 0) + 1; });
    let lowestCount = 999;
    let cardToPass = botPlayer.hand[0];
    for (const card of botPlayer.hand) {
      if (counts[card.name] < lowestCount) {
        lowestCount = counts[card.name];
        cardToPass = card;
      }
    }

    const cardIdx = botPlayer.hand.findIndex(c => c.id === cardToPass.id);
    if (cardIdx === -1) return;
    const [passed] = botPlayer.hand.splice(cardIdx, 1);

    const nextIndex = (room.turn + 1) % room.players.length;
    const receiver = room.players[nextIndex];
    receiver.hand.push(passed);

    const tickerText = document.getElementById('liveActionTickerText');
    if (receiver.id === state.playerId) {
      AudioEngine.cardReceive();
      vibrate([60]);
      if (tickerText) tickerText.innerHTML = `🎁 <b>${botPlayer.name}</b> passed <b>${passed.name} ${passed.icon || ''}</b> to <b>YOU!</b>`;
    } else {
      if (tickerText) tickerText.innerHTML = `🔄 <b>${botPlayer.name}</b> passed to <b>${receiver.name}</b> ➔`;
    }

    // Win check
    const receiverCounts = {};
    receiver.hand.forEach(c => { receiverCounts[c.name] = (receiverCounts[c.name] || 0) + 1; });
    if (Object.values(receiverCounts).some(cnt => cnt === 4)) {
      room.status = 'gameover';
      renderActiveRoom();
      showVictoryModal({ winner: receiver, winningCard: passed });
      return;
    }

    room.turn = nextIndex;
    renderActiveRoom();
    checkTurnNotification();
    scheduleSoloBotTurn();
  }

  function handleSoloHumanPass() {
    const room = state.activeRoom;
    if (!room || room.status !== 'playing') return;

    const myPlayer = room.players.find(p => p.id === state.playerId);
    if (!myPlayer) return;

    // If no card selected, pick odd card automatically
    if (!state.selectedCardId && myPlayer.hand.length > 0) {
      const counts = {};
      myPlayer.hand.forEach(c => { counts[c.name] = (counts[c.name] || 0) + 1; });
      let lowestCount = 999;
      let oddCard = myPlayer.hand[0];
      for (const card of myPlayer.hand) {
        if (counts[card.name] < lowestCount) {
          lowestCount = counts[card.name];
          oddCard = card;
        }
      }
      state.selectedCardId = oddCard.id;
    }

    const cardIdx = myPlayer.hand.findIndex(c => c.id === state.selectedCardId);
    if (cardIdx === -1) return;

    const [passed] = myPlayer.hand.splice(cardIdx, 1);
    const nextIndex = (room.turn + 1) % room.players.length;
    const receiver = room.players[nextIndex];
    receiver.hand.push(passed);

    AudioEngine.cardPass();
    vibrate([40]);

    const tickerText = document.getElementById('liveActionTickerText');
    if (tickerText) tickerText.innerHTML = `⚡ You passed <b>${passed.name}</b> to <b>${receiver.name}</b> ➔`;

    // Win check
    const receiverCounts = {};
    receiver.hand.forEach(c => { receiverCounts[c.name] = (receiverCounts[c.name] || 0) + 1; });
    if (Object.values(receiverCounts).some(cnt => cnt === 4)) {
      room.status = 'gameover';
      renderActiveRoom();
      showVictoryModal({ winner: receiver, winningCard: passed });
      return;
    }

    state.selectedCardId = null;
    room.turn = nextIndex;
    renderActiveRoom();
    checkTurnNotification();
    scheduleSoloBotTurn();
  }


  // Pass & Play Mode (offline on single phone)
  function startPassAndPlay() {
    state.isPassAndPlay = true;
    const cat = state.categories[state.selectedCategory] || state.categories['Fruits'];
    const pNames = ['Player 1', 'Player 2', 'Player 3'];
    const selectedItems = cat.items.slice(0, 3);

    const deck = [];
    selectedItems.forEach(item => {
      for (let i = 0; i < 4; i++) {
        deck.push({ ...item, id: `${item.name}-${i}-${Math.random()}` });
      }
    });
    deck.sort(() => Math.random() - 0.5);

    const players = pNames.map((name, i) => ({
      id: `local-${i}`,
      name,
      avatar: ['fox', 'cat', 'bot'][i],
      isHost: i === 0,
      hand: deck.slice(i * 4, (i + 1) * 4)
    }));

    state.passAndPlayData = {
      id: 'LOCAL',
      name: 'Pass & Play Table',
      category: state.selectedCategory,
      passDirection: 'clockwise',
      status: 'playing',
      turn: 0,
      round: 1,
      players
    };

    state.activeRoom = state.passAndPlayData;
    showGameScreen();
    renderActiveRoom();
    showToast('Pass & Play Mode Started! Hand phone to Player 1.', 'success');
  }

  function handlePassAndPlayStep() {
    const data = state.passAndPlayData;
    if (!data || !state.selectedCardId) return;

    const currentP = data.players[data.turn];
    const cardIdx = currentP.hand.findIndex(c => c.id === state.selectedCardId);
    if (cardIdx === -1) return;

    const [passedCard] = currentP.hand.splice(cardIdx, 1);
    const nextTurn = (data.turn + 1) % data.players.length;
    const nextP = data.players[nextTurn];
    nextP.hand.push(passedCard);

    // Check winner
    const counts = {};
    nextP.hand.forEach(c => { counts[c.name] = (counts[c.name] || 0) + 1; });
    const isWin = Object.values(counts).some(cnt => cnt === 4);

    if (isWin) {
      showVictoryModal({
        winner: nextP,
        winningCard: passedCard
      });
      return;
    }

    data.turn = nextTurn;
    state.selectedCardId = null;

    // Show privacy screen before revealing next player cards
    showToast(`Passed! Hand phone to ${nextP.name} ➔`, 'success');
    renderActiveRoom();
  }

  // Custom Deck Submission
  async function submitCustomDeck() {
    const name = document.getElementById('customDeckNameInput')?.value.trim();
    const itemsRaw = document.getElementById('customDeckItemsInput')?.value.trim();

    if (!name || !itemsRaw) {
      showToast('Please enter category name and card items', 'error');
      return;
    }

    const items = itemsRaw.split(',').map(s => s.trim()).filter(Boolean);
    if (items.length < 4) {
      showToast('Please enter at least 4 items for a full game', 'error');
      return;
    }

    try {
      const res = await fetch('/api/categories', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name, items })
      });
      const data = await res.json();
      if (data.success) {
        state.categories = data.categories;
        state.selectedCategory = name;
        closeCustomDeckModal();
        renderCategoryPills();
        showToast(`Deck "${name}" saved successfully!`, 'success');
      }
    } catch (e) {
      showToast('Failed to save deck', 'error');
    }
  }

  // Toast Notification
  function showToast(message, type = 'info') {
    const toast = document.getElementById('appToast');
    if (!toast) return;
    toast.textContent = message;
    toast.className = `fixed top-20 left-1/2 -translate-x-1/2 z-50 px-4 py-2 rounded-full text-xs font-bold transition-all shadow-xl ${
      type === 'error' ? 'bg-error text-surface-low' : 'bg-primary-neon text-surface-low'
    }`;
    toast.style.display = 'block';
    setTimeout(() => {
      toast.style.display = 'none';
    }, 2800);
  }

  // --- INITIALIZATION ---
  window.addEventListener('DOMContentLoaded', () => {
    // Connect WebSocket
    connectWebSocket();

    // Fetch initial data
    fetchCategories();
    fetchRoomsList();
    fetchServerIpInfo();
    updateStreakBadge();

    // Setup Nickname input & Avatar selector
    const nickInput = document.getElementById('nicknameInput');
    if (nickInput) {
      nickInput.value = state.playerName;
      nickInput.oninput = (e) => {
        state.playerName = e.target.value.trim() || 'Player';
        localStorage.setItem('set_player_name', state.playerName);
      };
    }

    // Avatar selector elements
    document.querySelectorAll('.avatar-option').forEach(el => {
      el.onclick = () => {
        const av = el.getAttribute('data-avatar');
        state.playerAvatar = av;
        localStorage.setItem('set_player_avatar', av);
        AudioEngine.cardSelect();
        vibrate([20]);

        document.querySelectorAll('.avatar-option').forEach(item => {
          item.classList.remove('active-avatar');
          item.classList.add('opacity-75');
        });
        el.classList.add('active-avatar');
        el.classList.remove('opacity-75');
      };
    });

    // Pin input auto-focus flow
    const pinBoxes = document.querySelectorAll('.pin-box');
    pinBoxes.forEach((box, i) => {
      box.addEventListener('input', (e) => {
        if (e.target.value && i < pinBoxes.length - 1) {
          pinBoxes[i + 1].focus();
        }
      });
      box.addEventListener('keydown', (e) => {
        if (e.key === 'Backspace' && !e.target.value && i > 0) {
          pinBoxes[i - 1].focus();
        }
      });
    });

    // Polling interval for open rooms feed
    setInterval(fetchRoomsList, 5000);
  });

  // Expose global methods for onclick handlers
  window.setApp = {
    triggerQuickPlay,
    openHostModal,
    closeHostModal,
    hostNewRoom,
    openJoinModal,
    closeJoinModal,
    confirmJoinByCode,
    joinRoom,
    startRoomGame() { sendWsMessage('start_game', { roomId: state.activeRoom?.id }); },
    addBot() { sendWsMessage('add_bot', { roomId: state.activeRoom?.id }); },
    playAgain() {
      closeAllModals();
      if (state.isSoloBots) {
        startSoloBotMatch();
      } else if (state.isPassAndPlay) {
        startPassAndPlay();
      } else {
        sendWsMessage('play_again', { roomId: state.activeRoom?.id });
      }
    },

    returnToLobby() {
      if (state.activeRoom && state.activeRoom.botTimers) {
        state.activeRoom.botTimers.forEach(clearTimeout);
        state.activeRoom.botTimers = [];
      }
      state.isPassAndPlay = false;
      state.isSoloBots = false;
      state.passAndPlayData = null;
      if (state.autoPilotTimer) {
        clearTimeout(state.autoPilotTimer);
        state.autoPilotTimer = null;
      }
      showLobbyScreen();
    },
    sendReaction,
    slapCenterPile,
    startPassAndPlay,
    openCustomDeckModal,
    closeCustomDeckModal,
    submitCustomDeck,
    toggleAutoPilot() {
      state.autoPilot = !state.autoPilot;
      const btn = document.getElementById('autoPilotBtn');
      const txt = document.getElementById('autoPilotText');
      if (txt) {
        txt.textContent = state.autoPilot ? 'Pilot: ON' : 'Pilot: OFF';
      }
      if (btn) {
        if (state.autoPilot) {
          btn.style.background = '#ccff00';
          btn.style.color = '#050914';
          btn.style.boxShadow = '0 0 14px rgba(204,255,0,0.6)';
          showToast('🤖 Bot Pilot ON: Playing automatically!', 'success');
          if (state.activeRoom && state.activeRoom.players[state.activeRoom.turn]?.id === state.playerId) {
            passSelectedCard();
          }
        } else {
          btn.style.background = '';
          btn.style.color = '';
          btn.style.boxShadow = '';
          showToast('✋ Bot Pilot OFF: Manual control active', 'info');
        }
      }
    },
    toggleSound() {
      const enabled = AudioEngine.toggle();
      const icon = document.getElementById('soundIcon');
      if (icon) icon.textContent = enabled ? 'volume_up' : 'volume_off';
      showToast(enabled ? 'Sound Enabled 🔊' : 'Sound Muted 🔇');
    },
    randomizeName() {
      const nicks = ['SlapMaster_X', 'FastHands_42', 'TurboBanana', 'NeonClaw', 'PassGod_07', 'VoltPhantom', 'CherryKing'];
      const pick = nicks[Math.floor(Math.random() * nicks.length)];
      const input = document.getElementById('nicknameInput');
      if (input) {
        input.value = pick;
        state.playerName = pick;
        localStorage.setItem('set_player_name', pick);
      }
      AudioEngine.cardSelect();
    }
  };
})();
