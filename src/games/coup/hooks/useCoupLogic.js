import { doc, updateDoc, arrayUnion } from "firebase/firestore";
import { db } from "../../../firebase";

// Defines the characters, their abilities, and the actions/blocks they are associated with.
export const CHARACTERS = {
  DUKE: { name: "Duke", ability: "Take 3 coins (Tax). Blocks Foreign Aid.", action: 'tax', blocks: 'foreign_aid' },
  ASSASSIN: { name: "Assassin", ability: "Pay 3 coins to assassinate another player.", action: 'assassinate', blocks: null },
  CAPTAIN: { name: "Captain", ability: "Take 2 coins from another player (Steal). Blocks Stealing.", action: 'steal', blocks: 'steal' },
  AMBASSADOR: { name: "Ambassador", ability: "Exchange cards with the deck (Exchange). Blocks Stealing.", action: 'exchange', blocks: 'steal' },
  CONTESSA: { name: "Contessa", ability: "Blocks Assassination.", action: null, blocks: 'assassinate' },
};

const ACTION_CHARACTER_MAP = {
    tax: 'Duke',
    assassinate: 'Assassin',
    steal: 'Captain',
    exchange: 'Ambassador',
};

const BLOCK_CHARACTER_MAP = {
    foreign_aid: ['Duke'],
    steal: ['Captain', 'Ambassador'],
    assassinate: ['Contessa'],
};

// Creates a standard 15-card deck.
const createDeck = () => {
  const deck = [];
  for (const char in CHARACTERS) {
    deck.push(CHARACTERS[char].name, CHARACTERS[char].name, CHARACTERS[char].name);
  }
  return deck;
};

// Shuffles the deck using the Fisher-Yates algorithm.
const shuffleDeck = (deck) => {
  for (let i = deck.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [deck[i], deck[j]] = [deck[j], deck[i]];
  }
  return deck;
};

// Initializes the game state for a new game.
export const initializeNewGame = (hostUser) => {
  return {
    hostId: hostUser.uid,
    players: [{ uid: hostUser.uid, name: `Player 1`, coins: 2, cards: [], isOut: false }],
    deck: createDeck(),
    treasury: 48,
    currentPlayerIndex: 0,
    actionLog: [`Game created by ${hostUser.name}. Waiting for players...`],
    status: "waiting",
    winner: null,
    createdAt: new Date(),
    pendingAction: null,
  };
};

// Adds a new player to a game.
export const addPlayerToGame = async (gameDocRef, user, playerCount) => {
    const newPlayer = { uid: user.uid, name: `Player ${playerCount + 1}`, coins: 2, cards: [], isOut: false };
    await updateDoc(gameDocRef, { players: arrayUnion(newPlayer) });
};

// Starts the game, dealing cards and setting the status to "playing".
export const startGame = async (gameId, currentPlayers, appId) => {
  const gameDocRef = doc(db, `artifacts/${appId}/public/data/coup-games`, gameId);
  const shuffledDeck = shuffleDeck(createDeck());
  const updatedPlayers = currentPlayers.map(p => ({
    ...p,
    cards: [ { character: shuffledDeck.pop(), isRevealed: false }, { character: shuffledDeck.pop(), isRevealed: false } ]
  }));
  await updateDoc(gameDocRef, {
    players: updatedPlayers, deck: shuffledDeck, status: "playing",
    currentPlayerIndex: Math.floor(Math.random() * updatedPlayers.length),
    actionLog: arrayUnion("Game started!"),
  });
};

// --- Helper Functions ---
const getPlayer = (players, uid) => players.find(p => p.uid === uid);
const endTurn = (gameData) => {
    // Check for a winner first
    const activePlayers = gameData.players.filter(p => !p.isOut);
    if (activePlayers.length === 1) {
        gameData.status = "finished";
        gameData.winner = activePlayers[0];
        gameData.actionLog.push(`${activePlayers[0].name} is the winner!`);
        return gameData;
    }

    let nextPlayerIndex = (gameData.currentPlayerIndex + 1) % gameData.players.length;
    while (gameData.players[nextPlayerIndex].isOut) {
        nextPlayerIndex = (nextPlayerIndex + 1) % gameData.players.length;
    }
    gameData.currentPlayerIndex = nextPlayerIndex;
    gameData.actionLog.push(`${gameData.players[nextPlayerIndex].name}'s turn.`);
    gameData.pendingAction = null;
    return gameData;
};

// --- Core Action and Response Logic ---

export const performAction = (gameData, actionType, actingPlayerUid, targetPlayerUid = null) => {
  let newGameData = JSON.parse(JSON.stringify(gameData));
  const { players, currentPlayerIndex } = newGameData;
  const actingPlayer = getPlayer(players, actingPlayerUid);
  
  if (!actingPlayer || players[currentPlayerIndex].uid !== actingPlayerUid) throw new Error("It's not your turn!");

  if (actionType === 'income') {
    actingPlayer.coins++;
    newGameData.actionLog.push(`${actingPlayer.name} takes Income.`);
    return endTurn(newGameData);
  }
  
  if (actionType === 'coup') {
    if(actingPlayer.coins < 7) throw new Error("Not enough coins for Coup!");
    actingPlayer.coins -= 7;
    newGameData.actionLog.push(`${actingPlayer.name} launches a Coup.`);
    // This will later be a "lose influence" event for the target.
    // For now, it's simplified.
    return endTurn(newGameData);
  }
  
  newGameData.pendingAction = {
      actionType,
      actorUid: actingPlayerUid,
      targetUid: targetPlayerUid,
      responses: {},
      challenger: null,
      blocker: null,
  };
  newGameData.actionLog.push(`${actingPlayer.name} is attempting to use ${actionType}.`);
  return newGameData;
};

export const handleResponse = (gameData, responseType, respondingPlayerUid, blockCharacter = null) => {
    let newGameData = JSON.parse(JSON.stringify(gameData));
    const { players, pendingAction } = newGameData;
    const respondingPlayer = getPlayer(players, respondingPlayerUid);
    const actor = getPlayer(players, pendingAction.actorUid);

    if (!pendingAction || !respondingPlayer) throw new Error("Invalid response state.");
    
    pendingAction.responses[respondingPlayerUid] = responseType;

    // Handle Challenge
    if (responseType === 'challenge') {
        newGameData.actionLog.push(`${respondingPlayer.name} challenges ${actor.name}!`);
        const requiredCharacter = ACTION_CHARACTER_MAP[pendingAction.actionType];
        const actorHasCard = actor.cards.some(c => !c.isRevealed && c.character === requiredCharacter);

        if (actorHasCard) { // Challenge Failed
            newGameData.actionLog.push(`${actor.name} reveals a ${requiredCharacter}. The challenge fails!`);
            const cardToLose = respondingPlayer.cards.find(c => !c.isRevealed);
            if (cardToLose) cardToLose.isRevealed = true;
        } else { // Challenge Succeeded
            newGameData.actionLog.push(`${actor.name} was bluffing! The challenge succeeds!`);
            const cardToLose = actor.cards.find(c => !c.isRevealed);
            if (cardToLose) cardToLose.isRevealed = true;
        }
        return endTurn(newGameData);
    }
    
    if (responseType === 'block') {
        pendingAction.blocker = { uid: respondingPlayerUid, character: blockCharacter };
        newGameData.actionLog.push(`${respondingPlayer.name} claims to have a ${blockCharacter} to block the action.`);
        // Reset responses so players can now challenge the block.
        pendingAction.responses = {};
        return newGameData;
    }
    
    const activePlayers = players.filter(p => !p.isOut && p.uid !== pendingAction.actorUid);
    const allAllowed = activePlayers.every(p => pendingAction.responses[p.uid] === 'allow');

    if (allAllowed) {
        newGameData.actionLog.push(`The action is successful.`);
        // Resolve the original action
        if (pendingAction.actionType === 'tax') actor.coins += 3;
        if (pendingAction.actionType === 'foreign_aid') actor.coins += 2;
        return endTurn(newGameData);
    }
    
    return newGameData;
}

