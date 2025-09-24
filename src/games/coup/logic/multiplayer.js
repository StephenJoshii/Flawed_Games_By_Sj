import { doc, updateDoc, arrayUnion } from "firebase/firestore";
import { db } from "../../../firebase";
import { CHARACTERS } from './state.js';

// Helper function to create and shuffle the deck.
const createShuffledDeck = () => {
  const deck = [];
  for (const charKey in CHARACTERS) deck.push(charKey, charKey, charKey);
  for (let i = deck.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [deck[i], deck[j]] = [deck[j], deck[i]];
  }
  return deck;
};

// Adds a new player to an existing game document in Firestore.
export const addPlayerToGame = async (gameDocRef, user, playerCount) => {
    const newPlayer = { 
      uid: user.uid, 
      name: `Player ${playerCount + 1}`, 
      coins: 2, 
      cards: [], 
      isOut: false 
    };
    await updateDoc(gameDocRef, { 
      players: arrayUnion(newPlayer) 
    });
};

// Transitions the game from "waiting" to "playing".
export const startGame = async (gameId, currentPlayers, appId) => {
  const gameDocRef = doc(db, `artifacts/${appId}/public/data/coup-games`, gameId);
  const shuffledDeck = createShuffledDeck();
  
  // Deals two cards to each player from the top of the shuffled deck.
  const updatedPlayers = currentPlayers.map(p => ({
    ...p, 
    cards: [ 
      { character: shuffledDeck.pop(), isRevealed: false }, 
      { character: shuffledDeck.pop(), isRevealed: false } 
    ]
  }));

  // Updates the game document in Firestore to start the game.
  await updateDoc(gameDocRef, {
    players: updatedPlayers, 
    deck: shuffledDeck, 
    status: "playing",
    currentPlayerIndex: Math.floor(Math.random() * updatedPlayers.length),
    actionLog: arrayUnion("Game started!"),
  });
};
