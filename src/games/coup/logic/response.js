import { CHARACTERS, ACTION_CHARACTER_MAP } from './state.js';

// --- Helper Functions ---
// These are duplicated from actions.js for clarity in this step.
// In a final refactor, they could be moved to a shared helpers.js file.

const getPlayer = (players, uid) => players.find(p => p.uid === uid);

const shuffleDeck = (deck) => {
  for (let i = deck.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [deck[i], deck[j]] = [deck[j], deck[i]];
  }
  return deck;
};

const loseInfluence = (player, gameData) => {
    const cardToLose = player.cards.find(c => !c.isRevealed);
    if (cardToLose) {
      cardToLose.isRevealed = true;
      gameData.actionLog.push(`${player.name} reveals a ${CHARACTERS[cardToLose.character].name}.`);
    }
    if (player.cards.filter(c => !c.isRevealed).length === 0) {
      player.isOut = true;
      gameData.actionLog.push(`${player.name} has been eliminated!`);
    }
};

const endTurn = (gameData) => {
    const activePlayers = gameData.players.filter(p => !p.isOut);
    if (activePlayers.length <= 1) {
        gameData.status = "finished";
        gameData.winner = activePlayers[0] || null;
        gameData.actionLog.push(activePlayers.length === 1 ? `${activePlayers[0].name} is the winner!` : "The game is a draw!");
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
};

const resolveAction = (gameData) => {
    const { players, pendingAction, deck } = gameData;
    const actor = getPlayer(players, pendingAction.actorUid);
    const target = getPlayer(players, pendingAction.targetUid);
    gameData.actionLog.push(`The action "${pendingAction.actionType}" is successful.`);
    switch(pendingAction.actionType) {
        case 'tax': actor.coins += 3; break;
        case 'foreign_aid': actor.coins += 2; break;
        case 'steal': const stolen = Math.min(2, target.coins); actor.coins += stolen; target.coins -= stolen; break;
        case 'assassinate': loseInfluence(target, gameData); break;
        case 'exchange': {
            const unrevealed = actor.cards.filter(c => !c.isRevealed);
            const drawn = [deck.pop(), deck.pop()].filter(Boolean);
            const hand = [...unrevealed.map(c => c.character), ...drawn];
            const toKeep = hand.slice(0, unrevealed.length);
            const toReturn = hand.slice(unrevealed.length);
            toReturn.forEach(c => deck.push(c));
            shuffleDeck(deck);
            let keepIdx = 0;
            actor.cards = actor.cards.map(c => c.isRevealed ? c : { character: toKeep[keepIdx++], isRevealed: false });
            break;
        }
    }
    endTurn(gameData);
};


// --- Main Response Logic ---

export function handleResponse(gameData, responseType, respondingPlayerUid, blockCharacter = null) {
    const newGameData = JSON.parse(JSON.stringify(gameData));
    const { players, pendingAction } = newGameData;
    const respondingPlayer = getPlayer(players, respondingPlayerUid);
    const actor = getPlayer(players, pendingAction.actorUid);
    const blocker = pendingAction.blocker ? getPlayer(players, pendingAction.blocker.uid) : null;

    if (!pendingAction || !respondingPlayer) {
        throw new Error("Invalid response state.");
    }
    pendingAction.responses[respondingPlayerUid] = responseType;

    if (responseType === 'challenge') {
        const personChallenged = blocker || actor;
        const claim = blocker ? pendingAction.blocker.character : ACTION_CHARACTER_MAP[pendingAction.actionType];
        newGameData.actionLog.push(`${respondingPlayer.name} challenges ${personChallenged.name}'s claim of ${claim}!`);
        const hasCard = personChallenged.cards.some(c => !c.isRevealed && c.character === claim);
        
        if (hasCard) { // Challenge Failed
            newGameData.actionLog.push(`${personChallenged.name} reveals a ${CHARACTERS[claim].name}. The challenge fails!`);
            loseInfluence(respondingPlayer, newGameData);
            if (blocker) {
                endTurn(newGameData); // Block succeeds
            } else {
                resolveAction(newGameData); // Action succeeds
            }
        } else { // Challenge Succeeded
            newGameData.actionLog.push(`${personChallenged.name} was bluffing! The challenge succeeds!`);
            loseInfluence(personChallenged, newGameData);
            if (blocker) {
                resolveAction(newGameData); // Block fails, action succeeds
            } else {
                endTurn(newGameData); // Action fails
            }
        }
        return newGameData;
    }
    
    if (responseType === 'block') {
        pendingAction.type = 'block';
        pendingAction.blocker = { uid: respondingPlayerUid, character: blockCharacter, blockerName: respondingPlayer.name };
        newGameData.actionLog.push(`${respondingPlayer.name} claims to block with a ${blockCharacter}.`);
        pendingAction.responses = {}; // Reset responses for the challenge-the-block phase
        return newGameData;
    }
    
    // Check if all players have responded with 'allow'
    const activePlayers = players.filter(p => !p.isOut);
    const playersWhoCanRespond = blocker ? [actor] : activePlayers.filter(p => p.uid !== actor.uid);

    const allAllowed = playersWhoCanRespond.every(p => pendingAction.responses[p.uid] === 'allow');
    
    if (allAllowed) {
        if (blocker) {
            newGameData.actionLog.push(`The block is successful.`);
            endTurn(newGameData);
        } else {
            resolveAction(newGameData);
        }
    }
    
    return newGameData;
}
