import { CHARACTERS, ACTIONS, ACTION_CHARACTER_MAP, shuffleDeck } from './state.js';

// --- Helper Functions ---

const getPlayer = (players, uid) => players.find(p => p.uid === uid);

const getActivePlayers = (players) => players.filter(p => !p.isOut);

const loseInfluence = (player, gameData, specificCard = null) => {
  let cardToReveal;
  
  if (specificCard) {
    // Player chooses which card to lose
    cardToReveal = player.cards.find(c => !c.isRevealed && c.character === specificCard);
    if (!cardToReveal) {
      // Fallback if specified card not found
      cardToReveal = player.cards.find(c => !c.isRevealed);
    }
  } else {
    // Auto-select first unrevealed card
    cardToReveal = player.cards.find(c => !c.isRevealed);
  }
  
  if (cardToReveal) {
    cardToReveal.isRevealed = true;
    gameData.actionLog.push(`${player.name} reveals ${CHARACTERS[cardToReveal.character].name} and loses influence.`);
  }
  
  // Check if player is eliminated
  if (player.cards.every(c => c.isRevealed)) {
    player.isOut = true;
    gameData.actionLog.push(`💀 ${player.name} has been eliminated!`);
  }
};

const returnAndShuffleCard = (player, characterToReturn, gameData) => {
  // Return a card to the deck and draw a new one
  const cardIndex = player.cards.findIndex(c => !c.isRevealed && c.character === characterToReturn);
  if (cardIndex !== -1 && gameData.deck.length > 0) {
    gameData.deck.push(characterToReturn);
    gameData.deck = shuffleDeck(gameData.deck);
    player.cards[cardIndex].character = gameData.deck.pop();
    gameData.actionLog.push(`${player.name} shuffles a card back into the deck and draws a new one.`);
  }
};

const advanceTurn = (gameData) => {
  const activePlayers = getActivePlayers(gameData.players);
  
  // Check for game over
  if (activePlayers.length === 1) {
    gameData.status = "finished";
    gameData.winner = activePlayers[0];
    gameData.actionLog.push(`🎉 ${activePlayers[0].name} wins the game!`);
    return;
  }
  
  if (activePlayers.length === 0) {
    gameData.status = "finished";
    gameData.winner = null;
    gameData.actionLog.push(`Game ends in a draw!`);
    return;
  }
  
  // Find next active player
  let nextIdx = (gameData.currentPlayerIndex + 1) % gameData.players.length;
  let safetyCounter = 0;
  
  while (gameData.players[nextIdx].isOut && safetyCounter < gameData.players.length) {
    nextIdx = (nextIdx + 1) % gameData.players.length;
    safetyCounter++;
  }
  
  gameData.currentPlayerIndex = nextIdx;
  gameData.pendingAction = null;
  gameData.actionLog.push(`--- ${gameData.players[nextIdx].name}'s turn ---`);
};

const resolveActionSuccess = (gameData) => {
  const { actionType, actorUid, targetUid } = gameData.pendingAction;
  const actor = getPlayer(gameData.players, actorUid);
  const target = targetUid ? getPlayer(gameData.players, targetUid) : null;
  
  switch (actionType) {
    case 'income':
      actor.coins += 1;
      gameData.actionLog.push(`${actor.name} takes 1 coin (Income). Total: ${actor.coins}`);
      break;
      
    case 'foreign_aid':
      actor.coins += 2;
      gameData.actionLog.push(`${actor.name} takes 2 coins (Foreign Aid). Total: ${actor.coins}`);
      break;
      
    case 'coup':
      // Coins already deducted when action was initiated
      if (target) {
        gameData.actionLog.push(`${actor.name} launches a Coup against ${target.name}!`);
        loseInfluence(target, gameData);
      }
      break;
      
    case 'tax':
      actor.coins += 3;
      gameData.actionLog.push(`${actor.name} takes 3 coins (Tax). Total: ${actor.coins}`);
      break;
      
    case 'assassinate':
      // Coins already deducted when action was initiated
      if (target) {
        gameData.actionLog.push(`${actor.name} assassinates ${target.name}!`);
        loseInfluence(target, gameData);
      }
      break;
      
    case 'steal':
      if (target) {
        const stolen = Math.min(2, target.coins);
        if (stolen > 0) {
          actor.coins += stolen;
          target.coins -= stolen;
          gameData.actionLog.push(`${actor.name} steals ${stolen} coin${stolen !== 1 ? 's' : ''} from ${target.name}.`);
        } else {
          gameData.actionLog.push(`${actor.name} attempts to steal from ${target.name}, but they have no coins!`);
        }
      }
      break;
      
    case 'exchange':
      // Draw 2 cards from deck
      if (gameData.deck.length >= 2) {
        const drawn = [gameData.deck.pop(), gameData.deck.pop()];
        const unrevealedCards = actor.cards.filter(c => !c.isRevealed);
        const allCards = [...unrevealedCards.map(c => c.character), ...drawn];
        
        // For now, auto-keep first cards and return the rest
        // TODO: In a full implementation, this would wait for player choice
        const toKeep = allCards.slice(0, unrevealedCards.length);
        const toReturn = allCards.slice(unrevealedCards.length);
        
        // Update player's cards
        let cardIndex = 0;
        actor.cards = actor.cards.map(c => 
          c.isRevealed ? c : { character: toKeep[cardIndex++], isRevealed: false }
        );
        
        // Return cards to deck and shuffle
        toReturn.forEach(char => gameData.deck.push(char));
        gameData.deck = shuffleDeck(gameData.deck);
        
        gameData.actionLog.push(`${actor.name} exchanges cards with the deck.`);
      }
      break;
  }
  
  advanceTurn(gameData);
};

const resolveActionBlocked = (gameData) => {
  const { actionType, actorUid, blockingPlayerUid, resolvedCost } = gameData.pendingAction;
  const actor = getPlayer(gameData.players, actorUid);
  const blocker = getPlayer(gameData.players, blockingPlayerUid);
  
  // Refund cost if action was blocked (only for paid actions)
  if (resolvedCost > 0) {
    actor.coins += resolvedCost;
    gameData.actionLog.push(`${actor.name} gets refunded ${resolvedCost} coin${resolvedCost !== 1 ? 's' : ''}.`);
  }
  
  gameData.actionLog.push(`${blocker.name}'s block succeeds. ${ACTIONS[actionType].name} is blocked!`);
  advanceTurn(gameData);
};

// --- Main Action Logic ---

export function performAction(gameData, actionType, actingPlayerUid, targetPlayerUid = null) {
  const newGameData = JSON.parse(JSON.stringify(gameData));
  const actor = getPlayer(newGameData.players, actingPlayerUid);
  const action = ACTIONS[actionType];
  
  // Validation
  if (!actor) {
    throw new Error("Player not found!");
  }
  
  if (newGameData.players[newGameData.currentPlayerIndex].uid !== actingPlayerUid) {
    throw new Error("It's not your turn!");
  }
  
  if (actor.isOut) {
    throw new Error("You are out of the game!");
  }
  
  if (!action) {
    throw new Error("Invalid action type!");
  }
  
  // Check if player has 10+ coins (must coup)
  if (actor.coins >= 10 && actionType !== 'coup') {
    throw new Error("You have 10 or more coins and must Coup!");
  }
  
  // Check cost
  if (actor.coins < action.cost) {
    throw new Error(`Not enough coins! Need ${action.cost}, have ${actor.coins}`);
  }
  
  // Check target requirement
  if (action.requiresTarget && !targetPlayerUid) {
    throw new Error("This action requires a target!");
  }
  
  if (action.requiresTarget) {
    const target = getPlayer(newGameData.players, targetPlayerUid);
    if (!target || target.isOut) {
      throw new Error("Invalid target!");
    }
    if (target.uid === actingPlayerUid) {
      throw new Error("You cannot target yourself!");
    }
  }
  
  // Deduct cost immediately
  let costPaid = 0;
  if (action.cost > 0) {
    actor.coins -= action.cost;
    costPaid = action.cost;
  }
  
  // Actions that can't be challenged or blocked happen immediately
  if (!action.canBeChallenged && !action.canBeBlocked) {
    newGameData.pendingAction = {
      type: 'resolving',
      actionType,
      actorUid: actingPlayerUid,
      targetUid: targetPlayerUid,
      resolvedCost: costPaid,
    };
    resolveActionSuccess(newGameData);
    return newGameData;
  }
  
  // Set up pending action for responses
  const activePlayers = getActivePlayers(newGameData.players);
  const otherPlayers = activePlayers.filter(p => p.uid !== actingPlayerUid);
  
  newGameData.pendingAction = {
    type: 'awaiting_response',
    actionType,
    actorUid: actingPlayerUid,
    targetUid: targetPlayerUid,
    awaitingResponseFrom: otherPlayers.map(p => p.uid),
    responses: {},
    resolvedCost: costPaid,
  };
  
  newGameData.actionLog.push(`${actor.name} attempts ${action.name}${targetPlayerUid ? ` on ${getPlayer(newGameData.players, targetPlayerUid).name}` : ''}.`);
  
  return newGameData;
}

export { 
  getPlayer, 
  getActivePlayers, 
  loseInfluence, 
  returnAndShuffleCard, 
  advanceTurn, 
  resolveActionSuccess, 
  resolveActionBlocked 
};

