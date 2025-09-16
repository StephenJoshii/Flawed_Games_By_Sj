import { useState } from "react";
import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { ArrowLeft } from "lucide-react";
import { useBaghChalLogic } from "./hooks/useBaghChalLogic";
import { BaghChalBoard } from "./components/BaghChalBoard";
import { GameInfo } from "./components/GameInfo";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";

// The main component for the Bagh Chal game.
export function BaghChal() {
  const [gameMode, setGameMode] = useState(null); // 'PVP' or 'AI'
  const [playerPiece, setPlayerPiece] = useState(null); // 'TIGER' or 'GOAT'

  const logic = useBaghChalLogic({ gameMode, playerPiece });

  // Render the game mode selection screen if no mode is chosen yet.
  if (!gameMode) {
    return (
      <div className="flex flex-col items-center justify-center p-4 min-h-screen bg-amber-50">
        <div className="absolute top-4 left-4">
          <Link to="/">
            <Button variant="outline" size="icon">
              <ArrowLeft className="h-4 w-4" />
            </Button>
          </Link>
        </div>
        <Card className="w-full max-w-sm">
          <CardHeader>
            <CardTitle>Bagh Chal</CardTitle>
            <CardDescription>Select a game mode to begin.</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <Button className="w-full" onClick={() => setGameMode('PVP')}>
              Play vs Player
            </Button>
            <Button className="w-full" onClick={() => { setGameMode('AI'); setPlayerPiece('TIGER'); }}>
              Play as Tiger (vs AI)
            </Button>
            <Button className="w-full" onClick={() => { setGameMode('AI'); setPlayerPiece('GOAT'); }}>
              Play as Goat (vs AI)
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  // Render the main game screen once a mode is selected.
  return (
    <div className="flex flex-col lg:flex-row items-center justify-center gap-8 p-4 min-h-screen bg-amber-50">
       <div className="absolute top-4 left-4">
        <Link to="/">
            <Button variant="outline" size="icon">
              <ArrowLeft className="h-4 w-4" />
            </Button>
          </Link>
        </div>
      
      <BaghChalBoard 
        board={logic.board}
        selectedPiece={logic.selectedPiece}
        possibleMoves={logic.possibleMoves}
        onCellClick={logic.handleCellClick}
      />
      <GameInfo 
        turn={logic.turn}
        phase={logic.phase}
        goatsToPlace={logic.goatsToPlace}
        goatsCaptured={logic.goatsCaptured}
        status={logic.status}
        onRestart={() => {
          logic.restartGame();
          setGameMode(null); // Go back to the mode selection screen on restart
        }}
      />
    </div>
  );
}

