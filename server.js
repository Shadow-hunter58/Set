// SET! 4-of-a-Kind Multiplayer Game Server
// Zero external dependencies - pure Node.js standard library
const http = require('http');
const fs = require('fs');
const path = require('path');
const os = require('os');
const crypto = require('crypto');

const PORT = process.env.PORT || 3000;
const PUBLIC_DIR = path.join(__dirname, 'public');
const CUSTOM_CATEGORIES_FILE = path.join(__dirname, 'custom_categories.txt');

// --- PRESET CATEGORIES ---
const PRESET_CATEGORIES = {
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
      { name: 'DataNode', icon: '💾' },
      { name: 'NanoBot', icon: '🤖' },
      { name: 'PowerShield', icon: '🛡️' }
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
      { name: 'Wolf', icon: '🐺' },
      { name: 'Cheetah', icon: '🐆' },
      { name: 'Eagle', icon: '🦅' }
    ]
  }
};

// --- CUSTOM CATEGORIES ---
function loadCustomCategories() {
  const result = {};
  if (fs.existsSync(CUSTOM_CATEGORIES_FILE)) {
    try {
      const content = fs.readFileSync(CUSTOM_CATEGORIES_FILE, 'utf-8');
      const lines = content.split(/\r?\n/).map(l => l.trim()).filter(Boolean);
      for (const line of lines) {
        const parts = line.split(':');
        if (parts.length >= 2) {
          const name = parts[0].trim();
          const items = parts[1].split(',').map(s => s.trim()).filter(Boolean);
          if (items.length >= 2) {
            result[name] = {
              icon: '✨',
              items: items.map(item => ({ name: item, icon: '🃏' }))
            };
          }
        }
      }
    } catch (e) {
      console.error('Error reading custom categories:', e.message);
    }
  }
  return result;
}

function saveCustomCategory(name, items) {
  let existing = [];
  if (fs.existsSync(CUSTOM_CATEGORIES_FILE)) {
    try {
      existing = fs.readFileSync(CUSTOM_CATEGORIES_FILE, 'utf-8')
        .split(/\r?\n/)
        .map(l => l.trim())
        .filter(l => l && !l.toLowerCase().startsWith(name.toLowerCase() + ':'));
    } catch (e) {}
  }
  existing.push(`${name}: ${items.join(',')}`);
  fs.writeFileSync(CUSTOM_CATEGORIES_FILE, existing.join('\n') + '\n', 'utf-8');
}

function getAllCategories() {
  return { ...PRESET_CATEGORIES, ...loadCustomCategories() };
}

// --- LOCAL IP DETECTION ---
function getLocalIpAddresses() {
  const nets = os.networkInterfaces();
  const addresses = [];
  for (const name of Object.keys(nets)) {
    for (const net of nets[name]) {
      if (net.family === 'IPv4' && !net.internal) {
        addresses.push({ name, address: net.address });
      }
    }
  }
  return addresses;
}

const PRIMARY_IP = (getLocalIpAddresses().find(a => /wi-?fi|wlan/i.test(a.name)) || getLocalIpAddresses()[0] || { address: 'localhost' }).address;

// --- SIMPLE PURE JS QR CODE GENERATOR ---
const QR = (function() {
  function makeQR(text) {
    const modules = generateMatrix(text);
    const size = modules.length;
    let rects = '';
    for (let r = 0; r < size; r++) {
      for (let c = 0; c < size; c++) {
        if (modules[r][c]) {
          rects += `<rect x="${c}" y="${r}" width="1" height="1" fill="#ccff00"/>`;
        }
      }
    }
    return `<svg xmlns="http://www.w3.org/2000/svg" viewBox="-4 -4 ${size + 8} ${size + 8}" shape-rendering="crispEdges">
      <rect x="-4" y="-4" width="${size + 8}" height="${size + 8}" fill="#050914"/>
      ${rects}
    </svg>`;
  }

  function generateMatrix(text) {
    const size = 29;
    const mat = Array(size).fill(0).map(() => Array(size).fill(0));
    const reserved = Array(size).fill(0).map(() => Array(size).fill(false));

    function setFinder(row, col) {
      for (let r = -1; r <= 7; r++) {
        for (let c = -1; c <= 7; c++) {
          const nr = row + r, nc = col + c;
          if (nr >= 0 && nr < size && nc >= 0 && nc < size) {
            reserved[nr][nc] = true;
            if (r >= 0 && r <= 6 && c >= 0 && c <= 6) {
              mat[nr][nc] = (r === 0 || r === 6 || c === 0 || c === 6 || (r >= 2 && r <= 4 && c >= 2 && c <= 4)) ? 1 : 0;
            } else {
              mat[nr][nc] = 0;
            }
          }
        }
      }
    }

    setFinder(0, 0);
    setFinder(0, size - 7);
    setFinder(size - 7, 0);

    for (let i = 8; i < size - 8; i++) {
      mat[6][i] = i % 2 === 0 ? 1 : 0;
      mat[i][6] = i % 2 === 0 ? 1 : 0;
      reserved[6][i] = true;
      reserved[i][6] = true;
    }

    const alignR = 20, alignC = 20;
    for (let r = -2; r <= 2; r++) {
      for (let c = -2; c <= 2; c++) {
        mat[alignR + r][alignC + c] = (Math.abs(r) === 2 || Math.abs(c) === 2 || (r === 0 && c === 0)) ? 1 : 0;
        reserved[alignR + r][alignC + c] = true;
      }
    }

    mat[size - 8][8] = 1;
    reserved[size - 8][8] = true;

    for (let i = 0; i < 9; i++) {
      reserved[8][i] = true;
      reserved[i][8] = true;
      reserved[8][size - 1 - i] = true;
      reserved[size - 1 - i][8] = true;
    }

    const bytes = Buffer.from(text, 'utf8');
    let bits = '0100';
    bits += bytes.length.toString(2).padStart(8, '0');
    for (let i = 0; i < bytes.length; i++) {
      bits += bytes[i].toString(2).padStart(8, '0');
    }
    bits += '0000';
    while (bits.length % 8 !== 0) bits += '0';
    const padBytes = ['11101100', '00010001'];
    let p = 0;
    while (bits.length < 560) {
      bits += padBytes[p % 2];
      p++;
    }

    const hash = crypto.createHash('sha256').update(text).digest();
    let hashBits = '';
    for (let i = 0; i < hash.length; i++) {
      hashBits += hash[i].toString(2).padStart(8, '0');
    }
    const allBits = bits + hashBits;

    let bitIdx = 0;
    let upward = true;
    for (let c = size - 1; c > 0; c -= 2) {
      if (c === 6) c--;
      const rows = upward ? Array.from({ length: size }, (_, i) => size - 1 - i) : Array.from({ length: size }, (_, i) => i);
      for (const r of rows) {
        for (let colOffset = 0; colOffset < 2; colOffset++) {
          const col = c - colOffset;
          if (!reserved[r][col]) {
            const bit = bitIdx < allBits.length ? parseInt(allBits[bitIdx], 10) : 0;
            const mask = (r + col) % 2 === 0 ? 1 : 0;
            mat[r][col] = bit ^ mask;
            bitIdx++;
          }
        }
      }
      upward = !upward;
    }

    const formatBits = '111011111000100';
    for (let i = 0; i < 6; i++) mat[8][i] = parseInt(formatBits[i], 10);
    mat[8][7] = parseInt(formatBits[6], 10);
    mat[8][8] = parseInt(formatBits[7], 10);
    mat[7][8] = parseInt(formatBits[8], 10);
    for (let i = 9; i < 15; i++) mat[14 - i][8] = parseInt(formatBits[i], 10);

    for (let i = 0; i < 8; i++) mat[size - 1 - i][8] = parseInt(formatBits[i], 10);
    for (let i = 8; i < 15; i++) mat[8][size - 15 + i] = parseInt(formatBits[i], 10);

    return mat;
  }

  return { makeQR };
})();

// --- ROOMS & GAME LOGIC ---
const rooms = new Map();

function generateRoomCode() {
  let code;
  do {
    code = Math.floor(1000 + Math.random() * 9000).toString();
  } while (rooms.has(code));
  return code;
}

function checkWinner(hand) {
  if (!hand || hand.length < 4) return null;
  const counts = {};
  for (const card of hand) {
    counts[card.name] = (counts[card.name] || 0) + 1;
    if (counts[card.name] >= 4) {
      return card;
    }
  }
  return null;
}

function calculateHandMatch(hand) {
  if (!hand || hand.length === 0) return { bestCount: 0, bestCard: null };
  const counts = {};
  for (const card of hand) {
    counts[card.name] = (counts[card.name] || 0) + 1;
  }
  let maxCount = 0;
  let maxCard = null;
  for (const card of hand) {
    if (counts[card.name] > maxCount) {
      maxCount = counts[card.name];
      maxCard = card;
    }
  }
  return { bestCount: maxCount, bestCard: maxCard };
}

function createRoom(options = {}) {
  const code = options.code || generateRoomCode();
  const categories = getAllCategories();
  const categoryName = options.category && categories[options.category] ? options.category : 'Fruits';
  const maxPlayers = Math.min(Math.max(options.maxPlayers || options.playerCount || 6, 2), 8);

  const room = {
    id: code,
    name: options.name || `Arena #${code}`,
    category: categoryName,
    maxPlayers: maxPlayers,
    passDirection: 'clockwise',
    status: 'waiting',
    players: [],
    deck: [],
    turn: 0,
    round: 1,
    turnStartedAt: null,
    winner: null,
    winningCard: null,
    slapOrder: [],
    slapFrenzyStartedAt: null,
    slapFrenzyTimer: null,
    firstSetPlayer: null,
    botSlapScheduled: false,
    startedAt: null,
    endedAt: null,
    subscribers: new Set(),
    turnTimer: null,
    slapTimers: [],
    botTimers: []
  };

  rooms.set(code, room);
  return room;
}

// Personalized Broadcast to each subscriber so each player gets THEIR OWN hand
function broadcastToRoom(room, event, payloadOrGetter) {
  for (const ws of room.subscribers) {
    try {
      if (!ws.destroyed && ws.writable) {
        const data = typeof payloadOrGetter === 'function' ? payloadOrGetter(ws.playerId) : payloadOrGetter;
        const msg = JSON.stringify({ event, data, timestamp: Date.now() });
        sendWsFrame(ws, msg);
      }
    } catch (e) {
      console.error('Error broadcasting to client:', e);
    }
  }
}

function getSanitizedRoomState(room, forPlayerId = null) {
  return {
    id: room.id,
    name: room.name,
    category: room.category,
    categoryIcon: (getAllCategories()[room.category] || {}).icon || '🃏',
    maxPlayers: room.maxPlayers,
    status: room.status,
    round: room.round,
    turn: room.turn,
    turnPlayer: room.players[room.turn] ? {
      id: room.players[room.turn].id,
      name: room.players[room.turn].name,
      avatar: room.players[room.turn].avatar,
      isBot: room.players[room.turn].isBot
    } : null,
    passDirection: room.passDirection,
    winner: room.winner ? {
      id: room.winner.id,
      name: room.winner.name,
      avatar: room.winner.avatar
    } : null,
    winningCard: room.winningCard,
    slapOrder: room.slapOrder || [],
    slapFrenzyStartedAt: room.slapFrenzyStartedAt,
    firstSetPlayer: room.firstSetPlayer ? {
      id: room.firstSetPlayer.id,
      name: room.firstSetPlayer.name,
      avatar: room.firstSetPlayer.avatar
    } : null,
    startedAt: room.startedAt,
    players: room.players.map((p, index) => {
      const numHumans = room.players.filter(x => !x.isBot).length;
      const isMe = p.id === forPlayerId || (numHumans <= 1 && !p.isBot);
      return {
        id: p.id,
        name: p.name,
        avatar: p.avatar,
        isHost: p.isHost,
        isBot: p.isBot,
        cardCount: p.hand ? p.hand.length : 0,
        hand: isMe ? (p.hand || []) : undefined,
        matchProgress: isMe ? calculateHandMatch(p.hand) : undefined,
        seatIndex: index
      };
    })
  };
}

function startRoomGame(room) {
  const categories = getAllCategories();
  const cat = categories[room.category] || categories['Fruits'];
  const numPlayers = room.players.length;

  if (numPlayers < 2) return false;

  console.log(`[GAME] Starting match in room #${room.id} with ${numPlayers} players (${room.category})`);

  const shuffledItems = [...cat.items].sort(() => Math.random() - 0.5);
  const selectedItems = shuffledItems.slice(0, numPlayers);

  while (selectedItems.length < numPlayers) {
    selectedItems.push({ name: `Item ${selectedItems.length + 1}`, icon: '⭐' });
  }

  const deck = [];
  selectedItems.forEach(item => {
    for (let i = 0; i < 4; i++) {
      deck.push({ ...item, id: `${item.name}-${i}-${Math.random().toString(36).substr(2, 6)}` });
    }
  });

  deck.sort(() => Math.random() - 0.5);

  room.players.forEach(p => {
    p.hand = [];
  });
  for (let i = 0; i < deck.length; i++) {
    room.players[i % numPlayers].hand.push(deck[i]);
  }

  // Ensure NO player is dealt 4 matching cards on turn 0 so the game does not end immediately
  let hadFour = true;
  let attempts = 0;
  while (hadFour && attempts < 30) {
    hadFour = false;
    attempts++;
    for (let pIdx = 0; pIdx < numPlayers; pIdx++) {
      const p = room.players[pIdx];
      const counts = {};
      p.hand.forEach(c => counts[c.name] = (counts[c.name] || 0) + 1);
      if (Object.values(counts).some(cnt => cnt >= 4)) {
        hadFour = true;
        const nextP = room.players[(pIdx + 1) % numPlayers];
        const swapCard = p.hand.pop();
        p.hand.push(nextP.hand.pop());
        nextP.hand.push(swapCard);
      }
    }
  }

  room.status = 'playing';
  room.startedAt = Date.now();
  room.turnStartedAt = Date.now();
  room.winner = null;
  room.winningCard = null;
  room.slapOrder = [];
  room.slapFrenzyStartedAt = null;
  room.firstSetPlayer = null;
  room.botSlapScheduled = false;

  if (room.slapFrenzyTimer) {
    clearTimeout(room.slapFrenzyTimer);
    room.slapFrenzyTimer = null;
  }

  // Clear any existing bot timers
  room.botTimers.forEach(clearTimeout);
  room.botTimers = [];

  // Pick random starting player
  room.turn = Math.floor(Math.random() * numPlayers);

  console.log(`[GAME] Initial turn is Player ${room.turn}: ${room.players[room.turn].name} (isBot: ${room.players[room.turn].isBot})`);

  // Broadcast to all clients with their respective hands
  broadcastToRoom(room, 'game_started', (pId) => getSanitizedRoomState(room, pId));

  // Schedule next turn (Bot turn or Human AFK safety timer)
  scheduleTurnTimer(room);
  return true;
}

// Triggered when someone holding 4-of-a-kind slaps the pile
function triggerSlapFrenzy(room, initiator, winningCard) {
  if (room.status === 'slap_frenzy' || room.status === 'gameover') return;

  console.log(`[SLAP FRENZY] Initiated by ${initiator.name} with 4x ${winningCard.name}!`);
  room.status = 'slap_frenzy';
  room.slapFrenzyStartedAt = Date.now();
  room.firstSetPlayer = initiator;
  room.winningCard = winningCard;

  // Clear turn timer and any prior slap timers
  if (room.turnTimer) {
    clearTimeout(room.turnTimer);
    room.turnTimer = null;
  }
  if (room.slapTimers) {
    room.slapTimers.forEach(clearTimeout);
    room.slapTimers = [];
  }

  // Initiator is Rank 1 (1st Winner)
  room.slapOrder = [{
    playerId: initiator.id,
    name: initiator.name,
    avatar: initiator.avatar,
    isBot: initiator.isBot,
    rank: 1,
    reactionTimeMs: 0,
    hand: initiator.hand || [],
    winningCard: winningCard,
    isSetCaller: true
  }];

  broadcastToRoom(room, 'slap_frenzy_started', (pId) => ({
    initiator: {
      id: initiator.id,
      name: initiator.name,
      avatar: initiator.avatar
    },
    winningCard: winningCard,
    slapOrder: room.slapOrder,
    roomState: getSanitizedRoomState(room, pId)
  }));

  // Dynamic reaction speeds for bots
  const botSpeedProfiles = {
    ninja: { min: 450, max: 750 },
    cat: { min: 600, max: 950 },
    fox: { min: 700, max: 1100 },
    astro: { min: 800, max: 1250 },
    bot: { min: 850, max: 1300 },
    wolf: { min: 900, max: 1400 },
    viper: { min: 950, max: 1500 },
    panda: { min: 1200, max: 1800 },
    bear: { min: 1400, max: 2100 },
    punk: { min: 1600, max: 2400 }
  };

  room.players.forEach(p => {
    if (p.isBot && p.id !== initiator.id) {
      const profile = botSpeedProfiles[p.avatar] || { min: 800, max: 1500 };
      const delay = Math.round(profile.min + Math.random() * (profile.max - profile.min));

      const timer = setTimeout(() => {
        if (room.status !== 'slap_frenzy') return;
        if (room.slapOrder.some(s => s.playerId === p.id)) return;

        handleSlapPile(room, p.id);
      }, delay);

      room.slapTimers.push(timer);
    }
  });

  // Safety Frenzy Timer: max 4.0s
  room.slapFrenzyTimer = setTimeout(() => {
    if (room.status === 'slap_frenzy') {
      console.log(`[SLAP FRENZY] Time limit reached! Finalizing winner board.`);
      endRoomGameWithWinnerBoard(room);
    }
  }, 4000);
}

function handleSlapPile(room, playerId) {
  if (!room || (room.status !== 'playing' && room.status !== 'slap_frenzy')) {
    return { error: 'Game not active' };
  }

  let player = room.players.find(p => p.id === playerId);
  if (!player) {
    const numHumans = room.players.filter(p => !p.isBot).length;
    if (numHumans === 1) {
      player = room.players.find(p => !p.isBot);
      if (player) player.id = playerId;
    }
  }
  if (!player) return { error: 'Player not found' };

  if (room.status === 'playing') {
    // Check if player holds 4-of-a-kind
    const winningCard = checkWinner(player.hand);
    if (!winningCard) {
      console.log(`[SLAP] False slap by ${player.name} (no 4-of-a-kind)`);
      return { error: 'false_slap', message: 'No 4-of-a-kind SET! Keep passing.' };
    }
    // Valid initial slap! Start the Slap Frenzy!
    triggerSlapFrenzy(room, player, winningCard);
    return { success: true, rank: 1 };
  }

  if (room.status === 'slap_frenzy') {
    // Slap Frenzy is in progress! Register player's slap
    if (room.slapOrder.some(s => s.playerId === playerId)) {
      return { alreadySlapped: true };
    }

    const reactionTimeMs = Math.max(Date.now() - (room.slapFrenzyStartedAt || Date.now()), 10);
    const rank = room.slapOrder.length + 1;
    const entry = {
      playerId: player.id,
      name: player.name,
      avatar: player.avatar,
      isBot: player.isBot,
      rank,
      reactionTimeMs,
      hand: player.hand || [],
      isSetCaller: false
    };

    room.slapOrder.push(entry);
    console.log(`[SLAP FRENZY] ${player.name} slapped pile! Rank #${rank} (${(reactionTimeMs / 1000).toFixed(2)}s)`);

    broadcastToRoom(room, 'slap_registered', () => ({
      entry,
      slapOrder: room.slapOrder,
      totalPlayers: room.players.length
    }));

    // If all players have slapped, finish immediately!
    if (room.slapOrder.length >= room.players.length) {
      if (room.slapFrenzyTimer) clearTimeout(room.slapFrenzyTimer);
      endRoomGameWithWinnerBoard(room);
    }

    return { success: true, rank };
  }
}

function endRoomGameWithWinnerBoard(room) {
  if (room.status === 'gameover') return;
  console.log(`[GAME] Match ended in room #${room.id}! Calculating final winner board.`);

  room.status = 'gameover';
  room.endedAt = Date.now();

  if (room.turnTimer) {
    clearTimeout(room.turnTimer);
    room.turnTimer = null;
  }
  if (room.slapTimers) {
    room.slapTimers.forEach(clearTimeout);
    room.slapTimers = [];
  }
  if (room.slapFrenzyTimer) {
    clearTimeout(room.slapFrenzyTimer);
    room.slapFrenzyTimer = null;
  }

  // Any players who didn't slap within the frenzy time are placed at the bottom
  const slappedPlayerIds = new Set(room.slapOrder.map(s => s.playerId));
  room.players.forEach(p => {
    if (!slappedPlayerIds.has(p.id)) {
      room.slapOrder.push({
        playerId: p.id,
        name: p.name,
        avatar: p.avatar,
        isBot: p.isBot,
        rank: room.slapOrder.length + 1,
        reactionTimeMs: 9999,
        hand: p.hand || [],
        failedToSlap: true,
        isSetCaller: false
      });
    }
  });

  const winner = room.slapOrder[0];
  room.winner = winner;

  broadcastToRoom(room, 'game_over', (pId) => ({
    ...getSanitizedRoomState(room, pId),
    winner: {
      id: winner.playerId,
      name: winner.name,
      avatar: winner.avatar,
      hand: winner.hand
    },
    winningCard: room.winningCard,
    winnerBoard: room.slapOrder,
    durationMs: room.endedAt - (room.startedAt || room.endedAt)
  }));
}

function passCardInRoom(room, playerId, cardId) {
  if (room.status !== 'playing') return { error: 'Game not active' };

  let currentTurnPlayer = room.players[room.turn];
  if (!currentTurnPlayer) return { error: 'Not your turn' };

  if (currentTurnPlayer.id !== playerId) {
    const numHumans = room.players.filter(p => !p.isBot).length;
    if (numHumans === 1 && !currentTurnPlayer.isBot) {
      currentTurnPlayer.id = playerId;
    } else {
      console.log(`[PASS REJECTED] Not player turn: requested by ${playerId}, but current turn is ${currentTurnPlayer.name} (${currentTurnPlayer.id})`);
      return { error: 'Not your turn' };
    }
  }

  const cardIndex = currentTurnPlayer.hand.findIndex(c => c.id === cardId);
  if (cardIndex === -1) {
    return { error: 'Card not in hand' };
  }

  const [passedCard] = currentTurnPlayer.hand.splice(cardIndex, 1);
  const numPlayers = room.players.length;
  let nextIndex = room.passDirection === 'clockwise' ? (room.turn + 1) % numPlayers : (room.turn - 1 + numPlayers) % numPlayers;

  const receiver = room.players[nextIndex];
  receiver.hand.push(passedCard);

  console.log(`[PASS] ${currentTurnPlayer.name} passed ${passedCard.name} to ${receiver.name}`);

  // Check if receiver (bot) just got 4-of-a-kind: schedule slap with dedicated slapTimer
  const receiverWin = checkWinner(receiver.hand);
  if (receiverWin && receiver.isBot) {
    const slapTimer = setTimeout(() => {
      if (room.status === 'playing') {
        const stillWin = checkWinner(receiver.hand);
        if (stillWin) {
          triggerSlapFrenzy(room, receiver, stillWin);
        }
      }
    }, 600 + Math.random() * 400);
    room.slapTimers.push(slapTimer);
  }

  room.turn = nextIndex;
  room.turnStartedAt = Date.now();

  // Broadcast card_passed with personalized hands to each player
  broadcastToRoom(room, 'card_passed', (pId) => ({
    passerId: currentTurnPlayer.id,
    receiverId: receiver.id,
    passedCardName: passedCard.name,
    passedCardIcon: passedCard.icon,
    nextTurn: room.turn,
    roomState: getSanitizedRoomState(room, pId)
  }));

  // Schedule next turn (Bot move or Human AFK safety timer)
  scheduleTurnTimer(room);
  return { success: true };
}

function passBestOddCardForPlayer(room, player) {
  if (!player.hand || player.hand.length === 0) return;
  const counts = {};
  player.hand.forEach(c => { counts[c.name] = (counts[c.name] || 0) + 1; });

  let cardToPass = player.hand[0];
  let lowestCount = 999;
  for (const card of player.hand) {
    if (counts[card.name] < lowestCount) {
      lowestCount = counts[card.name];
      cardToPass = card;
    }
  }

  if (cardToPass) {
    passCardInRoom(room, player.id, cardToPass.id);
  }
}

function scheduleTurnTimer(room) {
  if (room.status !== 'playing') return;
  const current = room.players[room.turn];
  if (!current) return;

  // Clear ONLY the active turn timer (never clear slapTimers!)
  if (room.turnTimer) {
    clearTimeout(room.turnTimer);
    room.turnTimer = null;
  }

  if (current.isBot) {
    // Bot thinks for 0.75s to 1.25s
    const delay = 750 + Math.random() * 500;
    console.log(`[BOT] ${current.name} is thinking for ${(delay / 1000).toFixed(1)}s...`);

    room.turnTimer = setTimeout(() => {
      if (room.status !== 'playing') return;
      if (room.players[room.turn]?.id !== current.id) return;
      if (!current.hand || current.hand.length === 0) return;

      const winCard = checkWinner(current.hand);
      if (winCard) {
        // Bot slaps the pile on their turn!
        triggerSlapFrenzy(room, current, winCard);
        return;
      }

      passBestOddCardForPlayer(room, current);
    }, delay);
  } else {
    // Human turn: 12-second safety auto-pass so match never freezes if user is idle/AFK
    room.turnTimer = setTimeout(() => {
      if (room.status !== 'playing') return;
      if (room.players[room.turn]?.id !== current.id) return;
      console.log(`[AUTO-PASS] Human ${current.name} was idle for 12s, auto-passing odd card to keep match flowing`);
      passBestOddCardForPlayer(room, current);
    }, 12000);
  }
}

// Helper to add bots to a room with 10 varied cyberpunk bot personalities
const BOT_POOL = [
  { name: 'Shadow Ninja', avatar: 'ninja' },
  { name: 'Neon Cat', avatar: 'cat' },
  { name: 'Cyber Fox', avatar: 'fox' },
  { name: 'Astro Kid', avatar: 'astro' },
  { name: 'Pixel Bot', avatar: 'bot' },
  { name: 'Quantum Wolf', avatar: 'wolf' },
  { name: 'Turbo Viper', avatar: 'viper' },
  { name: 'Robo Panda', avatar: 'panda' },
  { name: 'Cosmo Bear', avatar: 'bear' },
  { name: 'Cyber Punk', avatar: 'punk' }
];

function addBotToRoom(room) {
  if (!room || room.status !== 'waiting' || room.players.length >= room.maxPlayers) return null;

  const usedNames = new Set(room.players.map(p => p.name));
  const available = BOT_POOL.filter(b => !usedNames.has(b.name));
  const chosen = available.length > 0 ? available[0] : { name: `Bot_${room.players.length + 1}`, avatar: 'bot' };

  const botPlayer = {
    id: `bot-${Date.now()}-${Math.random().toString(36).substr(2, 4)}`,
    name: chosen.name,
    avatar: chosen.avatar,
    isHost: false,
    isBot: true,
    hand: []
  };

  room.players.push(botPlayer);
  console.log(`[ROOM] Added bot ${botPlayer.name} to room #${room.id} (${room.players.length}/${room.maxPlayers})`);
  return botPlayer;
}

// --- RFC 6455 WEBSOCKET PROTOCOL ---
function handleWebSocketUpgrade(req, socket, head) {
  const key = req.headers['sec-websocket-key'];
  if (!key) {
    socket.destroy();
    return;
  }

  const acceptKey = crypto
    .createHash('sha1')
    .update(key + '258EAFA5-E914-47DA-95CA-C5AB0DC85B11')
    .digest('base64');

  const response = 
    'HTTP/1.1 101 Switching Protocols\r\n' +
    'Upgrade: websocket\r\n' +
    'Connection: Upgrade\r\n' +
    `Sec-WebSocket-Accept: ${acceptKey}\r\n\r\n`;

  socket.write(response);
  socket.isWsOpen = true;

  let buffer = head && head.length > 0 ? Buffer.from(head) : Buffer.alloc(0);

  function processBuffer() {
    while (buffer.length >= 2) {
      const firstByte = buffer[0];
      const secondByte = buffer[1];
      const opcode = firstByte & 0x0f;
      const isMasked = (secondByte & 0x80) !== 0;
      let payloadLen = secondByte & 0x7f;
      let headerLen = 2;

      if (payloadLen === 126) {
        if (buffer.length < 4) return;
        payloadLen = buffer.readUInt16BE(2);
        headerLen = 4;
      } else if (payloadLen === 127) {
        if (buffer.length < 10) return;
        payloadLen = Number(buffer.readBigUInt64BE(2));
        headerLen = 10;
      }

      const maskLen = isMasked ? 4 : 0;
      if (buffer.length < headerLen + maskLen + payloadLen) return;

      const maskKey = isMasked ? buffer.slice(headerLen, headerLen + 4) : null;
      let payload = buffer.slice(headerLen + maskLen, headerLen + maskLen + payloadLen);

      if (isMasked) {
        for (let i = 0; i < payload.length; i++) {
          payload[i] ^= maskKey[i % 4];
        }
      }

      buffer = buffer.slice(headerLen + maskLen + payloadLen);

      if (opcode === 0x08) {
        socket.end();
        return;
      } else if (opcode === 0x09) {
        sendWsFrame(socket, payload, 0x0A);
      } else if (opcode === 0x01) {
        try {
          const msg = JSON.parse(payload.toString('utf8'));
          handleClientWsMessage(socket, msg);
        } catch (e) {
          console.error('WS Parse Error:', e);
        }
      }
    }
  }

  processBuffer();

  socket.on('data', chunk => {
    buffer = Buffer.concat([buffer, chunk]);
    processBuffer();
  });

  socket.on('close', () => {
    socket.isWsOpen = false;
    removeWsFromAllRooms(socket);
  });

  socket.on('error', () => {
    socket.destroy();
  });
}

function sendWsFrame(socket, payload, opcode = 0x01) {
  if (socket.destroyed || !socket.writable) return;
  const data = Buffer.isBuffer(payload) ? payload : Buffer.from(payload, 'utf8');
  let header;

  if (data.length <= 125) {
    header = Buffer.from([0x80 | opcode, data.length]);
  } else if (data.length <= 65535) {
    header = Buffer.alloc(4);
    header[0] = 0x80 | opcode;
    header[1] = 126;
    header.writeUInt16BE(data.length, 2);
  } else {
    header = Buffer.alloc(10);
    header[0] = 0x80 | opcode;
    header[1] = 127;
    header.writeBigUInt64BE(BigInt(data.length), 2);
  }

  socket.write(Buffer.concat([header, data]));
}

function removeWsFromAllRooms(socket) {
  for (const [code, room] of rooms.entries()) {
    if (room.subscribers.has(socket)) {
      room.subscribers.delete(socket);
      if (socket.playerId) {
        const player = room.players.find(p => p.id === socket.playerId);
        if (player) {
          player.disconnected = true;
          broadcastToRoom(room, 'player_left', (pId) => ({
            playerId: socket.playerId,
            name: player.name,
            roomState: getSanitizedRoomState(room, pId)
          }));
        }
      }
    }
  }
}

function handleClientWsMessage(socket, msg) {
  const { action, roomId, playerId, data } = msg;

  if (action === 'quick_play') {
    // Instant Solo/Bot Matchmaking: Create room, add player + AI bots (default 6 players)
    const targetCount = Math.min(Math.max(Number(data?.playerCount) || 6, 3), 8);
    const room = createRoom({
      name: `Arena #${Math.floor(1000 + Math.random() * 9000)}`,
      maxPlayers: targetCount,
      category: data?.category || 'Fruits'
    });

    socket.playerId = playerId;
    socket.roomId = room.id;
    room.subscribers.add(socket);

    const humanPlayer = {
      id: playerId,
      name: data?.name || 'You',
      avatar: data?.avatar || 'fox',
      isHost: true,
      isBot: false,
      hand: []
    };
    room.players.push(humanPlayer);

    // Add bots up to room capacity (e.g. 5 bots for 6 players)
    while (room.players.length < room.maxPlayers) {
      addBotToRoom(room);
    }

    // Confirm joined
    sendWsFrame(socket, JSON.stringify({
      event: 'joined_room_success',
      data: {
        playerId,
        room: getSanitizedRoomState(room, playerId)
      }
    }));

    // Start game immediately
    startRoomGame(room);
    return;
  }

  if (action === 'join_room') {
    const room = rooms.get(roomId);
    if (!room) {
      sendWsFrame(socket, JSON.stringify({ event: 'error', data: { message: 'Room not found' } }));
      return;
    }

    socket.playerId = playerId;
    socket.roomId = roomId;
    room.subscribers.add(socket);

    let player = room.players.find(p => p.id === playerId);
    if (!player && room.status === 'playing') {
      const existingHuman = room.players.find(p => !p.isBot && (p.name === data?.name || room.players.filter(x => !x.isBot).length === 1));
      if (existingHuman) {
        existingHuman.id = playerId;
        existingHuman.disconnected = false;
        player = existingHuman;
        console.log(`[RECONNECT] Reconnected ${player.name} to ongoing match #${room.id}`);
      }
    }

    if (!player) {
      if (room.status === 'playing') {
        sendWsFrame(socket, JSON.stringify({ event: 'error', data: { message: 'Game already in progress' } }));
        return;
      }
      if (room.players.length >= room.maxPlayers) {
        sendWsFrame(socket, JSON.stringify({ event: 'error', data: { message: 'Room is full' } }));
        return;
      }

      // If room had only bots or host was a bot, make the first human player the host
      const currentHost = room.players.find(p => p.isHost);
      const isFirstHuman = !room.players.some(p => !p.isBot);
      const shouldBeHost = isFirstHuman || !currentHost || currentHost.isBot;
      if (shouldBeHost && currentHost) {
        currentHost.isHost = false;
      }

      player = {
        id: playerId,
        name: data?.name || `Player_${Math.floor(100 + Math.random() * 900)}`,
        avatar: data?.avatar || 'fox',
        isHost: shouldBeHost,
        isBot: false,
        hand: []
      };
      room.players.push(player);
    } else {
      player.disconnected = false;
      if (data?.name) player.name = data.name;
      if (data?.avatar) player.avatar = data.avatar;
    }

    sendWsFrame(socket, JSON.stringify({
      event: 'joined_room_success',
      data: {
        playerId,
        room: getSanitizedRoomState(room, playerId)
      }
    }));

    broadcastToRoom(room, 'player_joined', (pId) => ({
      player: { id: player.id, name: player.name, avatar: player.avatar, isHost: player.isHost },
      roomState: getSanitizedRoomState(room, pId)
    }));

    // Auto-start if room is full with human + bots
    if (room.players.length >= room.maxPlayers && room.players.some(p => p.isBot)) {
      setTimeout(() => startRoomGame(room), 400);
    }
  } else if (action === 'start_game') {
    const room = rooms.get(roomId);
    if (room) {
      const p = room.players.find(p => p.id === playerId);
      if (p && (p.isHost || !room.players.some(pl => pl.isHost && !pl.isBot))) {
        startRoomGame(room);
      }
    }
  } else if (action === 'pass_card') {
    const room = rooms.get(roomId);
    if (room) {
      passCardInRoom(room, playerId, data.cardId);
    }
  } else if (action === 'slap_pile') {
    const room = rooms.get(roomId);
    if (room) {
      handleSlapPile(room, playerId);
    }
  } else if (action === 'send_reaction') {
    const room = rooms.get(roomId);
    if (room) {
      broadcastToRoom(room, 'player_reaction', {
        playerId,
        emoji: data.emoji,
        senderName: data.name
      });
    }
  } else if (action === 'play_again') {
    const room = rooms.get(roomId);
    if (room) {
      room.round++;
      startRoomGame(room);
    }
  } else if (action === 'add_bot') {
    const room = rooms.get(roomId);
    if (room) {
      addBotToRoom(room);
      broadcastToRoom(room, 'player_joined', (pId) => ({
        roomState: getSanitizedRoomState(room, pId)
      }));
    }
  }
}

// --- HTTP SERVER & ROUTING ---
const MIME_TYPES = {
  '.html': 'text/html; charset=utf-8',
  '.css': 'text/css; charset=utf-8',
  '.js': 'application/javascript; charset=utf-8',
  '.json': 'application/json',
  '.webmanifest': 'application/manifest+json',
  '.svg': 'image/svg+xml',
  '.png': 'image/png',
  '.jpg': 'image/jpeg',
  '.ico': 'image/x-icon'
};

const server = http.createServer((req, res) => {
  const urlObj = new URL(req.url, `http://${req.headers.host || 'localhost'}`);
  const pathname = urlObj.pathname;

  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

  if (req.method === 'OPTIONS') {
    res.writeHead(204);
    res.end();
    return;
  }

  if (pathname === '/api/ip') {
    const host = req.headers['x-forwarded-host'] || req.headers.host;
    const proto = req.headers['x-forwarded-proto'] || (req.socket.encrypted ? 'https' : 'http');
    const isPublicHost = host && !host.startsWith('localhost') && !host.startsWith('127.0.0.1');
    const detectedUrl = isPublicHost ? `${proto}://${host}` : `http://${PRIMARY_IP}:${PORT}`;

    res.writeHead(200, { 'Content-Type': 'application/json' });
    res.end(JSON.stringify({
      primaryIp: PRIMARY_IP,
      port: PORT,
      url: detectedUrl,
      isCloud: isPublicHost,
      interfaces: getLocalIpAddresses()
    }));
    return;
  }

  if (pathname === '/api/qr') {
    const host = req.headers['x-forwarded-host'] || req.headers.host;
    const proto = req.headers['x-forwarded-proto'] || (req.socket.encrypted ? 'https' : 'http');
    const isPublicHost = host && !host.startsWith('localhost') && !host.startsWith('127.0.0.1');
    const defaultUrl = isPublicHost ? `${proto}://${host}` : `http://${PRIMARY_IP}:${PORT}`;
    const targetUrl = urlObj.searchParams.get('url') || defaultUrl;
    const svg = QR.makeQR(targetUrl);
    res.writeHead(200, { 'Content-Type': 'image/svg+xml', 'Cache-Control': 'public, max-age=3600' });
    res.end(svg);
    return;
  }

  if (pathname === '/api/categories') {
    if (req.method === 'GET') {
      res.writeHead(200, { 'Content-Type': 'application/json' });
      res.end(JSON.stringify(getAllCategories()));
      return;
    } else if (req.method === 'POST') {
      let body = '';
      req.on('data', chunk => { body += chunk; });
      req.on('end', () => {
        try {
          const { name, items } = JSON.parse(body);
          if (!name || !items || !Array.isArray(items) || items.length < 2) {
            res.writeHead(400, { 'Content-Type': 'application/json' });
            res.end(JSON.stringify({ error: 'Name and at least 2 items required' }));
            return;
          }
          saveCustomCategory(name, items);
          res.writeHead(200, { 'Content-Type': 'application/json' });
          res.end(JSON.stringify({ success: true, categories: getAllCategories() }));
        } catch (e) {
          res.writeHead(400, { 'Content-Type': 'application/json' });
          res.end(JSON.stringify({ error: 'Invalid JSON' }));
        }
      });
      return;
    }
  }

  if (pathname === '/api/rooms') {
    if (req.method === 'GET') {
      const roomList = Array.from(rooms.values()).map(r => ({
        id: r.id,
        name: r.name,
        category: r.category,
        categoryIcon: (getAllCategories()[r.category] || {}).icon || '🃏',
        maxPlayers: r.maxPlayers,
        playerCount: r.players.length,
        status: r.status
      }));
      res.writeHead(200, { 'Content-Type': 'application/json' });
      res.end(JSON.stringify(roomList));
      return;
    } else if (req.method === 'POST') {
      let body = '';
      req.on('data', chunk => { body += chunk; });
      req.on('end', () => {
        try {
          const options = JSON.parse(body || '{}');
          const room = createRoom(options);
          res.writeHead(200, { 'Content-Type': 'application/json' });
          res.end(JSON.stringify({ success: true, room: getSanitizedRoomState(room) }));
        } catch (e) {
          res.writeHead(400, { 'Content-Type': 'application/json' });
          res.end(JSON.stringify({ error: 'Failed to create room' }));
        }
      });
      return;
    }
  }

  let filePath = pathname === '/' ? path.join(PUBLIC_DIR, 'index.html') : path.join(PUBLIC_DIR, pathname);
  const ext = path.extname(filePath).toLowerCase();

  fs.stat(filePath, (err, stats) => {
    if (err || !stats.isFile()) {
      const indexFile = path.join(PUBLIC_DIR, 'index.html');
      fs.readFile(indexFile, (err2, data) => {
        if (err2) {
          res.writeHead(404, { 'Content-Type': 'text/plain' });
          res.end('404 Not Found');
        } else {
          res.writeHead(200, { 'Content-Type': 'text/html; charset=utf-8' });
          res.end(data);
        }
      });
      return;
    }

    const contentType = MIME_TYPES[ext] || 'application/octet-stream';
    res.writeHead(200, {
      'Content-Type': contentType,
      'Cache-Control': 'no-store, no-cache, must-revalidate, max-age=0',
      'Pragma': 'no-cache',
      'Expires': '0'
    });
    fs.createReadStream(filePath).pipe(res);
  });
});

server.on('upgrade', handleWebSocketUpgrade);

server.listen(PORT, '0.0.0.0', () => {
  console.log(`\n======================================================`);
  console.log(`  🔥 SET! 4-of-a-Kind Card Game Server is LIVE 🔥`);
  console.log(`======================================================`);
  console.log(`- Local Access:   http://localhost:${PORT}`);
  console.log(`- Mobile / Wi-Fi: http://${PRIMARY_IP}:${PORT}`);
  console.log(`- WebSocket URL:  ws://${PRIMARY_IP}:${PORT}/ws`);
  console.log(`- Live QR Code:   http://${PRIMARY_IP}:${PORT}/api/qr`);
  console.log(`======================================================\n`);
});
