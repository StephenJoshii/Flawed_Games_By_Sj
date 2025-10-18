import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";

// Renders the UI elements for the Snake game, like score and restart button.
export function GameUI({ score, onRestart }) {
  return (
    <div className="flex justify-between items-center w-full max-w-md mb-4">
      <div>
        <h1 className="text-4xl font-bold tracking-tighter">Snake</h1>
      </div>
      <div className="flex items-center gap-4">
        <Card className="text-center">
          <CardContent className="p-3">
            <div className="text-xs font-bold text-muted-foreground">SCORE</div>
            <div className="text-2xl font-bold">{score}</div>
          </CardContent>
        </Card>
        <Button onClick={onRestart}>New Game</Button>
      </div>
    </div>
  );
}

