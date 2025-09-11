import { useEffect, useRef } from 'react';
import { use2048Logic } from './hooks/use2048Logic';
import { GameBoard } from './components/GameBoard';
import { GameHeader } from './components/GameHeader';
import { Button } from '@/components/ui/button';

export function Twenty48() {
  const { grid, score, isGameOver, restartGame, move } = use2048Logic();

  // --- Input Handling ---
  const touchStartRef = useRef({ x: 0, y: 0 });

  useEffect(() => {
    const handleKeyDown = (e) => {
      e.preventDefault();
      switch (e.key) {
        case 'ArrowUp': move('up'); break;
        case 'ArrowDown': move('down'); break;
        case 'ArrowLeft': move('left'); break;
        case 'ArrowRight': move('right'); break;
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [move]);

  const handleTouchStart = (e) => {
    touchStartRef.current = { x: e.touches[0].clientX, y: e.touches[0].clientY };
  };

  const handleTouchEnd = (e) => {
    const touchEnd = { x: e.changedTouches[0].clientX, y: e.changedTouches[0].clientY };
    const touchStart = touchStartRef.current;
    
    const dx = touchEnd.x - touchStart.x;
    const dy = touchEnd.y - touchStart.y;
    
    // Determine if it was a significant swipe
    if (Math.abs(dx) > 50 || Math.abs(dy) > 50) {
      if (Math.abs(dx) > Math.abs(dy)) {
        move(dx > 0 ? 'right' : 'left');
      } else {
        move(dy > 0 ? 'down' : 'up');
      }
    }
  };

  return (
    <div
      className="flex flex-col items-center justify-center p-4 min-h-screen bg-gray-50"
      onTouchStart={handleTouchStart}
      onTouchEnd={handleTouchEnd}
    >
      <GameHeader score={score} onRestart={restartGame} />
      <div className="relative">
        <GameBoard grid={grid} />
        {isGameOver && (
          <div className="absolute inset-0 bg-white/70 flex flex-col items-center justify-center rounded-md animate-fade-in">
            <h2 className="text-4xl font-bold text-gray-800">Game Over!</h2>
            <Button onClick={restartGame} className="mt-4">Try Again</Button>
          </div>
        )}
      </div>
      <footer className="mt-4 text-center text-muted-foreground text-sm">
        <p>Use arrow keys or swipe to play.</p>
      </footer>
    </div>
  );
}

