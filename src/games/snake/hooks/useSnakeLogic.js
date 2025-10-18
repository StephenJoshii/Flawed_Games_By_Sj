import { useState, useEffect, useCallback, useRef } from 'react';

// Defines the configuration for the game grid and speed.
const GRID_SIZE = 20;
const GAME_SPEED_MS = 150;

// Generates a random coordinate for the food, ensuring it's not on the snake.
const getRandomCoordinate = (snake) => {
  let coordinate;
  do {
    coordinate = {
      x: Math.floor(Math.random() * GRID_SIZE),
      y: Math.floor(Math.random() * GRID_SIZE),
    };
  } while (snake.some(segment => segment.x === coordinate.x && segment.y === coordinate.y));
  return coordinate;
};

const initialState = {
  snake: [{ x: 10, y: 10 }], // Snake starts in the middle
  food: getRandomCoordinate([{ x: 10, y: 10 }]),
  direction: { x: 0, y: -1 }, // Start moving up
  isGameOver: false,
  score: 0,
};

/**
 * A custom hook to manage the state and logic for the Snake game.
 */
export function useSnakeLogic() {
  const [gameState, setGameState] = useState(initialState);
  const { snake, food, direction, isGameOver, score } = gameState;

  // A ref to hold the game loop interval so it can be cleared.
  const gameLoop = useRef(null);
  // A ref to buffer the next direction to prevent the snake from reversing on itself.
  const nextDirection = useRef(direction);

  const restartGame = useCallback(() => {
    setGameState(initialState);
    nextDirection.current = initialState.direction;
  }, []);

  const changeDirection = useCallback((newDirection) => {
    // Prevents the snake from immediately reversing direction.
    if (direction.x + newDirection.x !== 0 || direction.y + newDirection.y !== 0) {
      nextDirection.current = newDirection;
    }
  }, [direction]);

  useEffect(() => {
    if (isGameOver) {
      clearInterval(gameLoop.current);
      return;
    }

    // The main game loop, running at a set interval.
    gameLoop.current = setInterval(() => {
      setGameState(prev => {
        const newSnake = [...prev.snake];
        const head = { ...newSnake[0] };

        // Update direction from the buffer
        const currentDirection = nextDirection.current;
        head.x += currentDirection.x;
        head.y += currentDirection.y;

        // --- Collision Detection ---

        // Wall collision
        if (head.x < 0 || head.x >= GRID_SIZE || head.y < 0 || head.y >= GRID_SIZE) {
          return { ...prev, isGameOver: true };
        }

        // Self collision
        for (let i = 1; i < newSnake.length; i++) {
          if (head.x === newSnake[i].x && head.y === newSnake[i].y) {
            return { ...prev, isGameOver: true };
          }
        }

        newSnake.unshift(head);

        // Food consumption
        if (head.x === prev.food.x && head.y === prev.food.y) {
          // Snake grows, so we don't pop the tail
          return {
            ...prev,
            snake: newSnake,
            food: getRandomCoordinate(newSnake),
            score: prev.score + 10,
            direction: currentDirection,
          };
        }

        newSnake.pop(); // Snake moves, so we pop the tail

        return {
          ...prev,
          snake: newSnake,
          direction: currentDirection,
        };
      });
    }, GAME_SPEED_MS);

    return () => clearInterval(gameLoop.current);
  }, [snake, isGameOver]);

  return {
    gridSize: GRID_SIZE,
    snake,
    food,
    isGameOver,
    score,
    changeDirection,
    restartGame,
  };
}
