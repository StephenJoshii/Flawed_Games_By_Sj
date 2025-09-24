import { useState, useCallback } from 'react';
import { initializeNewGame } from '../logic/state';
import { performAction } from '../logic/actions';
import { handleResponse } from '../logic/responses';

// This custom hook manages the game state and serves as the bridge
// between the React UI and the pure game logic.
export function useCoupLogic() {
  // The entire game state is held in a single object.
  const [gameData, setGameData] = useState(null);

  // Initializes a new game for the host.
  const createNewGame = useCallback((hostUser) => {
    const initialState = initializeNewGame(hostUser);
    setGameData(initialState);
    return initialState; // Returns the state for Firestore
  }, []);

  // A generic function for players to take an action on their turn.
  const takeAction = useCallback((actionType, targetUid = null) => {
    if (!gameData) return;
    const actorUid = gameData.players[gameData.currentPlayerIndex].uid;
    const newGameData = performAction(gameData, actionType, actorUid, targetUid);
    setGameData(newGameData);
    return newGameData; // Returns the new state for Firestore
  }, [gameData]);

  // A generic function for players to respond to a pending action.
  const respondToAction = useCallback((responseType, blockCharacter = null) => {
    if (!gameData || !gameData.pendingAction) return;
    // In a real app, the responder's UID would come from the user session.
    // For our current setup, we need to determine the responder.
    const actorUid = gameData.pendingAction.actorUid;
    const responder = gameData.players.find(p => p.uid !== actorUid && !p.isOut);
    if (!responder) return;

    const newGameData = handleResponse(gameData, responseType, responder.uid, blockCharacter);
    setGameData(newGameData);
    return newGameData; // Returns the new state for Firestore
  }, [gameData]);

  // Exposes the game state and the functions to interact with it.
  return {
    gameData,
    setGameData, // Allows the live listener to update the game state
    createNewGame,
    takeAction,
    respondToAction,
  };
}

