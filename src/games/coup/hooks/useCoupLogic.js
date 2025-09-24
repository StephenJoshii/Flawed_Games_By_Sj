import { doc, updateDoc, arrayUnion } from "firebase/firestore";
import { db } from "../../../firebase";

// --- Game Constants and Definitions ---
export const CHARACTERS = {
  DUKE: { name: "Duke", ability: "Take 3 coins (Tax). Blocks Foreign Aid.", action: 'tax', blocks: 'foreign_aid' },
  ASSASSIN: { name: "Assassin", ability: "Pay 3 coins to assassinate another player.", action: 'assassinate', blocks: null },
  CAPTAIN: { name: "Captain", ability: "Take 2 coins from another player (Steal). Blocks Stealing.", action: 'steal', blocks: 'steal' },
  AMBASSADOR: { name: "Ambassador", ability: "Exchange cards with the deck (Exchange). Blocks Stealing.", action: 'exchange', blocks: 'steal' },
  CONTESSA: { name: "Contessa", ability: "Blocks Assassination.", action: null, blocks: 'assassinate' },
};

const ACTION_CHARACTER_MAP = { tax: 'Duke', assassinate: 'Assassin', steal: 'Captain', exchange: 'Ambassador' };

// --- Deck and Player Initialization ---
const createDeck = () => {
  const deck = [];
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

export const initializeNewGame = (hostUser) => ({
  hostId: hostUser.uid, players: [{ uid: hostUser.uid, name: `Player 1`, coins: 2, cards: [], isOut: false }],
  deck: createDeck(), treasury: 48, currentPlayerIndex: 0,
  actionLog: [`Game created by ${hostUser.name}. Waiting for players...`],
  status: "waiting", winner: null, createdAt: new Date(), pendingAction: null,
});

// ✅ This function is now fully implemented.
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

// ✅ This function is now fully implemented.
export const startGame = async (gameId, currentPlayers, appId) => {
  const gameDocRef = doc(db, `artifacts/${appId}/public/data/coup-games`, gameId);
  const shuffledDeck = shuffleDeck(createDeck());
  const updatedPlayers = currentPlayers.map(p => ({
    ...p, cards: [ { character: shuffledDeck.pop(), isRevealed: false }, { character: shuffledDeck.pop(), isRevealed: false } ]
  }));
  await updateDoc(gameDocRef, {
    players: updatedPlayers, deck: shuffledDeck, status: "playing",
    currentPlayerIndex: Math.floor(Math.random() * updatedPlayers.length),
    actionLog: arrayUnion("Game started!"),
  });
};

// --- Core Game State Machine ---
const processGameEvent = (gameData, event) => {
  const { type, payload } = event;

  function getPlayer(players, uid) { return players.find(p => p.uid === uid); }
  
  function loseInfluence(player) {
    const cardToLose = player.cards.find(c => !c.isRevealed);
    if (cardToLose) {
      cardToLose.isRevealed = true;
      gameData.actionLog.push(`${player.name} reveals a ${CHARACTERS[cardToLose.character].name}.`);
    }
    if (player.cards.filter(c => !c.isRevealed).length === 0) {
      player.isOut = true;
      gameData.actionLog.push(`${player.name} has been eliminated!`);
    }
  }

  function endTurn() {
    const activePlayers = gameData.players.filter(p => !p.isOut);
    if (activePlayers.length === 1) {
      gameData.status = "finished";
      gameData.winner = activePlayers[0];
      gameData.actionLog.push(`${activePlayers[0].name} is the winner!`);
    } else {
      let nextIdx = (gameData.currentPlayerIndex + 1) % gameData.players.length;
      let loopGuard = 0;
      while (gameData.players[nextIdx].isOut && loopGuard < gameData.players.length) {
        nextIdx = (nextIdx + 1) % gameData.players.length;
        loopGuard++;
      }
      gameData.currentPlayerIndex = nextIdx;
      gameData.actionLog.push(`${gameData.players[nextIdx].name}'s turn.`);
    }
    gameData.pendingAction = null;
  }
  
  function resolveAction(action) {
    gameData.actionLog.push(`The action "${action.actionType}" is successful.`);
    const actionActor = getPlayer(gameData.players, action.actorUid);
    const actionTarget = getPlayer(gameData.players, action.targetUid);
    switch(action.actionType) {
        case 'tax': actionActor.coins += 3; break;
        case 'foreign_aid': actionActor.coins += 2; break;
        case 'steal': const stolen = Math.min(2, actionTarget.coins); actionActor.coins += stolen; actionTarget.coins -= stolen; break;
        case 'assassinate': loseInfluence(actionTarget); break;
        case 'exchange': {
            const unrevealed = actionActor.cards.filter(c => !c.isRevealed);
            const drawn = [gameData.deck.pop(), gameData.deck.pop()].filter(Boolean);
            const hand = [...unrevealed.map(c => c.character), ...drawn];
            const toKeep = hand.slice(0, unrevealed.length);
            const toReturn = hand.slice(unrevealed.length);
            toReturn.forEach(c => gameData.deck.push(c));
            shuffleDeck(gameData.deck);
            let keepIdx = 0;
            actionActor.cards = actionActor.cards.map(c => c.isRevealed ? c : { character: toKeep[keepIdx++], isRevealed: false });
            break;
        }
    }
    endTurn();
  }

  switch (type) {
    case 'PERFORM_ACTION': {
      const actor = getPlayer(gameData.players, payload.actorUid);
      const { actionType, targetUid } = payload;
      if (actionType === 'income') {
        actor.coins++; gameData.actionLog.push(`${actor.name} takes Income.`); endTurn();
      } else if (actionType === 'coup') {
        if (actor.coins < 7) throw new Error("Not enough coins for Coup!");
        const target = getPlayer(gameData.players, targetUid);
        actor.coins -= 7; loseInfluence(target);
        gameData.actionLog.push(`${actor.name} launches a Coup against ${target.name}.`); endTurn();
      } else {
        gameData.pendingAction = { type: 'action', actionType, actorUid: payload.actorUid, targetUid, responses: {} };
        gameData.actionLog.push(`${actor.name} is attempting to use ${actionType}.`);
      }
      break;
    }
    case 'HANDLE_RESPONSE': {
      const { pendingAction } = gameData;
      const { responseType, blockCharacter } = payload;
      const responder = getPlayer(gameData.players, payload.responderUid);
      const actor = getPlayer(gameData.players, pendingAction.actorUid);
      pendingAction.responses[responder.uid] = responseType;

      if (responseType === 'challenge') {
        const personChallenged = pendingAction.blocker ? getPlayer(gameData.players, pendingAction.blocker.uid) : actor;
        const claim = pendingAction.blocker ? pendingAction.blocker.character : ACTION_CHARACTER_MAP[pendingAction.actionType];
        gameData.actionLog.push(`${responder.name} challenges ${personChallenged.name}'s claim of ${claim}!`);
        const hasCard = personChallenged.cards.some(c => !c.isRevealed && c.character === claim);
        
        if (hasCard) { // Challenge Failed
          gameData.actionLog.push(`${personChallenged.name} reveals a ${CHARACTERS[claim].name}. The challenge fails!`);
          loseInfluence(responder);
          pendingAction.blocker ? endTurn() : resolveAction(pendingAction);
        } else { // Challenge Succeeded
          gameData.actionLog.push(`${personChallenged.name} was bluffing! The challenge succeeds!`);
          loseInfluence(personChallenged);
          pendingAction.blocker ? resolveAction(pendingAction) : endTurn();
        }
      } else if (responseType === 'block') {
        pendingAction.type = 'block';
        pendingAction.blocker = { uid: responder.uid, character: blockCharacter, blockerName: responder.name };
        gameData.actionLog.push(`${responder.name} claims to block with a ${blockCharacter}.`);
        pendingAction.responses = {}; // Reset for challenging the block
      } else { // 'allow'
        const activePlayers = gameData.players.filter(p => !p.isOut);
        const playersWhoCanRespond = pendingAction.blocker ? [actor] : activePlayers.filter(p => p.uid !== actor.uid);
        const allResponded = playersWhoCanRespond.every(p => pendingAction.responses[p.uid]);
        if (allResponded) {
          pendingAction.blocker ? endTurn() : resolveAction(pendingAction);
        }
      }
      break;
    }
  }
  return gameData;
};

// --- Exported Functions ---
export const performAction = (gameData, actionType, actingPlayerUid, targetPlayerUid = null) => {
  const event = { type: 'PERFORM_ACTION', payload: { actorUid: actingPlayerUid, actionType, targetUid: targetPlayerUid } };
  return processGameEvent(JSON.parse(JSON.stringify(gameData)), event);
};

export const handleResponse = (gameData, responseType, respondingPlayerUid, blockCharacter = null) => {
  const event = { type: 'HANDLE_RESPONSE', payload: { responderUid: respondingPlayerUid, responseType, blockCharacter } };
  return processGameEvent(JSON.parse(JSON.stringify(gameData)), event);
};

