'use strict';

// ---------------------------------------------------------------------------
// Rook game engine.
//
// Card ids are plain strings: "red7", "black14", ... or the literal "ROOK".
// A ruleset object controls every place where "Newman rules" differ from
// standard Rook. See RULESETS below for the two presets.
// ---------------------------------------------------------------------------

const COLORS = ['red', 'yellow', 'green', 'black'];
const NUMBERS = [1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13, 14];
const HAND_SIZE = 13;
const NEST_SIZE = 5;

const RULESETS = {
  // Read off the right-hand ("STD ROOK") column of the notes.
  standard: {
    name: 'standard',
    minBid: 70,
    bidIncrement: 5,
    rookPoints: 20,
    // Points in the discard pile (nest) are added to the final-trick winner.
    nestPointsToFinalTrickWinner: true,
    // Player to the dealer's left leads the first trick.
    firstLeader: 'leftOfDealer',
    // The Rook card outranks every other trump card...
    rookRankHigh: true,
    // ...and may be played at any time, even if you could follow suit.
    rookAlwaysLegal: true,
  },
  // Read off the left-hand ("NEWMAN") column of the notes.
  newman: {
    name: 'newman',
    minBid: 5,
    bidIncrement: 5,
    rookPoints: 25,
    // Points in the discard pile (nest) are not added to either team's point total.
    nestPointsToFinalTrickWinner: false,
    // The winning bidder leads the first trick.
    firstLeader: 'bidder',
    // The Rook card ranks as the lowest trump card...
    rookRankHigh: false,
    // ...and must be played like any other trump card (obeys follow-suit).
    rookAlwaysLegal: false,
  },
};

function getRuleset(name) {
  return RULESETS[name] || RULESETS.newman;
}

function buildDeck() {
  const deck = [];
  for (const color of COLORS) {
    for (const num of NUMBERS) deck.push(`${color}${num}`);
  }
  deck.push('ROOK');
  return deck; // 57 cards
}

function shuffle(arr) {
  const a = arr.slice();
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [a[i], a[j]] = [a[j], a[i]];
  }
  return a;
}

function colorOf(card) {
  if (card === 'ROOK') return null;
  const m = card.match(/^([a-z]+)(\d+)$/);
  return m[1];
}

function numberOf(card) {
  if (card === 'ROOK') return null;
  const m = card.match(/^([a-z]+)(\d+)$/);
  return parseInt(m[2], 10);
}

function pointValue(card, ruleset) {
  if (card === 'ROOK') return ruleset.rookPoints;
  const n = numberOf(card);
  if (n === 14 || n === 10) return 10;
  if (n === 5) return 5;
  return 0;
}

function isTrump(card, trumpColor) {
  return card === 'ROOK' || colorOf(card) === trumpColor;
}

// The "color" a card counts as when leading/following suit. The Rook card
// has no natural color, so for follow-suit purposes it always counts as
// trump (both rulesets agree on this - they differ on *when* it may be
// played, not on what it counts as).
function effectiveColor(card, trumpColor) {
  return card === 'ROOK' ? trumpColor : colorOf(card);
}

function rank(card, ruleset) {
  if (card === 'ROOK') return ruleset.rookRankHigh ? 15 : 0;
  return numberOf(card);
}

function sortHand(hand, trumpColor) {
  const order = trumpColor ? [trumpColor, ...COLORS.filter((c) => c !== trumpColor)] : COLORS;
  return hand.slice().sort((a, b) => {
    const ca = effectiveColor(a, trumpColor) || '';
    const cb = effectiveColor(b, trumpColor) || '';
    if (ca !== cb) return order.indexOf(ca) - order.indexOf(cb);
    const ra = a === 'ROOK' ? (trumpColor ? 100 : -1) : numberOf(a);
    const rb = b === 'ROOK' ? (trumpColor ? 100 : -1) : numberOf(b);
    return rb - ra;
  });
}

function legalPlays(hand, trickCards, trumpColor, ruleset) {
  if (trickCards.length === 0) return hand.slice();
  const ledColor = effectiveColor(trickCards[0].card, trumpColor);
  const matching = hand.filter((c) => effectiveColor(c, trumpColor) === ledColor);
  if (matching.length > 0) {
    const legal = matching.slice();
    if (
      ruleset.rookAlwaysLegal &&
      ledColor !== trumpColor &&
      hand.includes('ROOK') &&
      !legal.includes('ROOK')
    ) {
      legal.push('ROOK');
    }
    return legal;
  }
  return hand.slice();
}

function trickWinnerSeat(trickCards, trumpColor, ruleset) {
  const trumps = trickCards.filter((tc) => isTrump(tc.card, trumpColor));
  let pool;
  if (trumps.length > 0) {
    pool = trumps;
  } else {
    const ledColor = effectiveColor(trickCards[0].card, trumpColor);
    pool = trickCards.filter((tc) => colorOf(tc.card) === ledColor);
  }
  let best = pool[0];
  for (const tc of pool) {
    if (rank(tc.card, ruleset) > rank(best.card, ruleset)) best = tc;
  }
  return best.seat;
}

function teamOf(seat) {
  return seat % 2 === 0 ? 'A' : 'B';
}

function otherTeam(team) {
  return team === 'A' ? 'B' : 'A';
}

function dealHand(ruleset) {
  const deck = shuffle(buildDeck());
  const hands = [[], [], [], []];
  for (let i = 0; i < HAND_SIZE * 4; i++) {
    hands[i % 4].push(deck[i]);
  }
  const nest = deck.slice(HAND_SIZE * 4);
  for (let s = 0; s < 4; s++) hands[s] = sortHand(hands[s], null);
  return { hands, nest };
}

module.exports = {
  COLORS,
  HAND_SIZE,
  NEST_SIZE,
  RULESETS,
  getRuleset,
  buildDeck,
  shuffle,
  colorOf,
  numberOf,
  pointValue,
  isTrump,
  effectiveColor,
  rank,
  sortHand,
  legalPlays,
  trickWinnerSeat,
  teamOf,
  otherTeam,
  dealHand,
};
