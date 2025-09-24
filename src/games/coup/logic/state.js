// --- Game Constants and Definitions ---
export const CHARACTERS = {
  DUKE: { name: "Duke", ability: "Take 3 coins (Tax). Blocks Foreign Aid.", action: 'tax', blocks: 'foreign_aid' },
  ASSASSIN: { name: "Assassin", ability: "Pay 3 coins to assassinate another player.", action: 'assassinate', blocks: null },
  CAPTAIN: { name: "Captain", ability: "Take 2 coins from another player (Steal). Blocks Stealing.", action: 'steal', blocks: 'steal' },
  AMBASSADOR: { name: "Ambassador", ability: "Exchange cards with the deck (Exchange). Blocks Stealing.", action: 'exchange', blocks: 'steal' },
  CONTESSA: { name: "Contessa", ability: "Blocks Assassination.", action: null, blocks: 'assassinate' },
};

export const ACTION_CHARACTER_MAP = { tax: 'Duke', assassinate: 'Assassin', steal: 'Captain', exchange: 'Ambassador' };

// --- Deck and Player Initialization ---
const createDeck = () => {
  const deck = [];
  // Uses the character key (e.g., 'DUKE') for internal state.
  for (const charKey in CHARACTERS) deck.push(charKey, charKey, charKey);
  return deck;
};

const shuffleDeck = (deck) => {
  for (let i = deck.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [deck[i], deck[j]] = [deck[j], deck[i]];
  }
  return deck;
};

// Returns the complete initial game state object.
export const getInitialState = () => ({
  players: [],
  deck: createDeck(),
  treasury: 50,
  currentPlayerIndex: 0,
  actionLog: [],
  status: "waiting",
  winner: null,
  createdAt: new Date(),
  pendingAction: null,
});

// Initializes a new game with the host player.
export const initializeNewGame = (hostUser) => {
  const initialState = getInitialState();
  initialState.hostId = hostUser.uid;
  initialState.players = [{ uid: hostUser.uid, name: `Player 1`, coins: 2, cards: [], isOut: false }];
  initialState.treasury -= 2; // Starting coins for host
  initialState.actionLog.push(`Game created by Player 1. Waiting for players...`);
  return initialState;
};
