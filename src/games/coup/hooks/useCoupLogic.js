import { doc, updateDoc, arrayUnion } from "firebase/firestore";
import { db } from "../../../firebase";

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
  const hostPlayer = {
    uid: hostUser.uid,
    name: `Player 1`,
    coins: 2,
    cards: [], // Cards are dealt when the game starts
    isOut: false,
  };

  return {
    hostId: hostUser.uid,
    players: [hostPlayer],
    deck: createDeck(), // Deck is created but not shuffled until start
    treasury: 50 - 2,
    currentPlayerIndex: 0,
    actionLog: [`Game created by ${hostPlayer.name}. Waiting for players...`],
    status: "waiting",
    winner: null,
    createdAt: new Date(),
  };
};

// Adds a new player to an existing game document in Firestore.
export const addPlayerToGame = async (gameDocRef, user, playerCount) => {
    const newPlayer = {
        uid: user.uid,
        name: `Player ${playerCount + 1}`,
        coins: 2,
        cards: [],
        isOut: false,
    };
    await updateDoc(gameDocRef, {
        players: arrayUnion(newPlayer)
    });
};

// Transitions the game from "waiting" to "playing".
export const startGame = async (gameId, currentPlayers, appId) => {
  const gameDocRef = doc(db, `artifacts/${appId}/public/data/coup-games`, gameId);
  const shuffledDeck = shuffleDeck(createDeck());

  const updatedPlayers = currentPlayers.map(player => ({
    ...player,
    cards: [
      { character: shuffledDeck.pop(), isRevealed: false },
      { character: shuffledDeck.pop(), isRevealed: false },
    ]
  }));

  await updateDoc(gameDocRef, {
    players: updatedPlayers,
    deck: shuffledDeck,
    status: "playing",
    currentPlayerIndex: Math.floor(Math.random() * updatedPlayers.length),
    actionLog: arrayUnion("Game started!"),
  });
};

// Processes a player's action and returns the new game state.
export const performAction = (gameData, actionType, actingPlayerUid) => {
  const newGameData = JSON.parse(JSON.stringify(gameData)); // Deep copy to prevent mutation
  const { players, currentPlayerIndex } = newGameData;
  const actingPlayer = players.find(p => p.uid === actingPlayerUid);

  if (!actingPlayer || players[currentPlayerIndex].uid !== actingPlayerUid) {
    throw new Error("Not your turn!");
  }

  switch (actionType) {
    case 'income':
      actingPlayer.coins += 1;
      newGameData.treasury -= 1;
      newGameData.actionLog.push(`${actingPlayer.name} takes Income.`);
      break;
    // We will add other actions here later.
    default:
      throw new Error(`Unknown action type: ${actionType}`);
  }

  // Advance to the next player
  let nextPlayerIndex = (currentPlayerIndex + 1) % players.length;
  // Skip players who are out
  while (players[nextPlayerIndex].isOut) {
    nextPlayerIndex = (nextPlayerIndex + 1) % players.length;
  }
  newGameData.currentPlayerIndex = nextPlayerIndex;
  newGameData.actionLog.push(`${players[nextPlayerIndex].name}'s turn.`);

  return newGameData;
};

