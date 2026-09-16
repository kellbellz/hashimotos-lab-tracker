'use strict';

const socket = io();
const app = document.getElementById('app');
const toastEl = document.getElementById('toast');

// ---------------------------------------------------------------------
// Identity + local storage
// ---------------------------------------------------------------------

function uid() {
  return 'p_' + Math.random().toString(36).slice(2) + Date.now().toString(36);
}

let playerId = localStorage.getItem('rookPlayerId');
if (!playerId) {
  playerId = uid();
  localStorage.setItem('rookPlayerId', playerId);
}

let state = null; // last server view
let uiTab = 'create';
let selectedDiscards = [];
let selectedTrump = null;
let bidDraft = null;
let editingTeam = null; // 'A' | 'B' | null

function showToast(msg) {
  toastEl.textContent = msg;
  toastEl.classList.add('show');
  clearTimeout(showToast._t);
  showToast._t = setTimeout(() => toastEl.classList.remove('show'), 3200);
}

function call(event, payload) {
  return new Promise((resolve) => {
    socket.emit(event, payload, (res) => {
      if (!res || !res.ok) showToast((res && res.error) || 'Something went wrong.');
      resolve(res);
    });
  });
}

// ---------------------------------------------------------------------
// Socket wiring
// ---------------------------------------------------------------------

socket.on('connect', () => {
  const savedCode = localStorage.getItem('rookRoomCode');
  if (savedCode) {
    call('rejoinRoom', { code: savedCode, playerId }).then((res) => {
      if (!res.ok) {
        localStorage.removeItem('rookRoomCode');
        render();
      }
    });
  } else {
    render();
  }
});

socket.on('state', (view) => {
  state = view;
  localStorage.setItem('rookRoomCode', view.code);
  if (state.phase !== 'nest') {
    selectedDiscards = [];
    selectedTrump = null;
  }
  render();
});

// ---------------------------------------------------------------------
// Card helpers
// ---------------------------------------------------------------------

function parseCard(card) {
  if (card === 'ROOK') return { rook: true };
  const m = card.match(/^([a-z]+)(\d+)$/);
  return { color: m[1], number: parseInt(m[2], 10) };
}

const ROOK_BIRD_SVG = `<svg viewBox="0 0 200 200" width="1em" height="1em" style="display:block">
  <ellipse cx="108" cy="112" rx="46" ry="36" fill="currentColor" />
  <circle cx="57" cy="72" r="25" fill="currentColor" />
  <polygon points="33,68 6,76 33,90" fill="currentColor" />
  <polygon points="138,88 202,52 148,106" fill="currentColor" />
  <polygon points="140,128 196,148 150,114" fill="currentColor" />
  <line x1="92" y1="146" x2="86" y2="180" stroke="currentColor" stroke-width="7" stroke-linecap="round" />
  <line x1="120" y1="148" x2="126" y2="180" stroke="currentColor" stroke-width="7" stroke-linecap="round" />
  <line x1="78" y1="182" x2="94" y2="182" stroke="currentColor" stroke-width="6" stroke-linecap="round" />
  <line x1="118" y1="182" x2="134" y2="182" stroke="currentColor" stroke-width="6" stroke-linecap="round" />
  <circle cx="62" cy="65" r="4.5" fill="#2b2145" />
</svg>`;

function cardNode(card, opts = {}) {
  const { small, selectable, disabled, chosen, faceDown } = opts;
  const div = document.createElement('div');
  div.className = 'card' + (small ? ' small' : '');
  if (faceDown) {
    div.classList.add('face-down');
    return div;
  }
  const info = parseCard(card);
  if (info.rook) {
    div.classList.add('card-rook');
    div.innerHTML = `<div class="num">${ROOK_BIRD_SVG}</div><div class="label">Rook</div>`;
  } else {
    div.classList.add('card-' + info.color);
    div.innerHTML = `<div class="num">${info.number}</div><div class="label">${info.color}</div>`;
  }
  if (selectable) div.classList.add('selectable');
  if (disabled) div.classList.add('disabled');
  if (chosen) div.classList.add('chosen');
  return div;
}

// ---------------------------------------------------------------------
// Render root
// ---------------------------------------------------------------------

function render() {
  app.innerHTML = '';
  if (!state) {
    app.appendChild(renderHome());
    return;
  }
  if (state.phase === 'lobby') {
    app.appendChild(renderLobby());
    return;
  }
  app.appendChild(renderGame());
}

// ---------------------------------------------------------------------
// Home screen
// ---------------------------------------------------------------------

function renderHome() {
  const wrap = document.createElement('div');
  wrap.className = 'home-wrap';
  const card = document.createElement('div');
  card.className = 'home-card';

  const tabs = document.createElement('div');
  tabs.className = 'home-tabs';
  const createTabBtn = document.createElement('button');
  createTabBtn.textContent = 'Create Game';
  createTabBtn.className = uiTab === 'create' ? 'active' : '';
  createTabBtn.onclick = () => { uiTab = 'create'; render(); };
  const joinTabBtn = document.createElement('button');
  joinTabBtn.textContent = 'Join Game';
  joinTabBtn.className = uiTab === 'join' ? 'active' : '';
  joinTabBtn.onclick = () => { uiTab = 'join'; render(); };
  tabs.append(createTabBtn, joinTabBtn);

  card.innerHTML = '<h1>&#9820; Rook Online</h1>';
  card.appendChild(tabs);

  if (uiTab === 'create') {
    card.appendChild(buildField('Your name', 'text', 'create-name', localStorage.getItem('rookName') || ''));

    const rulesField = document.createElement('div');
    rulesField.className = 'field';
    rulesField.innerHTML = '<label>House rules</label>';
    const select = document.createElement('select');
    select.id = 'create-ruleset';
    select.innerHTML = `
      <option value="newman">Newman rules (house)</option>
      <option value="standard">Standard Rook rules</option>
    `;
    const note = document.createElement('div');
    note.className = 'rule-note';
    const updateNote = () => {
      note.innerHTML = select.value === 'newman'
        ? 'Min bid 5 &middot; Rook card worth 25 pts &middot; bid winner leads first trick &middot; points in the discard pile (nest) are not added to either team\'s point total &middot; Rook plays as the lowest trump, following normal suit rules.'
        : 'Min bid 70 &middot; Rook card worth 20 pts &middot; player left of dealer leads first trick &middot; points in the discard pile (nest) are added to the final-trick winner &middot; Rook is the highest trump and may be played anytime.';
    };
    select.onchange = updateNote;
    updateNote();
    rulesField.append(select, note);
    card.appendChild(rulesField);

    card.appendChild(buildField('Points to win', 'number', 'create-target', '300'));

    const btn = document.createElement('button');
    btn.textContent = 'Create Room';
    btn.style.width = '100%';
    btn.onclick = async () => {
      const name = document.getElementById('create-name').value.trim() || 'Player 1';
      const rulesetName = document.getElementById('create-ruleset').value;
      const targetScore = parseInt(document.getElementById('create-target').value, 10) || 300;
      localStorage.setItem('rookName', name);
      const res = await call('createRoom', { name, playerId, rulesetName, targetScore });
      if (res.ok) render();
    };
    card.appendChild(btn);
  } else {
    card.appendChild(buildField('Your name', 'text', 'join-name', localStorage.getItem('rookName') || ''));
    card.appendChild(buildField('Room code', 'text', 'join-code', ''));
    const btn = document.createElement('button');
    btn.textContent = 'Join Room';
    btn.style.width = '100%';
    btn.onclick = async () => {
      const name = document.getElementById('join-name').value.trim() || 'Player';
      const code = document.getElementById('join-code').value.trim().toUpperCase();
      localStorage.setItem('rookName', name);
      const res = await call('joinRoom', { code, name, playerId });
      if (res.ok) render();
    };
    card.appendChild(btn);
  }

  wrap.appendChild(card);
  return wrap;
}

function buildField(labelText, type, id, value) {
  const field = document.createElement('div');
  field.className = 'field';
  const label = document.createElement('label');
  label.textContent = labelText;
  const input = document.createElement('input');
  input.type = type;
  input.id = id;
  input.value = value;
  field.append(label, input);
  return field;
}

// ---------------------------------------------------------------------
// Lobby screen
// ---------------------------------------------------------------------

function renderLobby() {
  const wrap = document.createElement('div');
  wrap.className = 'lobby-wrap';
  const card = document.createElement('div');
  card.className = 'lobby-card';
  card.innerHTML = `<h2 style="text-align:center;margin-bottom:0;">Waiting for players</h2>
    <div class="room-code">${state.code}</div>
    <p style="text-align:center;color:var(--muted);margin-top:-10px;">Share this code so 3 friends can join &middot;
    Rules: <b>${state.rulesetName === 'newman' ? 'Newman' : 'Standard'}</b> &middot; Playing to ${state.targetScore}</p>`;

  const grid = document.createElement('div');
  grid.className = 'seat-row';
  const isHost = state.hostSeat === state.yourSeat;
  for (let seat = 0; seat < 4; seat++) {
    const p = state.players[seat];
    const slot = document.createElement('div');
    slot.className = 'seat-slot' + (p ? ' filled' : '');
    if (p) {
      slot.innerHTML = `<div class="seat-name">${p.name}${seat === state.yourSeat ? ' (you)' : ''}</div>
        <div class="seat-tag">${p.isHost ? 'Host' : ''} ${p.isBot ? 'CPU' : p.connected ? '' : '(offline)'}</div>`;
    } else {
      slot.innerHTML = `<div class="seat-tag" style="margin-bottom:8px;">Empty seat</div>`;
      if (isHost) {
        const btn = document.createElement('button');
        btn.className = 'secondary';
        btn.textContent = 'Add CPU';
        btn.onclick = () => call('addBot', { code: state.code, seat });
        slot.appendChild(btn);
      }
    }
    grid.appendChild(slot);
  }
  card.appendChild(grid);

  if (isHost) {
    const full = state.players.every((p) => p);
    const startBtn = document.createElement('button');
    startBtn.style.width = '100%';
    startBtn.textContent = full ? 'Start Game' : `Need ${4 - state.players.filter(Boolean).length} more player(s)`;
    startBtn.disabled = !full;
    startBtn.onclick = () => call('startGame', { code: state.code });
    card.appendChild(startBtn);
  } else {
    const p = document.createElement('p');
    p.style.textAlign = 'center';
    p.style.color = 'var(--muted)';
    p.textContent = 'Waiting for the host to start the game...';
    card.appendChild(p);
  }

  wrap.appendChild(card);
  return wrap;
}

// ---------------------------------------------------------------------
// Game screen
// ---------------------------------------------------------------------

function seatLabel(seat) {
  const p = state.players[seat];
  return p ? p.name + (seat === state.yourSeat ? ' (you)' : '') : 'Empty';
}

// A plain (non-interactive) view of your hand, shown during phases where the
// action bar doesn't already render it (e.g. renderHandRow during play,
// renderNest's discard picker for the bidder).
function renderMyHandStrip() {
  const wrap = document.createElement('div');
  const label = document.createElement('div');
  label.className = 'action-hint';
  label.style.padding = '0 18px';
  label.textContent = 'Your hand:';
  wrap.appendChild(label);
  const handRow = document.createElement('div');
  handRow.className = 'hand-row';
  for (const card of state.yourHand || []) {
    handRow.appendChild(cardNode(card, {}));
  }
  wrap.appendChild(handRow);
  return wrap;
}

function renderGame() {
  const wrap = document.createElement('div');
  wrap.id = 'game-screen';

  wrap.appendChild(renderTopbar());

  const main = document.createElement('div');
  main.className = 'main-area';

  const tableCol = document.createElement('div');
  tableCol.className = 'table-col';
  tableCol.appendChild(renderTable());
  const showPlainHand =
    state.yourHand &&
    (state.phase === 'bidding' || (state.phase === 'nest' && state.bidder !== state.yourSeat));
  if (showPlainHand) tableCol.appendChild(renderMyHandStrip());
  tableCol.appendChild(renderActionBar());
  main.appendChild(tableCol);

  const sideCol = document.createElement('div');
  sideCol.className = 'side-col';
  sideCol.appendChild(renderSidePanel());
  main.appendChild(sideCol);

  wrap.appendChild(main);
  return wrap;
}

function renderTopbar() {
  const bar = document.createElement('div');
  bar.className = 'topbar';
  const left = document.createElement('div');
  left.style.display = 'flex';
  left.style.gap = '12px';
  left.style.alignItems = 'center';
  left.innerHTML = `<span class="code-chip">${state.code}</span>
    <span style="color:var(--muted);font-size:13px;">${state.rulesetName === 'newman' ? 'Newman rules' : 'Standard rules'} &middot; Hand ${state.handNumber} &middot; Race to ${state.targetScore}</span>`;
  if (state.trump) {
    const chip = document.createElement('span');
    chip.className = 'trump-chip color-swatch ' + state.trump;
    chip.style.width = 'auto';
    chip.style.height = 'auto';
    chip.style.padding = '4px 10px';
    chip.textContent = 'Trump: ' + state.trump.toUpperCase();
    left.appendChild(chip);
  }
  const score = document.createElement('div');
  score.className = 'scoreboard';
  score.appendChild(renderTeamScoreChip('A'));
  score.appendChild(renderTeamScoreChip('B'));
  bar.append(left, score);
  return bar;
}

function teamOfSeat(seat) {
  return seat % 2 === 0 ? 'A' : 'B';
}

function teamLabel(team) {
  return (state.teamNames && state.teamNames[team]) || `Team ${team}`;
}

function renderTeamScoreChip(team) {
  const wrap = document.createElement('span');
  wrap.className = 'team-' + team.toLowerCase();
  wrap.style.display = 'inline-flex';
  wrap.style.alignItems = 'center';
  wrap.style.gap = '6px';
  const isYourTeam = state.yourSeat !== null && state.yourSeat !== undefined && teamOfSeat(state.yourSeat) === team;

  if (editingTeam === team) {
    const input = document.createElement('input');
    input.value = teamLabel(team);
    input.maxLength = 30;
    input.style.width = '150px';
    let saved = false;
    const save = () => {
      if (saved) return;
      saved = true;
      const val = input.value.trim();
      editingTeam = null;
      if (val && val !== teamLabel(team)) {
        call('setTeamName', { code: state.code, team, name: val });
      } else {
        render();
      }
    };
    input.onkeydown = (e) => {
      if (e.key === 'Enter') save();
      if (e.key === 'Escape') { saved = true; editingTeam = null; render(); }
    };
    input.onblur = save;
    wrap.appendChild(input);
    setTimeout(() => { input.focus(); input.select(); }, 0);
  } else {
    const nameSpan = document.createElement('span');
    nameSpan.textContent = `${teamLabel(team)}: ${state.scores[team]}`;
    wrap.appendChild(nameSpan);
    if (isYourTeam) {
      const editBtn = document.createElement('button');
      editBtn.className = 'secondary';
      editBtn.textContent = '✎';
      editBtn.title = 'Rename your team';
      editBtn.style.padding = '2px 8px';
      editBtn.style.fontSize = '12px';
      editBtn.onclick = () => { editingTeam = team; render(); };
      wrap.appendChild(editBtn);
    }
  }
  return wrap;
}

function renderTable() {
  const table = document.createElement('div');
  table.className = 'table';

  const positions = ['bot', 'left', 'top', 'right'];
  for (let rel = 0; rel < 4; rel++) {
    const seat = (state.yourSeat + rel) % 4;
    const pos = document.createElement('div');
    pos.className = 'seat-pos ' + positions[rel];
    const isTurn =
      (state.phase === 'bidding' && state.bidding && state.bidding.turnSeat === seat) ||
      (state.phase === 'nest' && state.bidder === seat) ||
      (state.phase === 'playing' && state.turnSeat === seat);
    if (isTurn) pos.classList.add('turn');
    const name = document.createElement('div');
    name.className = 'name';
    name.textContent = seatLabel(seat);
    pos.appendChild(name);
    const meta = document.createElement('div');
    meta.className = 'meta';
    const bits = [];
    if (state.handSizes) bits.push(`${state.handSizes[seat]} cards`);
    if (state.bidder === seat && state.bidAmount) bits.push(`bid ${state.bidAmount}`);
    meta.textContent = bits.join(' · ');
    pos.appendChild(meta);
    if (seat === state.dealerSeat) {
      const badge = document.createElement('span');
      badge.className = 'dealer-badge';
      badge.textContent = 'DEALER';
      pos.appendChild(badge);
    }
    table.appendChild(pos);
  }

  const center = document.createElement('div');
  center.className = 'trick-center';
  if (state.trick) {
    const slotClass = { bot: 'trick-slot-bot', left: 'trick-slot-left', top: 'trick-slot-top', right: 'trick-slot-right' };
    for (let rel = 0; rel < 4; rel++) {
      const seat = (state.yourSeat + rel) % 4;
      const played = state.trick.cards.find((tc) => tc.seat === seat);
      const slotWrap = document.createElement('div');
      slotWrap.className = slotClass[positions[rel]];
      if (played) {
        slotWrap.appendChild(cardNode(played.card, { small: true }));
      } else {
        const ph = document.createElement('div');
        ph.className = 'trick-slot';
        slotWrap.appendChild(ph);
      }
      center.appendChild(slotWrap);
    }
  }
  table.appendChild(center);

  return table;
}

function renderSidePanel() {
  const panel = document.createElement('div');
  panel.className = 'side-panel';
  panel.innerHTML = '<h3>Activity</h3>';
  const log = state.log.slice().reverse();
  for (const entry of log) {
    const line = document.createElement('div');
    line.className = 'log-line';
    line.textContent = entry.msg;
    panel.appendChild(line);
  }
  return panel;
}

function renderActionBar() {
  const bar = document.createElement('div');
  bar.className = 'action-bar';

  if (state.phase === 'bidding') {
    bar.appendChild(renderBidding());
  } else if (state.phase === 'nest') {
    bar.appendChild(renderNest());
  } else if (state.phase === 'playing') {
    bar.appendChild(renderHandRow());
  } else if (state.phase === 'handOver') {
    bar.appendChild(renderHandOver());
  } else if (state.phase === 'gameOver') {
    bar.appendChild(renderGameOver());
  }

  return bar;
}

function renderBidding() {
  const wrap = document.createElement('div');
  const b = state.bidding;
  const isYourTurn = b.turnSeat === state.yourSeat;

  const row = document.createElement('div');
  row.className = 'action-row';

  if (!isYourTurn) {
    row.innerHTML = `<span class="action-hint">Waiting for ${seatLabel(b.turnSeat)} to bid... (high bid: ${b.highBid || 'none'}${b.highBidderSeat !== null ? ' by ' + seatLabel(b.highBidderSeat) : ''})</span>`;
    wrap.appendChild(row);
    return wrap;
  }

  const remaining = b.activeSeats.filter((s) => s !== state.yourSeat);
  const forced = remaining.length === 1 && b.highBid === 0;
  const nextMin = b.highBid === 0 ? b.minBid : b.highBid + b.bidIncrement;
  if (bidDraft === null || bidDraft < nextMin) bidDraft = nextMin;

  const label = document.createElement('span');
  label.className = 'action-hint';
  label.textContent = forced
    ? 'Everyone else passed - you must bid:'
    : `Your turn. High bid: ${b.highBid || 'none'}${b.highBidderSeat !== null ? ' (' + seatLabel(b.highBidderSeat) + ')' : ''}.`;
  row.appendChild(label);

  const minus = document.createElement('button');
  minus.className = 'secondary';
  minus.textContent = '-' + b.bidIncrement;
  minus.onclick = () => { bidDraft = Math.max(nextMin, bidDraft - b.bidIncrement); render(); };
  const amountSpan = document.createElement('span');
  amountSpan.style.fontWeight = '800';
  amountSpan.style.fontSize = '20px';
  amountSpan.style.minWidth = '60px';
  amountSpan.style.textAlign = 'center';
  amountSpan.textContent = bidDraft;
  const plus = document.createElement('button');
  plus.className = 'secondary';
  plus.textContent = '+' + b.bidIncrement;
  plus.onclick = () => { bidDraft += b.bidIncrement; render(); };
  row.append(minus, amountSpan, plus);

  const bidBtn = document.createElement('button');
  bidBtn.textContent = 'Bid ' + bidDraft;
  bidBtn.onclick = () => { bidDraft = null; call('placeBid', { code: state.code, amount: amountSpan.textContent }); };
  row.appendChild(bidBtn);

  if (!forced) {
    const passBtn = document.createElement('button');
    passBtn.className = 'secondary';
    passBtn.textContent = 'Pass';
    passBtn.onclick = () => call('placeBid', { code: state.code, pass: true });
    row.appendChild(passBtn);
  }

  wrap.appendChild(row);
  return wrap;
}

function renderNest() {
  const wrap = document.createElement('div');
  if (state.bidder !== state.yourSeat) {
    wrap.innerHTML = `<span class="action-hint">${seatLabel(state.bidder)} won the bid at ${state.bidAmount} and is picking discards + trump...</span>`;
    return wrap;
  }

  const hint = document.createElement('div');
  hint.className = 'action-hint';
  hint.textContent = `You won the bid at ${state.bidAmount}. Pick 5 cards to bury and choose trump.`;
  wrap.appendChild(hint);

  const handRow = document.createElement('div');
  handRow.className = 'hand-row';
  for (const card of state.yourHand) {
    const chosen = selectedDiscards.includes(card);
    const node = cardNode(card, { selectable: true, chosen });
    node.onclick = () => {
      if (chosen) {
        selectedDiscards = selectedDiscards.filter((c) => c !== card);
      } else if (selectedDiscards.length < 5) {
        selectedDiscards = [...selectedDiscards, card];
      }
      render();
    };
    handRow.appendChild(node);
  }
  wrap.appendChild(handRow);

  const need = 5 - selectedDiscards.length;
  const statusLine = document.createElement('div');
  statusLine.className = 'action-hint';
  statusLine.style.marginBottom = '4px';
  if (need > 0) {
    statusLine.textContent = `Step 1: select ${need} more card${need === 1 ? '' : 's'} to discard (${selectedDiscards.length}/5 chosen).`;
  } else if (!selectedTrump) {
    statusLine.textContent = `Step 2: 5 cards selected - now choose a trump color below.`;
  } else {
    statusLine.textContent = `Ready - discarding 5 cards, trump is ${selectedTrump.toUpperCase()}. Click Confirm.`;
  }
  wrap.appendChild(statusLine);

  const row = document.createElement('div');
  row.className = 'action-row';

  const pickerWrap = document.createElement('div');
  pickerWrap.style.display = 'flex';
  pickerWrap.style.flexDirection = 'column';
  pickerWrap.style.gap = '4px';
  const pickerLabel = document.createElement('span');
  pickerLabel.className = 'action-hint';
  pickerLabel.textContent = 'Trump color:';
  const picker = document.createElement('div');
  picker.className = 'color-picker';
  for (const color of ['red', 'yellow', 'green', 'black']) {
    const sw = document.createElement('div');
    sw.className = 'color-swatch ' + color + (selectedTrump === color ? ' chosen' : '');
    sw.textContent = color.toUpperCase();
    sw.onclick = () => { selectedTrump = color; render(); };
    picker.appendChild(sw);
  }
  pickerWrap.append(pickerLabel, picker);
  row.appendChild(pickerWrap);

  const confirmBtn = document.createElement('button');
  confirmBtn.textContent = 'Confirm';
  confirmBtn.disabled = selectedDiscards.length !== 5 || !selectedTrump;
  confirmBtn.title = confirmBtn.disabled
    ? (need > 0 ? `Select ${need} more card(s) first` : 'Choose a trump color first')
    : '';
  confirmBtn.onclick = () => call('resolveNest', { code: state.code, discards: selectedDiscards, trump: selectedTrump });
  row.appendChild(confirmBtn);

  wrap.appendChild(row);
  return wrap;
}

function renderHandRow() {
  const wrap = document.createElement('div');
  const isYourTurn = state.turnSeat === state.yourSeat;
  const hint = document.createElement('div');
  hint.className = 'action-hint';
  hint.style.marginBottom = '6px';
  hint.textContent = isYourTurn ? 'Your turn - play a card.' : `Waiting for ${seatLabel(state.turnSeat)}...`;
  wrap.appendChild(hint);

  const handRow = document.createElement('div');
  handRow.className = 'hand-row';
  const legal = state.legalPlays || [];
  for (const card of state.yourHand || []) {
    const isLegal = isYourTurn && legal.includes(card);
    const node = cardNode(card, { selectable: isLegal, disabled: isYourTurn && !isLegal });
    if (isLegal) node.onclick = () => call('playCard', { code: state.code, card });
    handRow.appendChild(node);
  }
  wrap.appendChild(handRow);
  return wrap;
}

function renderHandOver() {
  const wrap = document.createElement('div');
  const s = state.lastHandSummary;
  const box = document.createElement('div');
  box.className = 'summary-box';
  box.innerHTML = `
    <div><b>${seatLabel(s.bidder)}</b> (${teamLabel(s.bidderTeam)}) bid <b>${s.bidAmount}</b>, trump was <b>${s.trump.toUpperCase()}</b>.</div>
    <div>${teamLabel('A')} captured <b>${s.teamPoints.A}</b> pts &middot; ${teamLabel('B')} captured <b>${s.teamPoints.B}</b> pts.</div>
    <div>Discard pile (nest) was worth ${s.nestPoints} pts - ${s.nestAwardedTo ? `added to ${teamLabel(s.nestAwardedTo)}'s total (won the final trick)` : "not added to either team's point total (Newman rules)"}.</div>
    <div>${teamLabel(s.bidderTeam)} <b>${s.madeBid ? 'made' : 'was SET on'}</b> the bid.</div>
    <div style="margin-top:8px;">New scores &mdash; ${teamLabel('A')}: <b>${s.scoresAfter.A}</b> &middot; ${teamLabel('B')}: <b>${s.scoresAfter.B}</b></div>
  `;
  wrap.appendChild(box);

  const isHost = state.hostSeat === state.yourSeat;
  if (isHost) {
    const btn = document.createElement('button');
    btn.style.marginTop = '12px';
    btn.textContent = 'Deal Next Hand';
    btn.onclick = () => call('dealNextHand', { code: state.code });
    wrap.appendChild(btn);
  } else {
    const p = document.createElement('div');
    p.className = 'action-hint';
    p.style.marginTop = '12px';
    p.textContent = 'Waiting for host to deal the next hand...';
    wrap.appendChild(p);
  }
  return wrap;
}

function renderGameOver() {
  const wrap = document.createElement('div');
  wrap.className = 'center-msg';
  const win = state.winnerTeam;
  wrap.innerHTML = `<h2>${win ? `${teamLabel(win)} wins!` : "It's a tie!"}</h2>
    <div>Final score &mdash; ${teamLabel('A')}: ${state.scores.A} &middot; ${teamLabel('B')}: ${state.scores.B}</div>`;
  const btn = document.createElement('button');
  btn.textContent = 'Back to Home';
  btn.onclick = () => {
    localStorage.removeItem('rookRoomCode');
    state = null;
    render();
  };
  wrap.appendChild(btn);
  return wrap;
}

render();
