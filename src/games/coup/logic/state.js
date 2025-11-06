// --- Game Constants and Definitions ---
export const CHARACTERS = {
  DUKE: { name: "Duke", ability: "Take 3 coins (Tax). Blocks Foreign Aid.", action: 'tax', blocks: ['foreign_aid'] },
  ASSASSIN: { name: "Assassin", ability: "Pay 3 coins to assassinate another player.", action: 'assassinate', blocks: [] },
  CAPTAIN: { name: "Captain", ability: "Take 2 coins from another player (Steal). Blocks Stealing.", action: 'steal', blocks: ['steal'] },
  AMBASSADOR: { name: "Ambassador", ability: "Exchange cards with the deck. Blocks Stealing.", action: 'exchange', blocks: ['steal'] },
  CONTESSA: { name: "Contessa", ability: "Blocks Assassination.", action: null, blocks: ['assassinate'] },
};

export const ACTIONS = {
  // Actions anyone can do (no character needed)
  income: { 
    name: 'Income', 
    cost: 0, 
    canBeBlocked: false, 
    canBeChallenged: false, 
    description: 'Take 1 coin from the treasury',
    requiresTarget: false,
  },
  foreign_aid: { 
    name: 'Foreign Aid', 
    cost: 0, 
    canBeBlocked: true, 
    canBeChallenged: false, 
    description: 'Take 2 coins from the treasury (can be blocked by Duke)',
    requiresTarget: false,
    blockedBy: ['DUKE']
  },
  coup: { 
    name: 'Coup', 
    cost: 7, 
    canBeBlocked: false, 
    canBeChallenged: false, 
    description: 'Pay 7 coins to force a player to lose influence',
    requiresTarget: true,
  },
  // Character-specific actions
  tax: { 
    name: 'Tax', 
    cost: 0, 
    canBeBlocked: false, 
    canBeChallenged: true, 
    requiredCharacter: 'DUKE',
    description: 'Take 3 coins from the treasury (Duke)',
    requiresTarget: false,
  },
  assassinate: { 
    name: 'Assassinate', 
    cost: 3, 
    canBeBlocked: true, 
    canBeChallenged: true, 
    requiredCharacter: 'ASSASSIN',
    description: 'Pay 3 coins to assassinate a player (can be blocked by Contessa)',
    requiresTarget: true,
    blockedBy: ['CONTESSA']
  },
  steal: { 
    name: 'Steal', 
    cost: 0, 
    canBeBlocked: true, 
    canBeChallenged: true, 
    requiredCharacter: 'CAPTAIN',
    description: 'Take 2 coins from another player (can be blocked by Captain or Ambassador)',
    requiresTarget: true,
    blockedBy: ['CAPTAIN', 'AMBASSADOR']
  },
  exchange: { 
    name: 'Exchange', 
    cost: 0, 
    canBeBlocked: false, 
    canBeChallenged: true, 
    requiredCharacter: 'AMBASSADOR',
    description: 'Exchange cards with the deck (Ambassador)',
    requiresTarget: false,
  },
};

export const ACTION_CHARACTER_MAP = { tax: 'DUKE', assassinate: 'ASSASSIN', steal: 'CAPTAIN', exchange: 'AMBASSADOR' };

// --- Deck and Player Initialization ---
const createDeck = () => {
  const deck = [];
  // 3 of each character (15 cards total)
  for (const charKey in CHARACTERS) {
    deck.push(charKey, charKey, charKey);
  }
  return deck;
};

export const shuffleDeck = (deck) => {
  const shuffled = [...deck];
  for (let i = shuffled.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
  }
  return shuffled;
};

// Returns the complete initial game state object.
export const getInitialState = () => ({
  players: [],
  deck: shuffleDeck(createDeck()),
  currentPlayerIndex: 0,
  actionLog: [],
  status: "waiting", // waiting, playing, finished
  winner: null,
  createdAt: new Date().toISOString(),
  pendingAction: null,
  // Pending action structure when set:
  // {
  //   type: 'awaiting_response' | 'awaiting_block_response' | 'resolving',
  //   actionType: string,
  //   actorUid: string,
  //   targetUid: string | null,
  //   blockingPlayerUid: string | null,
  //   blockingCharacter: string | null,
  //   awaitingResponseFrom: [uid1, uid2, ...], // Players who can still respond
  //   responses: { uid: 'pass' | 'block' | 'challenge' },
  //   resolvedCost: number, // Coins already paid for the action
  // }
});

// Initializes a new game with the host player.
export const initializeNewGame = (hostUser) => {
  const initialState = getInitialState();
  initialState.hostId = hostUser.uid;
  initialState.players = [
    { 
      uid: hostUser.uid, 
      name: `Player 1`, 
      coins: 2, 
      cards: [], 
      isOut: false 
    }
  ];
  initialState.actionLog.push(`Game created by Player 1. Waiting for players...`);
  return initialState;
};
