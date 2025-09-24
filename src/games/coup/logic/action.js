import { CHARACTERS, ACTION_CHARACTER_MAP } from './state.js';

// --- Helper Functions ---
// These are pure utility functions that operate on the game state.

const getPlayer = (players, uid) => players.find(p => p.uid === uid);

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
    if (activePlayers.length <= 1) { // Game ends when 1 or 0 players are left
        gameData.status = "finished";
        gameData.winner = activePlayers[0] || null;
        gameData.actionLog.push(activePlayers.length === 1 ? `${activePlayers[0].name} is the winner!` : "The game is a draw!");
    } else {
        let nextIdx = (gameData.currentPlayerIndex + 1) % gameData.players.length;
        // Safety check to prevent infinite loops if all other players are out.
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

// --- Main Action Logic ---

// This is the primary function for handling all player actions.
// It takes the current game state and an action, then returns the new state.
export function performAction(gameData, actionType, actingPlayerUid, targetPlayerUid = null) {
  const newGameData = JSON.parse(JSON.stringify(gameData));
  const actor = getPlayer(newGameData.players, actingPlayerUid);
  
  if (!actor || newGameData.players[newGameData.currentPlayerIndex].uid !== actingPlayerUid) {
    throw new Error("It's not your turn!");
  }
  if (actor.isOut) {
    throw new Error("You are out of the game!");
  }

  // Handle actions that cannot be challenged (Income, Coup)
  if (actionType === 'income') {
    actor.coins++;
    newGameData.actionLog.push(`${actor.name} takes Income.`);
    endTurn(newGameData);
    return newGameData;
  }

  if (actionType === 'coup') {
    if (actor.coins < 7) throw new Error("Not enough coins for Coup!");
    const target = getPlayer(newGameData.players, targetPlayerUid);
    if (!target) throw new Error("Target not found for Coup.");
    
    actor.coins -= 7;
    newGameData.actionLog.push(`${actor.name} launches a Coup against ${target.name}.`);
    loseInfluence(target, newGameData);
    endTurn(newGameData);
    return newGameData;
  }
  
  // For actions that CAN be challenged, set up a pending action.
  newGameData.pendingAction = {
      type: 'action',
      actionType,
      actorUid: actingPlayerUid,
      targetUid: targetPlayerUid,
      responses: {},
  };
  newGameData.actionLog.push(`${actor.name} is attempting to use ${actionType}.`);
  return newGameData;
}
