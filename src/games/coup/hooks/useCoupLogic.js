import { updateDoc, arrayUnion } from "firebase/firestore";

// Defines the characters and their abilities available in the game.
export const CHARACTERS = {
  DUKE: { name: "Duke", ability: "Take 3 coins (Tax). Blocks Foreign Aid." },
  ASSASSIN: { name: "Assassin", ability: "Pay 3 coins to assassinate another player." },
  CAPTAIN: { name: "Captain", ability: "Take 2 coins from another player (Steal). Blocks Stealing." },
  AMBASSADOR: { name: "Ambassador", ability: "Exchange cards with the deck (Exchange). Blocks Stealing." },
  CONTESSA: { name: "Contessa", ability: "Blocks Assassination." },
};

// Creates a standard 15-card deck with 3 of each character.
const createDeck = () => {
  const deck = [];
  for (const character in CHARACTERS) {
    deck.push(CHARACTERS[character].name, CHARACTERS[character].name, CHARACTERS[character].name);
  }
  return deck;
};

// Shuffles the deck using the Fisher-Yates algorithm for randomness.
const shuffleDeck = (deck) => {
  for (let i = deck.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [deck[i], deck[j]] = [deck[j], deck[i]];
  }
  return deck;
};

// Initializes the full game state for a new game.
export const initializeNewGame = (hostUser) => {
  const deck = shuffleDeck(createDeck());
  
  // Sets up the initial state for the host player.
  const hostPlayer = {
    uid: hostUser.uid,
    name: `Player 1`,
    coins: 2,
    cards: [
      { character: deck.pop(), isRevealed: false },
      { character: deck.pop(), isRevealed: false },
    ],
    isOut: false,
  };

  // Returns the complete initial game document to be saved in Firestore.
  return {
    hostId: hostUser.uid,
    players: [hostPlayer],
    deck: deck,
    treasury: 50 - 2, // 50 total coins minus the 2 for the first player
    currentPlayerIndex: 0,
    actionLog: [`Game created by ${hostPlayer.name}. Waiting for players...`],
    status: "waiting",
    winner: null,
    createdAt: new Date(),
  };
};

// Adds a new player to an existing game document in Firestore.
export const addPlayerToGame = async (gameDocRef, user) => {
    const newPlayer = {
        uid: user.uid,
        name: `Player ${new Date().getSeconds()}`, // Simple name for now
        coins: 2,
        cards: [], // Cards will be dealt when the game starts
        isOut: false,
    };

    // Atomically add the new player to the 'players' array in Firestore.
    await updateDoc(gameDocRef, {
        players: arrayUnion(newPlayer)
    });
};

