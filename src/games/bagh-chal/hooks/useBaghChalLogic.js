import { useState, useCallback, useMemo, useEffect } from 'react';

// Defines constants for piece types and game states.
const PIECES = { TIGER: 'TIGER', GOAT: 'GOAT', EMPTY: null };
const GAME_PHASES = { PLACING: 'PLACING', MOVING: 'MOVING' };
const TURN = { GOAT: 'GOAT', TIGER: 'TIGER' };
const GAME_STATUS = { PLAYING: 'PLAYING', TIGER_WIN: 'TIGER_WIN', GOAT_WIN: 'GOAT_WIN' };

// The initial board setup with 4 tigers at the corners.
const getInitialBoard = () => {
  const board = Array(5).fill(null).map(() => Array(5).fill(PIECES.EMPTY));
  board[0][0] = PIECES.TIGER;
  board[0][4] = PIECES.TIGER;
  board[4][0] = PIECES.TIGER;
  board[4][4] = PIECES.TIGER;
  return board;
};

const ADJACENCY_MAP = [
  /* 0,0 */ [[0,1], [1,0], [1,1]],
  /* 0,1 */ [[0,0], [0,2], [1,1]],
  /* 0,2 */ [[0,1], [0,3], [1,1], [1,2], [1,3]],
  /* 0,3 */ [[0,2], [0,4], [1,3]],
  /* 0,4 */ [[0,3], [1,3], [1,4]],
  /* 1,0 */ [[0,0], [0,1], [1,1], [2,0], [2,1]],
  /* 1,1 */ [[0,0], [0,1], [0,2], [1,0], [1,2], [2,0], [2,1], [2,2]],
  /* 1,2 */ [[0,2], [1,1], [1,3], [2,2]],
  /* 1,3 */ [[0,2], [0,3], [0,4], [1,2], [1,4], [2,2], [2,3], [2,4]],
  /* 1,4 */ [[0,4], [1,3], [2,3], [2,4]],
  /* 2,0 */ [[1,0], [1,1], [2,1], [3,0], [3,1]],
  /* 2,1 */ [[1,1], [2,0], [2,2], [3,1]],
  /* 2,2 */ [[1,1], [1,2], [1,3], [2,1], [2,3], [3,1], [3,2], [3,3]],
  /* 2,3 */ [[1,3], [2,2], [2,4], [3,3]],
  /* 2,4 */ [[1,3], [1,4], [2,3], [3,3], [3,4]],
  /* 3,0 */ [[2,0], [2,1], [3,1], [4,0], [4,1]],
  /* 3,1 */ [[2,1], [3,0], [3,2], [4,1]],
  /* 3,2 */ [[2,2], [3,1], [3,3], [4,2]],
  /* 3,3 */ [[2,2], [2,3], [2,4], [3,2], [3,4], [4,2], [4,3], [4,4]],
  /* 3,4 */ [[2,4], [3,3], [4,3], [4,4]],
  /* 4,0 */ [[3,0], [3,1], [4,1]],
  /* 4,1 */ [[3,0], [4,0], [4,2], [3,1]],
  /* 4,2 */ [[4,1], [4,3], [3,1], [3,2], [3,3]],
  /* 4,3 */ [[4,2], [4,4], [3,3]],
  /* 4,4 */ [[3,4], [4,3], [3,3]],
];

const INITIAL_STATE = {
  board: getInitialBoard(),
  turn: TURN.GOAT,
  phase: GAME_PHASES.PLACING,
  goatsToPlace: 20,
  goatsCaptured: 0,
  selectedPiece: null,
  status: GAME_STATUS.PLAYING,
};

// This custom hook encapsulates the entire logic for the Bagh Chal game.
export function useBaghChalLogic({ gameMode, playerPiece }) {
  const [gameState, setGameState] = useState(INITIAL_STATE);
  const { board, turn, phase, goatsToPlace, goatsCaptured, selectedPiece, status } = gameState;

  // --- Utility Functions ---

  const getTigerMoves = useCallback((r, c, currentBoard) => {
    const moves = [];
    const captures = [];
    ADJACENCY_MAP[r * 5 + c].forEach(([adjR, adjC]) => {
      if (currentBoard[adjR][adjC] === PIECES.EMPTY) {
        moves.push({ from: { r, c }, to: { r: adjR, c: adjC } });
      } else if (currentBoard[adjR][adjC] === PIECES.GOAT) {
        const jumpR = adjR + (adjR - r);
        const jumpC = adjC + (adjC - c);
        if (jumpR >= 0 && jumpR < 5 && jumpC >= 0 && jumpC < 5 && currentBoard[jumpR][jumpC] === PIECES.EMPTY) {
          captures.push({ from: { r, c }, to: { r: jumpR, c: jumpC }, captured: { r: adjR, c: adjC } });
        }
      }
    });
    return { moves, captures };
  }, []);

  const checkGoatWin = useCallback((currentBoard) => {
    for (let r = 0; r < 5; r++) for (let c = 0; c < 5; c++) {
      if (currentBoard[r][c] === PIECES.TIGER) {
        const { moves, captures } = getTigerMoves(r, c, currentBoard);
        if (moves.length > 0 || captures.length > 0) return false;
      }
    }
    return true;
  }, [getTigerMoves]);

  // --- AI Logic ---

  const makeAIMove = useCallback(() => {
    setGameState(prev => {
      if (prev.status !== GAME_STATUS.PLAYING) return prev;
      
      let bestMove = null;

      if (prev.turn === TURN.TIGER) {
        let allCaptures = [], allSimpleMoves = [];
        for (let r = 0; r < 5; r++) for (let c = 0; c < 5; c++) if (prev.board[r][c] === PIECES.TIGER) {
          const { moves, captures } = getTigerMoves(r, c, prev.board);
          allCaptures.push(...captures); allSimpleMoves.push(...moves);
        }
        
        if (allCaptures.length > 0) {
          bestMove = allCaptures[Math.floor(Math.random() * allCaptures.length)];
        } else if (allSimpleMoves.length > 0) {
          // Find the move that leads to the greatest number of future moves (mobility)
          let bestMobility = -1;
          for (const move of allSimpleMoves) {
              const hypotheticalBoard = prev.board.map(row => [...row]);
              hypotheticalBoard[move.to.r][move.to.c] = PIECES.TIGER;
              hypotheticalBoard[move.from.r][move.from.c] = PIECES.EMPTY;
              const { moves: futureMoves } = getTigerMoves(move.to.r, move.to.c, hypotheticalBoard);
              if (futureMoves.length > bestMobility) {
                  bestMobility = futureMoves.length;
                  bestMove = move;
              }
          }
        }
      } else { // AI Goat Logic
        if (prev.phase === GAME_PHASES.PLACING) {
          const emptySpots = [];
          for(let r=0; r<5; r++) for(let c=0; c<5; c++) if(prev.board[r][c] === PIECES.EMPTY) emptySpots.push({r,c});
          bestMove = { to: emptySpots[Math.floor(Math.random() * emptySpots.length)] };
        } else {
          const allGoatMoves = [];
          for (let r = 0; r < 5; r++) for (let c = 0; c < 5; c++) if (prev.board[r][c] === PIECES.GOAT) {
            ADJACENCY_MAP[r*5+c].forEach(([adjR, adjC]) => { if(prev.board[adjR][adjC] === PIECES.EMPTY) allGoatMoves.push({from: {r,c}, to: {r: adjR, c: adjC}}); });
          }
          if (allGoatMoves.length > 0) bestMove = allGoatMoves[Math.floor(Math.random() * allGoatMoves.length)];
        }
      }

      if (bestMove) {
        const newBoard = prev.board.map(row => [...row]);
        let nextState = { ...prev };

        if (prev.turn === TURN.TIGER) {
            newBoard[bestMove.to.r][bestMove.to.c] = PIECES.TIGER;
            newBoard[bestMove.from.r][bestMove.from.c] = PIECES.EMPTY;
            if (bestMove.captured) {
              newBoard[bestMove.captured.r][bestMove.captured.c] = PIECES.EMPTY;
              nextState.goatsCaptured++;
            }
        } else { // AI Goat move
            if (prev.phase === GAME_PHASES.PLACING) {
                newBoard[bestMove.to.r][bestMove.to.c] = PIECES.GOAT;
                nextState.goatsToPlace--;
            } else {
                newBoard[bestMove.to.r][bestMove.to.c] = PIECES.GOAT;
                newBoard[bestMove.from.r][bestMove.from.c] = PIECES.EMPTY;
            }
        }
        
        nextState.board = newBoard;
        if (nextState.goatsToPlace === 0) nextState.phase = GAME_PHASES.MOVING;
        if (checkGoatWin(nextState.board)) nextState.status = GAME_STATUS.GOAT_WIN;
        if (nextState.goatsCaptured >= 10) nextState.status = GAME_STATUS.TIGER_WIN;
        nextState.turn = prev.turn === TURN.TIGER ? TURN.GOAT : TURN.TIGER;
        nextState.selectedPiece = null;
        return nextState;
      }
      
      return prev; // No move found
    });
  }, [getTigerMoves, checkGoatWin]);
  
  // This effect correctly triggers the AI move when it's their turn.
  useEffect(() => {
    if (gameMode === 'AI' && turn !== playerPiece && status === GAME_STATUS.PLAYING) {
      setTimeout(() => makeAIMove(), 1000);
    }
  }, [turn, status, gameMode, playerPiece, makeAIMove]);

  // --- Player Interaction ---

  const handleCellClick = useCallback((r, c) => {
    if (status !== GAME_STATUS.PLAYING || (gameMode === 'AI' && turn !== playerPiece)) return;

    setGameState(prev => {
      let nextState = { ...prev };
      const newBoard = prev.board.map(row => [...row]);

      // Handle Goat Placement
      if (prev.phase === GAME_PHASES.PLACING && prev.turn === TURN.GOAT) {
        if (prev.board[r][c] === PIECES.EMPTY) {
          newBoard[r][c] = PIECES.GOAT;
          nextState.board = newBoard;
          nextState.goatsToPlace--;
          if (nextState.goatsToPlace === 0) nextState.phase = GAME_PHASES.MOVING;
          nextState.turn = TURN.TIGER;
        }
        return nextState;
      }

      // Handle piece selection
      if (!prev.selectedPiece) {
        if (prev.board[r][c] === prev.turn) {
          nextState.selectedPiece = { r, c };
        }
        return nextState;
      }
      
      // Handle piece deselection
      if (prev.selectedPiece.r === r && prev.selectedPiece.c === c) {
        nextState.selectedPiece = null;
        return nextState;
      }

      // Handle piece movement
      let moveMade = false;
      if (prev.turn === TURN.TIGER) {
        const { moves, captures } = getTigerMoves(prev.selectedPiece.r, prev.selectedPiece.c, prev.board);
        const captureMove = captures.find(cap => cap.to.r === r && cap.to.c === c);
        const simpleMove = moves.find(mov => mov.to.r === r && mov.to.c === c);
        if (captureMove) {
          newBoard[captureMove.to.r][captureMove.to.c] = PIECES.TIGER;
          newBoard[prev.selectedPiece.r][prev.selectedPiece.c] = PIECES.EMPTY;
          newBoard[captureMove.captured.r][captureMove.captured.c] = PIECES.EMPTY;
          nextState.goatsCaptured++;
          moveMade = true;
        } else if (simpleMove) {
          newBoard[simpleMove.to.r][simpleMove.to.c] = PIECES.TIGER;
          newBoard[prev.selectedPiece.r][prev.selectedPiece.c] = PIECES.EMPTY;
          moveMade = true;
        }
      } else if (prev.turn === TURN.GOAT) {
        const isAdjacent = ADJACENCY_MAP[prev.selectedPiece.r * 5 + prev.selectedPiece.c].some(([ar, ac]) => ar === r && ac === c);
        if (prev.board[r][c] === PIECES.EMPTY && isAdjacent) {
          newBoard[r][c] = PIECES.GOAT;
          newBoard[prev.selectedPiece.r][prev.selectedPiece.c] = PIECES.EMPTY;
          moveMade = true;
        }
      }

      if (moveMade) {
        nextState.board = newBoard;
        if (checkGoatWin(nextState.board)) nextState.status = GAME_STATUS.GOAT_WIN;
        if (nextState.goatsCaptured >= 10) nextState.status = GAME_STATUS.TIGER_WIN;
        nextState.turn = prev.turn === TURN.TIGER ? TURN.GOAT : TURN.TIGER;
        nextState.selectedPiece = null;
      } else if (prev.board[r][c] === prev.turn) {
        // Switch selection to another piece of the same type
        nextState.selectedPiece = { r, c };
      }

      return nextState;
    });
  }, [gameMode, playerPiece, getTigerMoves, checkGoatWin]);

  const restartGame = useCallback(() => {
    setGameState(INITIAL_STATE);
  }, []);

  const possibleMoves = useMemo(() => {
    if (!selectedPiece || status !== GAME_STATUS.PLAYING) return [];
    const { r, c } = selectedPiece;
    if (board[r][c] === PIECES.TIGER) {
      const { moves, captures } = getTigerMoves(r, c, board);
      return [...moves.map(m => m.to), ...captures.map(c => c.to)];
    }
    if (board[r][c] === PIECES.GOAT) {
      return ADJACENCY_MAP[r * 5 + c]
        .filter(([adjR, adjC]) => board[adjR][adjC] === PIECES.EMPTY)
        .map(([r, c]) => ({ r, c }));
    }
    return [];
  }, [selectedPiece, board, status, getTigerMoves]);

  return { board, turn, phase, goatsToPlace, goatsCaptured, selectedPiece, status, possibleMoves, handleCellClick, restartGame };
}

