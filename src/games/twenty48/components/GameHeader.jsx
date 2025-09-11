import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";

export function GameHeader({ score, bestScore, onRestart }) {
  return (
    <div className="flex justify-between items-center mb-4">
      <div>
        <h1 className="text-5xl font-bold tracking-tighter">2048</h1>
        <p className="text-muted-foreground">Join the tiles, get to 2048!</p>
      </div>
      <div className="flex space-x-2">
        <Card className="text-center p-2">
          <CardContent className="p-1">
            <div className="text-xs font-bold text-muted-foreground">SCORE</div>
            <div className="text-2xl font-bold">{score}</div>
          </CardContent>
        </Card>
        <Button onClick={onRestart}>New Game</Button>
      </div>
    </div>
  );
}
