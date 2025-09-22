import { doc, updateDoc, arrayUnion } from "firebase/firestore";
import { db } from "../../../firebase";

// Defines the characters and their abilities available in the game.
export const CHARACTERS = {
  DUKE: { name: "Duke", ability: "Take 3 coins (Tax). Blocks Foreign Aid.", action: 'tax' },
  ASSASSIN: { name: "Assassin", ability: "Pay 3 coins to assassinate another player.", action: 'assassinate' },
  CAPTAIN: { name: "Captain", ability: "Take 2 coins from another player (Steal). Blocks Stealing.", action: 'steal' },
  AMBASSADOR: { name: "Ambassador", ability: "Exchange cards with the deck (Exchange). Blocks Stealing.", action: 'exchange' },
  CONTESSA: { name: "Contessa", ability: "Blocks Assassination.", block: 'assassinate' },
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
    uid: hostUser.uid, name: `Player 1`, coins: 2, cards: [], isOut: false,
  };
  return {
    hostId: hostUser.uid, players: [hostPlayer], deck: createDeck(), treasury: 48,
    currentPlayerIndex: 0, actionLog: [`Game created by ${hostPlayer.name}. Waiting for players...`],
    status: "waiting", winner: null, createdAt: new Date(), pendingAction: null,
  };
};

// Adds a new player to an existing game document in Firestore.
export const addPlayerToGame = async (gameDocRef, user, playerCount) => {
    const newPlayer = { uid: user.uid, name: `Player ${playerCount + 1}`, coins: 2, cards: [], isOut: false };
    await updateDoc(gameDocRef, { players: arrayUnion(newPlayer) });
};

// Transitions the game from "waiting" to "playing".
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

// --- Helper function to find a player by UID ---
const getPlayer = (players, uid) => players.find(p => p.uid === uid);

// --- Core Action and Response Logic ---

export const performAction = (gameData, actionType, actingPlayerUid, targetPlayerUid = null) => {
  const newGameData = JSON.parse(JSON.stringify(gameData));
  const { players, currentPlayerIndex } = newGameData;
  const actingPlayer = getPlayer(players, actingPlayerUid);
  
  if (!actingPlayer || players[currentPlayerIndex].uid !== actingPlayerUid) throw new Error("It's not your turn!");
  if (actingPlayer.isOut) throw new Error("You are out of the game!");

  const endTurn = () => {
      let nextPlayerIndex = (newGameData.currentPlayerIndex + 1) % newGameData.players.length;
      while (newGameData.players[nextPlayerIndex].isOut) {
          nextPlayerIndex = (nextPlayerIndex + 1) % newGameData.players.length;
      }
      newGameData.currentPlayerIndex = nextPlayerIndex;
      newGameData.actionLog.push(`${newGameData.players[nextPlayerIndex].name}'s turn.`);
  };

  // Actions that cannot be challenged or blocked resolve immediately.
  if (actionType === 'income') {
    actingPlayer.coins += 1;
    newGameData.treasury -= 1;
    newGameData.actionLog.push(`${actingPlayer.name} takes Income.`);
    endTurn();
    return newGameData;
  }
  
  if (actionType === 'coup') {
      if (actingPlayer.coins < 7) throw new Error("Not enough coins for a Coup!");
      const targetPlayer = getPlayer(players, targetPlayerUid);
      if (!targetPlayer) throw new Error("Target not found for Coup.");
      actingPlayer.coins -= 7;
      // This will later be a "lose influence" event. For now, we reveal one card.
      const cardToReveal = targetPlayer.cards.find(c => !c.isRevealed);
      if (cardToReveal) cardToReveal.isRevealed = true;
      newGameData.actionLog.push(`${actingPlayer.name} launches a Coup against ${targetPlayer.name}.`);
      endTurn();
      return newGameData;
  }
  
  // For actions that CAN be challenged, we create a pending action.
  newGameData.pendingAction = {
      actionType,
      actorUid: actingPlayerUid,
      targetUid: targetPlayerUid,
      responses: {}, // Tracks responses by player UID
      challenger: null,
      blocker: null,
  };
  newGameData.actionLog.push(`${actingPlayer.name} is attempting to ${actionType.replace('_', ' ')}...`);
  return newGameData;
};

// This function now contains the complete logic for challenges.
export const handleResponse = (gameData, responseType, respondingPlayerUid) => {
    const newGameData = JSON.parse(JSON.stringify(gameData));
    const { players, pendingAction } = newGameData;
    const respondingPlayer = getPlayer(players, respondingPlayerUid);
    const actor = getPlayer(players, pendingAction.actorUid);

    if (!pendingAction || !respondingPlayer) throw new Error("Invalid response state.");

    // --- Handle Challenge ---
    if (responseType === 'challenge') {
        const requiredCharacter = ACTION_CHARACTER_MAP[pendingAction.actionType];
        const actorHasCard = actor.cards.some(card => !card.isRevealed && card.character === requiredCharacter);
        
        newGameData.actionLog.push(`${respondingPlayer.name} challenges ${actor.name}!`);

        if (actorHasCard) { // Challenge Failed
            newGameData.actionLog.push(`${actor.name} reveals a ${requiredCharacter}. The challenge fails!`);
            const cardToReveal = respondingPlayer.cards.find(c => !c.isRevealed);
            if (cardToReveal) cardToReveal.isRevealed = true;
            
            // The actor proves their card, shuffles it into the deck, and gets a new one.
            const provenCardIndex = actor.cards.findIndex(c => !c.isRevealed && c.character === requiredCharacter);
            newGameData.deck.push(actor.cards[provenCardIndex].character);
            shuffleDeck(newGameData.deck);
            actor.cards[provenCardIndex].character = newGameData.deck.pop();

            // The original action succeeds. (Simplified for now)
            if (pendingAction.actionType === 'tax') actor.coins += 3;
            if (pendingAction.actionType === 'foreign_aid') actor.coins += 2; // Should not happen, but as an example
        } else { // Challenge Succeeded
            newGameData.actionLog.push(`${actor.name} was bluffing! The challenge succeeds!`);
            const cardToReveal = actor.cards.find(c => !c.isRevealed);
            if (cardToReveal) cardToReveal.isRevealed = true;
        }

        // After any challenge, the action is resolved.
        newGameData.pendingAction = null;
        let nextPlayerIndex = (newGameData.currentPlayerIndex + 1) % newGameData.players.length;
        while(newGameData.players[nextPlayerIndex].isOut) nextPlayerIndex = (nextPlayerIndex + 1) % newGameData.players.length;
        newGameData.currentPlayerIndex = nextPlayerIndex;
    } 
    
    // --- Handle Allow ---
    // In a real game, we'd wait for all players. Here we simplify.
    else if (responseType === 'allow') {
        newGameData.actionLog.push(`${respondingPlayer.name} allows the action.`);
        // Placeholder: assume one "allow" is enough to resolve the action.
        if (pendingAction.actionType === 'tax') actor.coins += 3;
        if (pendingAction.actionType === 'foreign_aid') actor.coins += 2;
        newGameData.pendingAction = null;
        let nextPlayerIndex = (newGameData.currentPlayerIndex + 1) % newGameData.players.length;
        while(newGameData.players[nextPlayerIndex].isOut) nextPlayerIndex = (nextPlayerIndex + 1) % newGameData.players.length;
        newGameData.currentPlayerIndex = nextPlayerIndex;
    }

    return newGameData;
}

