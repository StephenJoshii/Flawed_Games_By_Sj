import { useState, useCallback } from 'react';
import { initializeNewGame } from '../logic/state.js';
import { performAction as performActionLogic } from '../logic/action.js';
import { handleResponse as handleResponseLogic } from '../logic/response.js';

// This custom hook manages the game state and serves as the bridge
// between the React UI and the pure game logic modules.
export function useCoupLogic() {
  const [gameData, setGameData] = useState(null);

  // Initializes a new game state for the host.
  const createNewGame = useCallback((hostUser) => {
    const initialState = initializeNewGame(hostUser);
    setGameData(initialState);
    return initialState; // Returns the state for Firestore
  }, []);

  // A generic function for players to take an action on their turn.
  const takeAction = useCallback((actionType, targetUid = null) => {
    if (!gameData) return null;
    const actorUid = gameData.players[gameData.currentPlayerIndex].uid;
    const newGameData = performActionLogic(gameData, actionType, actorUid, targetUid);
    setGameData(newGameData);
    return newGameData;
  }, [gameData]);

  // A generic function for players to respond to a pending action.
  const respondToAction = useCallback((responseType, responderUid, blockCharacter = null) => {
    if (!gameData || !gameData.pendingAction) return null;
    const newGameData = handleResponseLogic(gameData, responseType, responderUid, blockCharacter);
    setGameData(newGameData);
    return newGameData;
  }, [gameData]);

  return {
    gameData,
    setGameData, // Allows the live listener to update the game state
    createNewGame,
    takeAction,
    respondToAction,
  };
}

