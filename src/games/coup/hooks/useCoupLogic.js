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

const ACTION_CHARACTER_MAP = { tax: 'Duke', assassinate: 'Assassin', steal: 'Captain', exchange: 'Ambassador' };
const BLOCK_CHARACTER_MAP = { foreign_aid: ['Duke'], steal: ['Captain', 'Ambassador'], assassinate: ['Contessa'] };

const createDeck = () => {
  const deck = [];
  for (const char in CHARACTERS) deck.push(char, char, char);
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

export const addPlayerToGame = async (gameDocRef, user, playerCount) => {
    await updateDoc(gameDocRef, { players: arrayUnion({ uid: user.uid, name: `Player ${playerCount + 1}`, coins: 2, cards: [], isOut: false }) });
};

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

// --- Helper Functions ---
const getPlayer = (players, uid) => players.find(p => p.uid === uid);
const loseInfluence = (player) => {
    const cardToLose = player.cards.find(c => !c.isRevealed);
    if (cardToLose) cardToLose.isRevealed = true;
    if (player.cards.filter(c => !c.isRevealed).length === 0) player.isOut = true;
    return cardToLose;
};
const endTurn = (gameData) => {
    const activePlayers = gameData.players.filter(p => !p.isOut);
    if (activePlayers.length === 1) {
        gameData.status = "finished"; gameData.winner = activePlayers[0];
        gameData.actionLog.push(`${activePlayers[0].name} is the winner!`);
    } else {
        let nextPlayerIndex = (gameData.currentPlayerIndex + 1) % gameData.players.length;
        while (gameData.players[nextPlayerIndex].isOut) nextPlayerIndex = (nextPlayerIndex + 1) % gameData.players.length;
        gameData.currentPlayerIndex = nextPlayerIndex;
        gameData.actionLog.push(`${gameData.players[nextPlayerIndex].name}'s turn.`);
    }
    gameData.pendingAction = null;
    return gameData;
};
const resolveAction = (gameData) => {
    const { players, pendingAction, deck } = gameData;
    const actor = getPlayer(players, pendingAction.actorUid);
    const target = getPlayer(players, pendingAction.targetUid);
    switch(pendingAction.actionType) {
        case 'tax': actor.coins += 3; break;
        case 'foreign_aid': actor.coins += 2; break;
        case 'steal': const stolen = Math.min(2, target.coins); actor.coins += stolen; target.coins -= stolen; break;
        case 'assassinate': loseInfluence(target); break;
        case 'exchange':
            const unrevealedCards = actor.cards.filter(c => !c.isRevealed);
            const newCards = [deck.pop(), deck.pop()];
            // In a real UI, you'd let the player choose. Here we automate it.
            // Put old cards back, take new cards.
            unrevealedCards.forEach(c => deck.push(c.character));
            shuffleDeck(deck);
            actor.cards = actor.cards.map(c => c.isRevealed ? c : { character: deck.pop(), isRevealed: false });
            break;
    }
    gameData.actionLog.push(`The action was successful.`);
    return endTurn(gameData);
};

export const performAction = (gameData, actionType, actingPlayerUid, targetPlayerUid = null) => {
  let newGameData = JSON.parse(JSON.stringify(gameData));
  const { players, currentPlayerIndex } = newGameData;
  const actingPlayer = getPlayer(players, actingPlayerUid);
  if (!actingPlayer || players[currentPlayerIndex].uid !== actingPlayerUid) throw new Error("It's not your turn!");
  
  if (actionType === 'income') {
    actingPlayer.coins++; newGameData.actionLog.push(`${actingPlayer.name} takes Income.`);
    return endTurn(newGameData);
  }
  if (actionType === 'coup') {
    if(actingPlayer.coins < 7) throw new Error("Not enough coins for Coup!");
    const target = getPlayer(players, targetPlayerUid);
    actingPlayer.coins -= 7;
    loseInfluence(target);
    newGameData.actionLog.push(`${actingPlayer.name} launches a Coup against ${target.name}.`);
    return endTurn(newGameData);
  }
  
  newGameData.pendingAction = {
      actionType, actorUid: actingPlayerUid, targetUid: targetPlayerUid,
      responses: {}, isChallengingBlock: false,
  };
  newGameData.actionLog.push(`${actingPlayer.name} is attempting to use ${actionType}.`);
  return newGameData;
};

export const handleResponse = (gameData, responseType, respondingPlayerUid, blockCharacter = null) => {
    let newGameData = JSON.parse(JSON.stringify(gameData));
    const { players, pendingAction } = newGameData;
    const respondingPlayer = getPlayer(players, respondingPlayerUid);
    const actor = getPlayer(players, pendingAction.actorUid);
    const blocker = pendingAction.blocker ? getPlayer(players, pendingAction.blocker.uid) : null;

    if (!pendingAction || !respondingPlayer) throw new Error("Invalid response state.");
    pendingAction.responses[respondingPlayerUid] = responseType;

    if (responseType === 'challenge') {
        const personBeingChallenged = blocker || actor;
        const claim = blocker ? pendingAction.blocker.character : ACTION_CHARACTER_MAP[pendingAction.actionType];
        newGameData.actionLog.push(`${respondingPlayer.name} challenges ${personBeingChallenged.name}'s claim of ${claim}!`);
        const hasCard = personBeingChallenged.cards.some(c => !c.isRevealed && c.character === claim);

        if (hasCard) { // Challenge Failed
            const loser = respondingPlayer;
            newGameData.actionLog.push(`${personBeingChallenged.name} reveals a ${claim}. The challenge fails!`);
            loseInfluence(loser);
            if (blocker) {
                newGameData.actionLog.push(`${blocker.name}'s block is successful.`);
                return endTurn(newGameData);
            } else {
                return resolveAction(newGameData);
            }
        } else { // Challenge Succeeded
            const loser = personBeingChallenged;
            newGameData.actionLog.push(`${loser.name} was bluffing! The challenge succeeds!`);
            loseInfluence(loser);
            if (blocker) {
                return resolveAction(newGameData);
            } else {
                return endTurn(newGameData);
            }
        }
    }
    
    if (responseType === 'block') {
        pendingAction.blocker = { uid: respondingPlayerUid, character: blockCharacter, blockerName: respondingPlayer.name };
        newGameData.actionLog.push(`${respondingPlayer.name} claims to have a ${blockCharacter} to block the action.`);
        pendingAction.responses = {}; // Reset responses for the challenge-the-block phase
        return newGameData;
    }
    
    const activePlayers = players.filter(p => !p.isOut);
    const playersWhoCanRespond = blocker 
        ? activePlayers.filter(p => p.uid !== blocker.uid) 
        : activePlayers.filter(p => p.uid !== actor.uid);

    const allAllowed = playersWhoCanRespond.every(p => pendingAction.responses[p.uid] === 'allow');
    
    if (allAllowed) {
        if (blocker) {
            newGameData.actionLog.push(`The block is successful.`);
            return endTurn(newGameData);
        } else {
            return resolveAction(newGameData);
        }
    }
    
    return newGameData;
}

