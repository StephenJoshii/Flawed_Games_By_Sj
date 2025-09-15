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

// Defines the valid connections on the board for checking adjacent moves.
const ADJACENCY_MAP = [
  [[1,1],[1,0],[0,1]], [[1,1],[1,0],[0,1],[0,2],[1,2]], [[1,1],[1,2],[0,1],[0,3]], [[1,1],[1,3],[1,4],[0,2],[0,4]], [[1,1],[1,3],[1,4],[0,3]],
  [[0,0],[0,1],[1,1],[2,0],[2,1]], [[0,0],[0,1],[0,2],[1,0],[1,2],[2,1],[2,0],[2,2]], [[0,1],[0,2],[0,3],[1,1],[1,3],[2,2],[2,1],[2,3]], [[0,2],[0,3],[0,4],[1,2],[1,4],[2,3],[2,2],[2,4]], [[0,3],[0,4],[1,3],[2,4],[2,3]],
  [[1,0],[1,1],[2,1],[3,0],[3,1]], [[1,0],[1,1],[1,2],[2,0],[2,2],[3,1],[3,0],[3,2]], [[1,1],[1,2],[1,3],[2,1],[2,3],[3,2],[3,1],[3,3]], [[1,2],[1,3],[1,4],[2,2],[2,4],[3,3],[3,2],[3,4]], [[1,3],[1,4],[2,3],[3,4],[3,3]],
  [[2,0],[2,1],[3,1],[4,0],[4,1]], [[2,0],[2,1],[2,2],[3,0],[3,2],[4,1],[4,0],[4,2]], [[2,1],[2,2],[2,3],[3,1],[3,3],[4,2],[4,1],[4,3]], [[2,2],[2,3],[2,4],[3,2],[3,4],[4,3],[4,2],[4,4]], [[2,3],[2,4],[3,3],[4,4],[4,3]],
  [[3,0],[3,1],[4,1]], [[3,0],[3,1],[3,2],[4,0],[4,2]], [[3,1],[3,2],[3,3],[4,1],[4,3]], [[3,2],[3,3],[3,4],[4,2],[4,4]], [[3,3],[3,4],[4,3]]
];


export function useBaghChalLogic({ gameMode }) {
  const [board, setBoard] = useState(getInitialBoard);
  const [turn, setTurn] = useState(TURN.GOAT);
  const [phase, setPhase] = useState(GAME_PHASES.PLACING);
  const [goatsToPlace, setGoatsToPlace] = useState(20);
  const [goatsCaptured, setGoatsCaptured] = useState(0);
  const [selectedPiece, setSelectedPiece] = useState(null);
  const [status, setStatus] = useState(GAME_STATUS.PLAYING);

  const isAdjacent = useCallback((r1, c1, r2, c2) => {
    return ADJACENCY_MAP[r1 * 5 + c1].some(([r, c]) => r === r2 && c === c2);
  }, []);
  
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
    for (let r = 0; r < 5; r++) {
      for (let c = 0; c < 5; c++) {
        if (currentBoard[r][c] === PIECES.TIGER) {
          const { moves, captures } = getTigerMoves(r, c, currentBoard);
          if (moves.length > 0 || captures.length > 0) return false;
        }
      }
    }
    return true;
  }, [getTigerMoves]);

  const _performMove = useCallback((newBoard, move) => {
      if (checkGoatWin(newBoard)) setStatus(GAME_STATUS.GOAT_WIN);
      setBoard(newBoard);
      setTurn(turn === TURN.TIGER ? TURN.GOAT : TURN.TIGER);
      setSelectedPiece(null);
  }, [turn, checkGoatWin]);

  const makeAIMove = useCallback(() => {
    let allCaptures = [];
    let allSimpleMoves = [];
    const newBoard = board.map(row => [...row]);

    for (let r = 0; r < 5; r++) {
      for (let c = 0; c < 5; c++) {
        if (board[r][c] === PIECES.TIGER) {
          const { moves, captures } = getTigerMoves(r, c, board);
          allCaptures.push(...captures);
          allSimpleMoves.push(...moves);
        }
      }
    }

    // AI strategy: 1. Prioritize captures, 2. Make a random move.
    const move = allCaptures.length > 0
      ? allCaptures[Math.floor(Math.random() * allCaptures.length)]
      : allSimpleMoves[Math.floor(Math.random() * allSimpleMoves.length)];

    if (move) {
      newBoard[move.to.r][move.to.c] = PIECES.TIGER;
      newBoard[move.from.r][move.from.c] = PIECES.EMPTY;
      if (move.captured) {
        newBoard[move.captured.r][move.captured.c] = PIECES.EMPTY;
        const newGoatsCaptured = goatsCaptured + 1;
        setGoatsCaptured(newGoatsCaptured);
        if (newGoatsCaptured >= 5) setStatus(GAME_STATUS.TIGER_WIN);
      }
      _performMove(newBoard);
    }
  }, [board, getTigerMoves, goatsCaptured, _performMove]);
  
  // Effect to trigger AI move
  useEffect(() => {
    if (turn === TURN.TIGER && gameMode === 'AI' && status === GAME_STATUS.PLAYING) {
      setTimeout(() => makeAIMove(), 1000); // AI "thinks" for 1 second
    }
  }, [turn, gameMode, status, makeAIMove]);

  const handleCellClick = useCallback((r, c) => {
    if (status !== GAME_STATUS.PLAYING) return;
    if (turn === TURN.TIGER && gameMode === 'AI') return; // Player cannot control AI

    if (phase === GAME_PHASES.PLACING) {
      if (turn !== TURN.GOAT || board[r][c] !== PIECES.EMPTY) return;
      const newBoard = board.map(row => [...row]);
      newBoard[r][c] = PIECES.GOAT;
      setBoard(newBoard);
      const newGoatsToPlace = goatsToPlace - 1;
      setGoatsToPlace(newGoatsToPlace);
      if (newGoatsToPlace === 0) setPhase(GAME_PHASES.MOVING);
      setTurn(TURN.TIGER);
      return;
    }

    if (phase === GAME_PHASES.MOVING) {
      if (!selectedPiece) {
        if (board[r][c] === turn) setSelectedPiece({ r, c });
        return;
      }
      if (selectedPiece.r === r && selectedPiece.c === c) {
        setSelectedPiece(null);
        return;
      }
      if (board[selectedPiece.r][selectedPiece.c] === turn) {
        const newBoard = board.map(row => [...row]);
        if (turn === TURN.TIGER) {
          const { moves, captures } = getTigerMoves(selectedPiece.r, selectedPiece.c, board);
          const captureMove = captures.find(cap => cap.to.r === r && cap.to.c === c);
          const simpleMove = moves.find(mov => mov.to.r === r && mov.to.c === c);
          if (captureMove) {
            newBoard[captureMove.to.r][captureMove.to.c] = PIECES.TIGER;
            newBoard[selectedPiece.r][selectedPiece.c] = PIECES.EMPTY;
            newBoard[captureMove.captured.r][captureMove.captured.c] = PIECES.EMPTY;
            const newGoatsCaptured = goatsCaptured + 1;
            setGoatsCaptured(newGoatsCaptured);
            if (newGoatsCaptured >= 5) setStatus(GAME_STATUS.TIGER_WIN);
            _performMove(newBoard);
          } else if (simpleMove) {
            newBoard[simpleMove.to.r][simpleMove.to.c] = PIECES.TIGER;
            newBoard[selectedPiece.r][selectedPiece.c] = PIECES.EMPTY;
            _performMove(newBoard);
          }
        } else if (turn === TURN.GOAT) {
          if (board[r][c] === PIECES.EMPTY && isAdjacent(selectedPiece.r, selectedPiece.c, r, c)) {
            newBoard[r][c] = PIECES.GOAT;
            newBoard[selectedPiece.r][selectedPiece.c] = PIECES.EMPTY;
            _performMove(newBoard, { from: selectedPiece, to: {r,c}});
          }
        }
      }
    }
  }, [board, turn, phase, goatsToPlace, selectedPiece, status, gameMode, getTigerMoves, isAdjacent, goatsCaptured, _performMove]);

  const restartGame = useCallback(() => {
    setBoard(getInitialBoard());
    setTurn(TURN.GOAT);
    setPhase(GAME_PHASES.PLACING);
    setGoatsToPlace(20);
    setGoatsCaptured(0);
    setSelectedPiece(null);
    setStatus(GAME_STATUS.PLAYING);
  }, []);

  const possibleMoves = useMemo(() => {
    if (!selectedPiece || status !== GAME_STATUS.PLAYING) return [];
    const { r, c } = selectedPiece;
    if (board[r][c] === PIECES.TIGER) {
      const { moves, captures } = getTigerMoves(r, c, board);
      return [...moves.map(m=>m.to), ...captures.map(c=>c.to)];
    }
    if (board[r][c] === PIECES.GOAT) {
      return ADJACENCY_MAP[r * 5 + c]
        .filter(([adjR, adjC]) => board[adjR][adjC] === PIECES.EMPTY)
        .map(([r,c]) => ({r,c}));
    }
    return [];
  }, [selectedPiece, board, status, getTigerMoves]);

  return { board, turn, phase, goatsToPlace, goatsCaptured, selectedPiece, status, possibleMoves, handleCellClick, restartGame };
}

