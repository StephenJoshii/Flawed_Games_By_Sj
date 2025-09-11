import { useState, useEffect, useCallback } from 'react';

// Initializes a 4x4 grid with all zeros
const createEmptyGrid = () => Array(4).fill(null).map(() => Array(4).fill(0));

// Adds a new tile (either a 2 or a 4) to a random empty spot on the grid
const addRandomTile = (grid) => {
  const newGrid = grid.map(row => [...row]);
  const emptyTiles = [];
  newGrid.forEach((row, rowIndex) => {
    row.forEach((value, colIndex) => {
      if (value === 0) {
        emptyTiles.push([rowIndex, colIndex]);
      }
    });
  });

  if (emptyTiles.length === 0) return newGrid;

  const [row, col] = emptyTiles[Math.floor(Math.random() * emptyTiles.length)];
  newGrid[row][col] = Math.random() < 0.9 ? 2 : 4; // 90% chance for a 2, 10% for a 4
  return newGrid;
};

// --- Core Game Logic for Sliding and Merging ---

// Rotates a grid 90 degrees clockwise
const rotateGrid = (grid) => {
  const newGrid = createEmptyGrid();
  for (let r = 0; r < 4; r++) {
    for (let c = 0; c < 4; c++) {
      newGrid[c][3 - r] = grid[r][c];
    }
  }
  return newGrid;
};

// Slides all tiles in a single row to the left and merges them
const slideAndMergeRow = (row) => {
  // 1. Filter out zeros to slide tiles left
  const filteredRow = row.filter(val => val !== 0);
  const newRow = [];
  let scoreToAdd = 0;

  // 2. Merge adjacent tiles
  for (let i = 0; i < filteredRow.length; i++) {
    if (i + 1 < filteredRow.length && filteredRow[i] === filteredRow[i + 1]) {
      const mergedValue = filteredRow[i] * 2;
      newRow.push(mergedValue);
      scoreToAdd += mergedValue;
      i++; // Skip the next tile as it's been merged
    } else {
      newRow.push(filteredRow[i]);
    }
  }

  // 3. Pad the row with zeros to the right
  while (newRow.length < 4) {
    newRow.push(0);
  }
  return { newRow, scoreToAdd };
};

// Checks if any moves are possible
const canMove = (grid) => {
  for (let r = 0; r < 4; r++) {
    for (let c = 0; c < 4; c++) {
      if (grid[r][c] === 0) return true; // Empty cell exists
      if (r < 3 && grid[r][c] === grid[r + 1][c]) return true; // Can merge down
      if (c < 3 && grid[r][c] === grid[r][c + 1]) return true; // Can merge right
    }
  }
  return false;
};

// The custom hook that contains all game state and logic
export function use2048Logic() {
  const [grid, setGrid] = useState(createEmptyGrid);
  const [score, setScore] = useState(0);
  const [isGameOver, setIsGameOver] = useState(false);

  // Function to start a new game
  const restartGame = useCallback(() => {
    let newGrid = addRandomTile(createEmptyGrid());
    newGrid = addRandomTile(newGrid);
    setGrid(newGrid);
    setScore(0);
    setIsGameOver(false);
  }, []);

  // Initialize the game on first load
  useEffect(() => {
    restartGame();
  }, [restartGame]);

  // Handle moving tiles in a specific direction
  const move = useCallback((direction) => {
    if (isGameOver) return;

    let currentGrid = grid.map(row => [...row]);
    let tempGrid = grid.map(row => [...row]);
    let totalScoreToAdd = 0;
    let rotations = 0;

    // Use rotations to simplify logic. All moves become a "move left".
    if (direction === 'up') { rotations = 1; }
    if (direction === 'right') { rotations = 2; }
    if (direction === 'down') { rotations = 3; }

    for (let i = 0; i < rotations; i++) {
      tempGrid = rotateGrid(tempGrid);
    }

    // Slide and merge every row
    tempGrid = tempGrid.map(row => {
      const { newRow, scoreToAdd } = slideAndMergeRow(row);
      totalScoreToAdd += scoreToAdd;
      return newRow;
    });

    // Rotate the grid back to its original orientation
    for (let i = 0; i < rotations; i++) {
      tempGrid = rotateGrid(rotateGrid(rotateGrid(tempGrid)));
    }
    
    // Check if the move actually changed the grid
    const hasChanged = JSON.stringify(currentGrid) !== JSON.stringify(tempGrid);

    if (hasChanged) {
      const gridWithNewTile = addRandomTile(tempGrid);
      setGrid(gridWithNewTile);
      setScore(prev => prev + totalScoreToAdd);

      // Check for game over condition
      if (!canMove(gridWithNewTile)) {
        setIsGameOver(true);
      }
    }
  }, [grid, isGameOver]);

  return { grid, score, isGameOver, restartGame, move };
}
