import { useState, useEffect, useCallback } from 'react';
import { useSound } from '../../../hooks/useSound';

const BEST_SCORE_KEY = '2048-best-score';

const createEmptyGrid = () => Array(4).fill(null).map(() => Array(4).fill(0));

const addNewTile = (grid) => {
  const newGrid = grid.map(row => [...row]);
  const emptyTiles = [];
  newGrid.forEach((row, r) => row.forEach((cell, c) => {
    if (cell === 0) emptyTiles.push({ r, c });
  }));
  if (emptyTiles.length > 0) {
    const { r, c } = emptyTiles[Math.floor(Math.random() * emptyTiles.length)];
    newGrid[r][c] = Math.random() < 0.9 ? 2 : 4;
  }
  return newGrid;
};

const getInitialState = () => {
  let grid = createEmptyGrid();
  grid = addNewTile(grid);
  grid = addNewTile(grid);
  const savedScore = localStorage.getItem(BEST_SCORE_KEY);
  const bestScore = parseInt(savedScore, 10);
  return { grid, score: 0, bestScore: !isNaN(bestScore) ? bestScore : 0, isGameOver: false };
};

const transpose = (grid) => grid[0].map((_, colIndex) => grid.map(row => row[colIndex]));

const processLine = (line) => {
  const filtered = line.filter(cell => cell !== 0);
  let score = 0;
  let merged = false;
  for (let i = 0; i < filtered.length - 1; i++) {
    if (filtered[i] === filtered[i + 1]) {
      filtered[i] *= 2;
      score += filtered[i];
      filtered.splice(i + 1, 1);
      merged = true;
    }
  }
  const padding = Array(4 - filtered.length).fill(0);
  return { line: filtered.concat(padding), score, merged };
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

export function use2048Logic() {
  const [gameState, setGameState] = useState(getInitialState);
  const { grid, score, bestScore, isGameOver } = gameState;
  const { play, unlockAudio } = useSound();

  const restartGame = useCallback(() => { setGameState(getInitialState()); }, []);
  
  useEffect(() => {
    if (score > bestScore) {
      const newBestScore = score;
      setGameState(prev => ({ ...prev, bestScore: newBestScore }));
      localStorage.setItem(BEST_SCORE_KEY, newBestScore.toString());
    }
  }, [score, bestScore]);

  const move = useCallback((direction) => {
    if (isGameOver) return;

    let newGrid = grid.map(row => [...row]);
    let totalScore = 0;
    let anyMerged = false;
    
    let preTransformationGrid = newGrid;
    if (direction === 'up' || direction === 'down') {
        preTransformationGrid = transpose(newGrid);
    }
    if (direction === 'right' || direction === 'down') {
        preTransformationGrid = preTransformationGrid.map(row => row.reverse());
    }

    const postProcessGrid = preTransformationGrid.map(row => {
        const { line, score: rowScore, merged } = processLine(row);
        totalScore += rowScore;
        if(merged) anyMerged = true;
        return line;
    });
    
    let finalGrid = postProcessGrid;
    if (direction === 'right' || direction === 'down') {
        finalGrid = finalGrid.map(row => row.reverse());
    }
    if (direction === 'up' || direction === 'down') {
        finalGrid = transpose(finalGrid);
    }

    const moved = JSON.stringify(grid) !== JSON.stringify(finalGrid);

    if (moved) {
      const gridWithNewTile = addNewTile(finalGrid);
      const newScore = score + totalScore;
      const gameOver = !canMove(gridWithNewTile);

      setGameState(prev => ({...prev, grid: gridWithNewTile, score: newScore, isGameOver: gameOver }));
      
      if (anyMerged) play('merge'); else play('move');
      if (gameOver) play('gameOver');
    }
  }, [grid, score, isGameOver, play]);

  return { grid, score, bestScore, isGameOver, restartGame, move, unlockAudio };
}

