import { useState, useEffect, useCallback } from 'react';

// Key for saving the best score in local storage.
const BEST_SCORE_KEY = '2048-best-score';

// Initializes an empty 4x4 grid.
const createEmptyGrid = () => Array(4).fill(null).map(() => Array(4).fill(0));

// Adds a new tile (either a 2 or 4) to a random empty spot on the grid.
const addNewTile = (grid) => {
  const newGrid = grid.map(row => [...row]);
  const emptyTiles = [];
  newGrid.forEach((row, r) => {
    row.forEach((cell, c) => {
      if (cell === 0) {
        emptyTiles.push({ r, c });
      }
    });
  });

  if (emptyTiles.length > 0) {
    const { r, c } = emptyTiles[Math.floor(Math.random() * emptyTiles.length)];
    newGrid[r][c] = Math.random() < 0.9 ? 2 : 4;
  }
  return newGrid;
};

// --- Core Game Logic Functions ---

const rotateGrid = (grid) => {
  const newGrid = createEmptyGrid();
  for (let r = 0; r < 4; r++) {
    for (let c = 0; c < 4; c++) {
      newGrid[c][3 - r] = grid[r][c];
    }
  }
  return newGrid;
};

const slideRowLeft = (row) => {
  const newRow = row.filter(cell => cell !== 0);
  const padding = Array(4 - newRow.length).fill(0);
  return newRow.concat(padding);
};

const mergeRowLeft = (row) => {
  let score = 0;
  const newRow = [...row];
  for (let c = 0; c < 3; c++) {
    if (newRow[c] !== 0 && newRow[c] === newRow[c + 1]) {
      newRow[c] *= 2;
      score += newRow[c];
      newRow[c + 1] = 0;
    }
  }
  return { row: newRow, score };
};

const canMove = (grid) => {
  for (let r = 0; r < 4; r++) {
    for (let c = 0; c < 4; c++) {
      if (grid[r][c] === 0) return true;
      if (r < 3 && grid[r][c] === grid[r + 1][c]) return true;
      if (c < 3 && grid[r][c] === grid[r][c + 1]) return true;
    }
  }
  return false;
};

// ✅ DEFINITIVE FIX: Create a single initializer function for the entire game state.
const getInitialState = () => {
  let grid = createEmptyGrid();
  grid = addNewTile(grid);
  grid = addNewTile(grid);

  const savedScore = localStorage.getItem(BEST_SCORE_KEY);
  const bestScore = parseInt(savedScore, 10);
  
  return {
    grid,
    score: 0,
    bestScore: !isNaN(bestScore) ? bestScore : 0,
    isGameOver: false,
  };
};

export function use2048Logic() {
  const [gameState, setGameState] = useState(getInitialState);
  const { grid, score, bestScore, isGameOver } = gameState;

  const restartGame = useCallback(() => {
    setGameState(getInitialState());
  }, []);
  
  // This effect now only handles SAVING the best score, not loading it.
  useEffect(() => {
    if (score > bestScore) {
      const newBestScore = score;
      setGameState(prev => ({ ...prev, bestScore: newBestScore }));
      localStorage.setItem(BEST_SCORE_KEY, newBestScore.toString());
    }
  }, [score, bestScore]);

  const move = useCallback((direction) => {
    if (isGameOver) return;

    let currentGrid = grid.map(row => [...row]);
    let tempGrid = currentGrid;
    let totalScore = 0;
    let rotations = 0;

    switch (direction) {
      case 'up': rotations = 3; break;
      case 'right': rotations = 2; break;
      case 'down': rotations = 1; break;
      default: rotations = 0;
    }

    for (let i = 0; i < rotations; i++) {
      tempGrid = rotateGrid(tempGrid);
    }

    const processedGrid = tempGrid.map(row => {
      let newRow = slideRowLeft(row);
      const { row: mergedRow, score: rowScore } = mergeRowLeft(newRow);
      totalScore += rowScore;
      return slideRowLeft(mergedRow);
    });

    let finalGrid = processedGrid;
    for (let i = 0; i < (4 - rotations) % 4; i++) {
      finalGrid = rotateGrid(finalGrid);
    }

    const moved = JSON.stringify(currentGrid) !== JSON.stringify(finalGrid);

    if (moved) {
      const gridWithNewTile = addNewTile(finalGrid);
      const newScore = score + totalScore;
      
      setGameState({
        ...gameState,
        grid: gridWithNewTile,
        score: newScore,
        isGameOver: !canMove(gridWithNewTile),
      });
    }
  }, [grid, score, isGameOver, gameState]);

  return { grid, score, bestScore, isGameOver, restartGame, move };
}

