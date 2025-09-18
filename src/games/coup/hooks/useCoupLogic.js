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
    deck: createDeck(),
    treasury: 50 - 2,
    currentPlayerIndex: 0,
    actionLog: [`Game created by ${hostPlayer.name}. Waiting for players...`],
    status: "waiting",
    winner: null,
    createdAt: new Date(),
    pendingAction: null, // Tracks multi-step actions like challenges
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
export const performAction = (gameData, actionType, actingPlayerUid, targetPlayerUid = null) => {
  const newGameData = JSON.parse(JSON.stringify(gameData));
  const { players, currentPlayerIndex } = newGameData;
  const actingPlayer = players.find(p => p.uid === actingPlayerUid);
  const targetPlayer = targetPlayerUid ? players.find(p => p.uid === targetPlayerUid) : null;

  if (!actingPlayer || players[currentPlayerIndex].uid !== actingPlayerUid) {
    throw new Error("It's not your turn!");
  }

  const endTurn = () => {
    let nextPlayerIndex = (newGameData.currentPlayerIndex + 1) % newGameData.players.length;
    while (newGameData.players[nextPlayerIndex].isOut) {
      nextPlayerIndex = (nextPlayerIndex + 1) % newGameData.players.length;
    }
    newGameData.currentPlayerIndex = nextPlayerIndex;
    newGameData.actionLog.push(`${newGameData.players[nextPlayerIndex].name}'s turn.`);
  };

  switch (actionType) {
    case 'income':
      actingPlayer.coins += 1;
      newGameData.treasury -= 1;
      newGameData.actionLog.push(`${actingPlayer.name} takes Income.`);
      endTurn();
      break;
    case 'foreign_aid':
      actingPlayer.coins += 2;
      newGameData.treasury -= 2;
      newGameData.actionLog.push(`${actingPlayer.name} takes Foreign Aid.`);
      endTurn();
      break;
    case 'tax':
      actingPlayer.coins += 3;
      newGameData.treasury -= 3;
      newGameData.actionLog.push(`${actingPlayer.name} claims Duke and takes Tax.`);
      endTurn();
      break;
    case 'coup': { // ✅ DEFINITIVE FIX: Added curly braces to create a block scope.
      if (actingPlayer.coins < 7) throw new Error("Not enough coins for a Coup!");
      if (!targetPlayer) throw new Error("You must select a target for a Coup.");
      if (targetPlayer.isOut) throw new Error("Target is already out of the game.");
      
      actingPlayer.coins -= 7;
      
      const cardToLose = targetPlayer.cards.find(c => !c.isRevealed);
      if (cardToLose) {
        cardToLose.isRevealed = true;
        newGameData.actionLog.push(`${actingPlayer.name} launches a Coup against ${targetPlayer.name}. ${targetPlayer.name} reveals a ${cardToLose.character}.`);
        
        const remainingCards = targetPlayer.cards.filter(c => !c.isRevealed).length;
        if (remainingCards === 0) {
          targetPlayer.isOut = true;
          newGameData.actionLog.push(`${targetPlayer.name} has been eliminated!`);
        }
      } else {
         newGameData.actionLog.push(`${targetPlayer.name} had no influence to lose.`);
      }

      endTurn();
      break;
    }
    default:
      throw new Error(`Action type "${actionType}" is not yet implemented.`);
  }

  return newGameData;
};

