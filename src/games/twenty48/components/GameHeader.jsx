import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { ArrowLeft } from "lucide-react";

// The main UI header for the 2048 game.
export function GameHeader({ score, bestScore, onRestart }) {
  return (
    <div className="w-[480px]">
      <div className="flex justify-between items-center mb-4">
        <div className="flex items-center gap-4">
          <Link to="/">
            <Button variant="outline" size="icon">
              <ArrowLeft className="h-4 w-4" />
            </Button>
          </Link>
          <div>
            <h1 className="text-5xl font-bold tracking-tighter">2048</h1>
            <p className="text-muted-foreground">Join the tiles, get to 2048!</p>
          </div>
        </div>
        <div className="flex space-x-2">
          <Card className="text-center p-2">
            <CardContent className="p-1">
              <div className="text-xs font-bold uppercase text-muted-foreground">Score</div>
              <div className="text-2xl font-bold">{score}</div>
            </CardContent>
          </Card>
          <Card className="text-center p-2">
            <CardContent className="p-1">
              <div className="text-xs font-bold uppercase text-muted-foreground">Best</div>
              <div className="text-2xl font-bold">{bestScore}</div>
            </CardContent>
          </Card>
        </div>
      </div>
       <div className="flex justify-end mb-4">
         <Button onClick={onRestart}>New Game</Button>
      </div>
    </div>
  );
}

