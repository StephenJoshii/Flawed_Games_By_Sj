import { ACTIONS, ACTION_CHARACTER_MAP } from './state.js';
import { 
  getPlayer, 
  loseInfluence, 
  returnAndShuffleCard, 
  advanceTurn, 
  resolveActionSuccess, 
  resolveActionBlocked 
} from './action.js';

// --- Response Handling Logic ---

export function handleResponse(gameData, responseType, respondingPlayerUid, blockCharacter = null) {
  const newGameData = JSON.parse(JSON.stringify(gameData));
  const { pendingAction } = newGameData;
  
  if (!pendingAction) {
    throw new Error("No pending action to respond to!");
  }
  
  const responder = getPlayer(newGameData.players, respondingPlayerUid);
  if (!responder || responder.isOut) {
    throw new Error("Invalid responder!");
  }
  
  // Check if this player can respond
  if (!pendingAction.awaitingResponseFrom?.includes(respondingPlayerUid)) {
    throw new Error("You cannot respond to this action!");
  }
  
  const action = ACTIONS[pendingAction.actionType];
  const actor = getPlayer(newGameData.players, pendingAction.actorUid);
  
  // Handle PASS response
  if (responseType === 'pass') {
    pendingAction.responses[respondingPlayerUid] = 'pass';
    pendingAction.awaitingResponseFrom = pendingAction.awaitingResponseFrom.filter(
      uid => uid !== respondingPlayerUid
    );
    
    // Check if everyone has passed
    if (pendingAction.awaitingResponseFrom.length === 0) {
      if (pendingAction.type === 'awaiting_response') {
        // Action succeeds
        resolveActionSuccess(newGameData);
      } else if (pendingAction.type === 'awaiting_block_response') {
        // Block succeeds
        resolveActionBlocked(newGameData);
      }
    }
    
    return newGameData;
  }
  
  // Handle CHALLENGE response
  if (responseType === 'challenge') {
    const challengedPlayer = pendingAction.type === 'awaiting_block_response' 
      ? getPlayer(newGameData.players, pendingAction.blockingPlayerUid)
      : actor;
    
    const claimedCharacter = pendingAction.type === 'awaiting_block_response'
      ? pendingAction.blockingCharacter
      : ACTION_CHARACTER_MAP[pendingAction.actionType];
    
    newGameData.actionLog.push(
      `⚔️ ${responder.name} challenges ${challengedPlayer.name}'s claim of ${claimedCharacter}!`
    );
    
    // Check if challenged player has the card
    const hasCard = challengedPlayer.cards.some(
      c => !c.isRevealed && c.character === claimedCharacter
    );
    
    if (hasCard) {
      // Challenge FAILED - challenger loses influence
      newGameData.actionLog.push(
        `✅ ${challengedPlayer.name} reveals ${claimedCharacter}! Challenge failed!`
      );
      loseInfluence(responder, newGameData);
      returnAndShuffleCard(challengedPlayer, claimedCharacter, newGameData);
      
      // Resolve based on what was challenged
      if (pendingAction.type === 'awaiting_block_response') {
        // Block succeeds
        resolveActionBlocked(newGameData);
      } else {
        // Action succeeds
        resolveActionSuccess(newGameData);
      }
    } else {
      // Challenge SUCCEEDED - challenged player was bluffing
      newGameData.actionLog.push(
        `❌ ${challengedPlayer.name} was bluffing! Challenge succeeded!`
      );
      loseInfluence(challengedPlayer, newGameData);
      
      // Resolve based on what was challenged
      if (pendingAction.type === 'awaiting_block_response') {
        // Block fails, action succeeds
        resolveActionSuccess(newGameData);
      } else {
        // Action fails
        const { actorUid, resolvedCost } = pendingAction;
        const failedActor = getPlayer(newGameData.players, actorUid);
        
        // Refund if action had cost
        if (resolvedCost > 0) {
          failedActor.coins += resolvedCost;
          newGameData.actionLog.push(
            `${failedActor.name} gets refunded ${resolvedCost} coin${resolvedCost !== 1 ? 's' : ''}.`
          );
        }
        
        advanceTurn(newGameData);
      }
    }
    
    return newGameData;
  }
  
  // Handle BLOCK response
  if (responseType === 'block') {
    if (!action.canBeBlocked) {
      throw new Error("This action cannot be blocked!");
    }
    
    if (!blockCharacter) {
      throw new Error("You must specify which character you're blocking with!");
    }
    
    // Verify this character can block this action
    if (!action.blockedBy?.includes(blockCharacter)) {
      throw new Error(`${blockCharacter} cannot block ${action.name}!`);
    }
    
    // Only the target can block targeted actions (except Foreign Aid which anyone can block)
    if (pendingAction.targetUid && pendingAction.actionType !== 'foreign_aid') {
      if (respondingPlayerUid !== pendingAction.targetUid) {
        throw new Error("Only the target can block this action!");
      }
    }
    
    newGameData.actionLog.push(
      `🛡️ ${responder.name} claims to block with ${blockCharacter}!`
    );
    
    // Set up block challenge phase
    // Only the actor can challenge the block
    pendingAction.type = 'awaiting_block_response';
    pendingAction.blockingPlayerUid = respondingPlayerUid;
    pendingAction.blockingCharacter = blockCharacter;
    pendingAction.awaitingResponseFrom = [pendingAction.actorUid];
    pendingAction.responses = {};
    
    return newGameData;
  }
  
  throw new Error("Invalid response type!");
}

