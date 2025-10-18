import { useEffect } from 'react';
import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { ArrowLeft } from "lucide-react";
import { useSnakeLogic } from './hooks/useSnakeLogic';
import { SnakeBoard } from './components/SnakeBoard';
import { GameUI } from './components/GameUI';

// The main component for the Snake game.
export function Snake() {
  const { 
    gridSize, 
    snake, 
    food, 
    isGameOver, 
    score, 
    changeDirection, 
    restartGame 
  } = useSnakeLogic();

  // This effect handles all keyboard input for controlling the snake.
  useEffect(() => {
    const handleKeyDown = (e) => {
      e.preventDefault();
      switch (e.key) {
        case 'ArrowUp':
        case 'w':
          changeDirection({ x: 0, y: -1 });
          break;
        case 'ArrowDown':
        case 's':
          changeDirection({ x: 0, y: 1 });
          break;
        case 'ArrowLeft':
        case 'a':
          changeDirection({ x: -1, y: 0 });
          break;
        case 'ArrowRight':
        case 'd':
          changeDirection({ x: 1, y: 0 });
          break;
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [changeDirection]);

  return (
    <div className="flex flex-col items-center justify-center p-4 min-h-screen bg-gray-100 text-gray-800">
      <div className="absolute top-4 left-4">
        <Link to="/">
          <Button variant="outline" size="icon">
            <ArrowLeft className="h-4 w-4" />
          </Button>
        </Link>
      </div>
      
      <GameUI score={score} onRestart={restartGame} />
      
      <div className="relative">
        <SnakeBoard gridSize={gridSize} snake={snake} food={food} />
        {isGameOver && (
          <div className="absolute inset-0 bg-black/70 flex flex-col items-center justify-center rounded-lg animate-fade-in">
            <h2 className="text-4xl font-bold text-white">Game Over!</h2>
            <p className="text-white mt-2">Your final score: {score}</p>
            <Button onClick={restartGame} className="mt-4">
              Play Again
            </Button>
          </div>
        )}
      </div>

       <footer className="mt-4 text-center text-muted-foreground text-sm">
        <p>Use Arrow Keys or WASD to play.</p>
      </footer>
    </div>
  );
}

