import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";

// Renders the header UI for the 2048 game, including scores and the restart button.
export function GameHeader({ score, bestScore, onRestart }) {
  return (
    <div className="flex justify-between items-center mb-4 w-[480px]">
      <div className="flex flex-col">
        <h1 className="text-6xl font-bold tracking-tighter text-[#776e65]">2048</h1>
        <p className="text-muted-foreground">Join the tiles, get to 2048!</p>
      </div>
      <div className="flex items-center space-x-2">
        <Card className="text-center bg-[#bbada0]">
          <CardContent className="p-2">
            <div className="text-xs font-bold text-gray-200">SCORE</div>
            <div className="text-2xl font-bold text-white">{score}</div>
          </CardContent>
        </Card>
        <Card className="text-center bg-[#bbada0]">
          <CardContent className="p-2">
            <div className="text-xs font-bold text-gray-200">BEST</div>
            <div className="text-2xl font-bold text-white">{bestScore}</div>
          </CardContent>
        </Card>
        <Button onClick={onRestart} className="h-full">New Game</Button>
      </div>
    </div>
  );
}

