'use strict';

const {
  COLORS,
  getRuleset,
  dealHand,
  sortHand,
  legalPlays,
  trickWinnerSeat,
  pointValue,
  teamOf,
  otherTeam,
} = require('./gameEngine');

const BOT_DELAY_MS = 900;

function randomChoice(arr) {
  return arr[Math.floor(Math.random() * arr.length)];
}

class Room {
  constructor(code, { rulesetName, targetScore }) {
    this.code = code;
    this.ruleset = getRuleset(rulesetName);
    this.targetScore = targetScore || 300;
    this.players = [null, null, null, null]; // {playerId, name, socketId, isBot, connected}
    this.hostSeat = null;
    this.phase = 'lobby'; // lobby | bidding | nest | playing | handOver | gameOver
    this.dealerSeat = 0;
    this.scores = { A: 0, B: 0 };
    this.handNumber = 0;
    this.log = [];
    this.onBotMove = null; // set by server to schedule timers
    this.teamNames = { A: null, B: null }; // null = derive from player names
  }

  addLog(msg) {
    this.log.push({ t: Date.now(), msg });
    if (this.log.length > 60) this.log.shift();
  }

  findSeatByPlayerId(playerId) {
    return this.players.findIndex((p) => p && p.playerId === playerId);
  }

  defaultTeamName(team) {
    const seats = team === 'A' ? [0, 2] : [1, 3];
    return seats.map((s) => (this.players[s] ? this.players[s].name : `Seat ${s + 1}`)).join(' & ');
  }

  getTeamName(team) {
    return this.teamNames[team] || this.defaultTeamName(team);
  }

  setTeamName(seat, team, name) {
    if (team !== 'A' && team !== 'B') throw new Error('Invalid team');
    if (teamOf(seat) !== team) throw new Error('You can only rename your own team');
    const trimmed = String(name || '').trim().slice(0, 30);
    if (!trimmed) throw new Error('Team name cannot be empty');
    this.teamNames[team] = trimmed;
    this.addLog(`${this.players[seat].name} renamed their team to "${trimmed}".`);
  }

  addPlayer(playerId, name, socketId) {
    const existing = this.findSeatByPlayerId(playerId);
    if (existing !== -1) {
      this.players[existing].socketId = socketId;
      this.players[existing].connected = true;
      return existing;
    }
    const seat = this.players.findIndex((p) => p === null);
    if (seat === -1) throw new Error('Room is full');
    this.players[seat] = { playerId, name: name || `Player ${seat + 1}`, socketId, isBot: false, connected: true };
    if (this.hostSeat === null) this.hostSeat = seat;
    this.addLog(`${this.players[seat].name} joined (seat ${seat + 1}).`);
    return seat;
  }

  addBot(seat) {
    if (this.players[seat]) throw new Error('Seat taken');
    const botNames = ['Bot Ada', 'Bot Grace', 'Bot Alan', 'Bot Hedy'];
    this.players[seat] = {
      playerId: `bot-${this.code}-${seat}`,
      name: botNames[seat] || `Bot ${seat + 1}`,
      socketId: null,
      isBot: true,
      connected: true,
    };
    this.addLog(`${this.players[seat].name} (CPU) filled seat ${seat + 1}.`);
  }

  markDisconnected(socketId) {
    const p = this.players.find((pl) => pl && pl.socketId === socketId);
    if (p) {
      p.connected = false;
      this.addLog(`${p.name} disconnected.`);
    }
  }

  isFull() {
    return this.players.every((p) => p !== null);
  }

  switchSeat(playerId, targetSeat) {
    if (this.phase !== 'lobby') throw new Error('Seats can only be changed before the game starts');
    if (targetSeat < 0 || targetSeat > 3) throw new Error('Invalid seat');
    const fromSeat = this.findSeatByPlayerId(playerId);
    if (fromSeat === -1) throw new Error('You are not seated in this room');
    if (fromSeat === targetSeat) return;

    const mover = this.players[fromSeat];
    const other = this.players[targetSeat];
    this.players[targetSeat] = mover;
    this.players[fromSeat] = other;

    if (this.hostSeat === fromSeat) this.hostSeat = targetSeat;
    else if (this.hostSeat === targetSeat) this.hostSeat = fromSeat;

    this.addLog(
      other
        ? `${mover.name} swapped seats with ${other.name}.`
        : `${mover.name} moved to seat ${targetSeat + 1}.`
    );
  }

  // ---------------------------------------------------------------------
  // Hand lifecycle
  // ---------------------------------------------------------------------

  startGame() {
    if (!this.isFull()) throw new Error('Need 4 players to start');
    this.scores = { A: 0, B: 0 };
    this.handNumber = 0;
    this.dealerSeat = 0;
    this.startHand();
  }

  startHand() {
    this.handNumber += 1;
    const { hands, nest } = dealHand(this.ruleset);
    this.hands = hands;
    this.nest = nest;
    this.bidder = null;
    this.bidAmount = 0;
    this.trump = null;
    this.nestDiscards = null;
    this.lastHandSummary = null;
    this.tricksPlayed = 0;
    this.tricksWonBy = { A: [], B: [] };
    this.trick = { leaderSeat: null, cards: [] };
    this.pendingTrickWinner = null;
    this.lastCompletedTrick = null;
    this.phase = 'bidding';
    this.bidding = {
      turnSeat: (this.dealerSeat + 1) % 4,
      highBid: 0,
      highBidderSeat: null,
      activeSeats: [0, 1, 2, 3],
      history: [],
    };
    this.addLog(`Hand ${this.handNumber} dealt. Dealer: ${this.players[this.dealerSeat].name}.`);
    this.maybeScheduleBot();
  }

  nextActiveSeat(fromSeat) {
    const { activeSeats } = this.bidding;
    let s = (fromSeat + 1) % 4;
    for (let i = 0; i < 4; i++) {
      if (activeSeats.includes(s)) return s;
      s = (s + 1) % 4;
    }
    return null;
  }

  placeBid(seat, { pass, amount }) {
    if (this.phase !== 'bidding') throw new Error('Not in bidding phase');
    const b = this.bidding;
    if (seat !== b.turnSeat) throw new Error('Not your turn to bid');

    if (pass) {
      const remaining = b.activeSeats.filter((s) => s !== seat);
      if (remaining.length === 1 && b.highBid === 0) {
        throw new Error('Everyone else passed - you must place a bid.');
      }
      b.activeSeats = remaining;
      b.history.push({ seat, pass: true });
      this.addLog(`${this.players[seat].name} passes.`);
      if (remaining.length === 1) {
        this.finalizeBidding(remaining[0]);
        return;
      }
      b.turnSeat = this.nextActiveSeat(seat);
      this.maybeScheduleBot();
      return;
    }

    const amt = Math.floor(Number(amount));
    if (!Number.isFinite(amt) || amt % this.ruleset.bidIncrement !== 0) {
      throw new Error(`Bid must be a multiple of ${this.ruleset.bidIncrement}`);
    }
    if (b.highBid === 0) {
      if (amt < this.ruleset.minBid) throw new Error(`Minimum bid is ${this.ruleset.minBid}`);
    } else if (amt <= b.highBid) {
      throw new Error(`Bid must be higher than ${b.highBid}`);
    }
    b.highBid = amt;
    b.highBidderSeat = seat;
    b.history.push({ seat, bid: amt });
    this.addLog(`${this.players[seat].name} bids ${amt}.`);
    b.turnSeat = this.nextActiveSeat(seat);
    this.maybeScheduleBot();
  }

  finalizeBidding(winnerSeat) {
    this.bidder = winnerSeat;
    this.bidAmount = this.bidding.highBid;
    this.hands[winnerSeat] = sortHand([...this.hands[winnerSeat], ...this.nest], null);
    this.phase = 'nest';
    this.addLog(
      `${this.players[winnerSeat].name} wins the bid at ${this.bidAmount} and is choosing discards + trump.`
    );
    this.maybeScheduleBot();
  }

  resolveNest(seat, discards, trumpColor) {
    if (this.phase !== 'nest') throw new Error('Not in nest phase');
    if (seat !== this.bidder) throw new Error('Only the bid winner resolves the nest');
    if (!Array.isArray(discards) || discards.length !== 5) throw new Error('Must discard exactly 5 cards');
    if (!COLORS.includes(trumpColor)) throw new Error('Invalid trump color');
    const hand = this.hands[seat];
    const uniqueDiscards = new Set(discards);
    if (uniqueDiscards.size !== 5) throw new Error('Discards must be unique');
    for (const c of discards) {
      if (!hand.includes(c)) throw new Error(`You do not hold ${c}`);
    }
    this.hands[seat] = hand.filter((c) => !discards.includes(c));
    this.hands[seat] = sortHand(this.hands[seat], trumpColor);
    for (let s = 0; s < 4; s++) {
      if (s !== seat) this.hands[s] = sortHand(this.hands[s], trumpColor);
    }
    this.nestDiscards = discards;
    this.trump = trumpColor;

    const leaderSeat = this.ruleset.firstLeader === 'bidder' ? this.bidder : (this.dealerSeat + 1) % 4;
    this.trick = { leaderSeat, cards: [] };
    this.turnSeat = leaderSeat;
    this.phase = 'playing';
    this.addLog(
      `${this.players[seat].name} names ${trumpColor.toUpperCase()} as trump. ${this.players[leaderSeat].name} leads the first trick.`
    );
    this.maybeScheduleBot();
  }

  playCard(seat, card) {
    if (this.phase !== 'playing') throw new Error('Not in playing phase');
    if (seat !== this.turnSeat) throw new Error('Not your turn to play');
    const hand = this.hands[seat];
    if (!hand.includes(card)) throw new Error('You do not hold that card');
    const legal = legalPlays(hand, this.trick.cards, this.trump, this.ruleset);
    if (!legal.includes(card)) throw new Error('That card is not a legal play right now');

    this.hands[seat] = hand.filter((c) => c !== card);
    this.trick.cards.push({ seat, card });
    this.addLog(`${this.players[seat].name} plays ${describeCard(card)}.`);

    if (this.trick.cards.length < 4) {
      this.turnSeat = (seat + 1) % 4;
      this.maybeScheduleBot();
      return;
    }

    // All 4 cards are in - figure out the winner but leave the cards showing
    // on the table until that player taps to clear it (clearTrick below).
    const winnerSeat = trickWinnerSeat(this.trick.cards, this.trump, this.ruleset);
    this.pendingTrickWinner = winnerSeat;
    this.lastCompletedTrick = { cards: this.trick.cards.slice(), winnerSeat };
    this.turnSeat = null;
    this.addLog(`${this.players[winnerSeat].name} wins the trick.`);
    this.maybeScheduleBot();
  }

  clearTrick(seat) {
    if (this.phase !== 'playing') throw new Error('Not in playing phase');
    if (this.pendingTrickWinner === null) throw new Error('No completed trick waiting to be cleared');
    if (seat !== this.pendingTrickWinner) throw new Error('Only the trick winner can clear the table');

    const winnerSeat = this.pendingTrickWinner;
    const team = teamOf(winnerSeat);
    this.tricksWonBy[team].push(this.trick.cards.map((tc) => tc.card));
    this.lastTrickWinnerSeat = winnerSeat;
    this.tricksPlayed += 1;
    this.pendingTrickWinner = null;
    this.trick = { leaderSeat: winnerSeat, cards: [] };
    this.turnSeat = winnerSeat;

    if (this.tricksPlayed === 13) {
      this.finishHand();
    } else {
      this.maybeScheduleBot();
    }
  }

  finishHand() {
    this.phase = 'handOver';
    const teamPoints = { A: 0, B: 0 };
    for (const team of ['A', 'B']) {
      for (const trick of this.tricksWonBy[team]) {
        for (const card of trick) teamPoints[team] += pointValue(card, this.ruleset);
      }
    }
    const nestPoints = this.nestDiscards.reduce((sum, c) => sum + pointValue(c, this.ruleset), 0);
    let nestAwardedTo = null;
    if (this.ruleset.nestPointsToFinalTrickWinner) {
      nestAwardedTo = teamOf(this.lastTrickWinnerSeat);
      teamPoints[nestAwardedTo] += nestPoints;
    }

    const bidderTeam = teamOf(this.bidder);
    const defenderTeam = otherTeam(bidderTeam);
    const madeBid = teamPoints[bidderTeam] >= this.bidAmount;
    if (madeBid) {
      this.scores[bidderTeam] += teamPoints[bidderTeam];
    } else {
      this.scores[bidderTeam] -= this.bidAmount;
    }
    this.scores[defenderTeam] += teamPoints[defenderTeam];

    this.lastHandSummary = {
      bidder: this.bidder,
      bidderTeam,
      bidAmount: this.bidAmount,
      trump: this.trump,
      teamPoints,
      nestPoints,
      nestAwardedTo,
      madeBid,
      scoresAfter: { ...this.scores },
    };
    this.addLog(
      `Hand ${this.handNumber} result: Team ${bidderTeam} ${madeBid ? 'made' : 'was set on'} their bid of ${this.bidAmount} ` +
        `(captured ${teamPoints[bidderTeam]} pts). Scores - A: ${this.scores.A}, B: ${this.scores.B}.`
    );

    if (this.scores.A >= this.targetScore || this.scores.B >= this.targetScore) {
      this.phase = 'gameOver';
      this.winnerTeam = this.scores.A === this.scores.B ? null : this.scores.A > this.scores.B ? 'A' : 'B';
      this.addLog(this.winnerTeam ? `Team ${this.winnerTeam} wins the game!` : 'Game ends in a tie.');
    } else {
      this.dealerSeat = (this.dealerSeat + 1) % 4;
    }
  }

  // ---------------------------------------------------------------------
  // Bot AI (kept intentionally simple - always legal, not necessarily smart)
  // ---------------------------------------------------------------------

  maybeScheduleBot() {
    if (!this.onBotMove) return;
    let actingSeat = null;
    let clearing = false;
    if (this.phase === 'bidding') actingSeat = this.bidding.turnSeat;
    else if (this.phase === 'nest') actingSeat = this.bidder;
    else if (this.phase === 'playing' && this.pendingTrickWinner !== null) {
      actingSeat = this.pendingTrickWinner;
      clearing = true;
    } else if (this.phase === 'playing') actingSeat = this.turnSeat;
    if (actingSeat === null) return;
    const player = this.players[actingSeat];
    if (!player || !player.isBot) return;
    setTimeout(() => {
      try {
        if (clearing) {
          this.clearTrick(actingSeat);
        } else {
          this.performBotMove(actingSeat);
        }
      } catch (err) {
        // Bot mistakes should never crash the room; log and move on.
        this.addLog(`(bot error: ${err.message})`);
      }
      if (this.onBotMove) this.onBotMove();
    }, BOT_DELAY_MS);
  }

  performBotMove(seat) {
    if (this.phase === 'bidding' && this.bidding.turnSeat === seat) {
      const b = this.bidding;
      const remaining = b.activeSeats.filter((s) => s !== seat);
      const forced = remaining.length === 1 && b.highBid === 0;
      if (forced) {
        this.placeBid(seat, { amount: this.ruleset.minBid });
      } else {
        this.placeBid(seat, { pass: true });
      }
      return;
    }
    if (this.phase === 'nest' && this.bidder === seat) {
      const hand = this.hands[seat];
      const counts = {};
      for (const c of hand) {
        const col = c === 'ROOK' ? null : c.replace(/\d+$/, '');
        if (col) counts[col] = (counts[col] || 0) + 1;
      }
      let trumpColor = COLORS[0];
      let best = -1;
      for (const c of COLORS) {
        if ((counts[c] || 0) > best) {
          best = counts[c] || 0;
          trumpColor = c;
        }
      }
      const keepScore = (card) => {
        if (card === 'ROOK') return 1000;
        const col = card.replace(/\d+$/, '');
        const num = parseInt(card.match(/\d+$/)[0], 10);
        return col === trumpColor ? 500 + num : num;
      };
      const sorted = [...hand].sort((a, b) => keepScore(a) - keepScore(b));
      const discards = sorted.slice(0, 5);
      this.resolveNest(seat, discards, trumpColor);
      return;
    }
    if (this.phase === 'playing' && this.turnSeat === seat) {
      const legal = legalPlays(this.hands[seat], this.trick.cards, this.trump, this.ruleset);
      this.playCard(seat, randomChoice(legal));
    }
  }

  // Points captured in completed tricks so far this hand (excludes the
  // buried nest, which isn't awarded until the hand ends).
  currentHandPoints() {
    const points = { A: 0, B: 0 };
    for (const team of ['A', 'B']) {
      for (const trick of this.tricksWonBy[team]) {
        for (const card of trick) points[team] += pointValue(card, this.ruleset);
      }
    }
    return points;
  }

  // ---------------------------------------------------------------------
  // View building - hides other players' hands.
  // ---------------------------------------------------------------------

  buildView(viewerSeat) {
    const players = this.players.map((p, seat) =>
      p
        ? { seat, name: p.name, isBot: p.isBot, connected: p.connected, isHost: seat === this.hostSeat }
        : null
    );

    const base = {
      code: this.code,
      rulesetName: this.ruleset.name,
      ruleset: this.ruleset,
      targetScore: this.targetScore,
      players,
      hostSeat: this.hostSeat,
      yourSeat: viewerSeat,
      phase: this.phase,
      dealerSeat: this.dealerSeat,
      scores: this.scores,
      teamNames: { A: this.getTeamName('A'), B: this.getTeamName('B') },
      handNumber: this.handNumber,
      log: this.log.slice(-30),
    };

    if (this.phase === 'lobby' || !this.hands) return base;

    base.handSizes = this.hands.map((h) => h.length);
    base.bidder = this.bidder;
    base.bidAmount = this.bidAmount;
    base.trump = this.trump;
    base.currentHandPoints = this.currentHandPoints();

    if (this.phase === 'bidding') {
      base.bidding = {
        turnSeat: this.bidding.turnSeat,
        highBid: this.bidding.highBid,
        highBidderSeat: this.bidding.highBidderSeat,
        activeSeats: this.bidding.activeSeats,
        history: this.bidding.history,
        minBid: this.ruleset.minBid,
        bidIncrement: this.ruleset.bidIncrement,
      };
    }

    if (viewerSeat !== null && viewerSeat !== undefined && this.hands[viewerSeat]) {
      base.yourHand = this.hands[viewerSeat];
    }

    if (this.phase === 'playing' || this.phase === 'handOver') {
      base.trick = this.trick;
      base.turnSeat = this.turnSeat;
      base.pendingTrickWinner = this.pendingTrickWinner;
      if (viewerSeat === this.turnSeat && this.phase === 'playing' && this.pendingTrickWinner === null) {
        base.legalPlays = legalPlays(this.hands[viewerSeat], this.trick.cards, this.trump, this.ruleset);
      }
    }

    base.lastCompletedTrick = this.lastCompletedTrick;

    if (this.phase === 'handOver' || this.phase === 'gameOver') {
      base.lastHandSummary = this.lastHandSummary;
    }
    if (this.phase === 'gameOver') {
      base.winnerTeam = this.winnerTeam;
    }

    return base;
  }
}

function describeCard(card) {
  if (card === 'ROOK') return 'the Rook';
  const col = card.replace(/\d+$/, '');
  const num = card.match(/\d+$/)[0];
  return `${col} ${num}`;
}

module.exports = { Room };
