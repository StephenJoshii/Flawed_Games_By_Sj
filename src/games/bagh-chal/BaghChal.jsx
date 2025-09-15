import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { ArrowLeft } from "lucide-react";
import { useBaghChalLogic } from "./hooks/useBaghChalLogic";
import { BaghChalBoard } from "./components/BaghChalBoard";
import { GameInfo } from "./components/GameInfo";

// The main component for the Bagh Chal game.
export function BaghChal() {
  const { 
    board, 
    turn, 
    phase, 
    goatsToPlace, 
    goatsCaptured, 
    selectedPiece, 
    status, 
    possibleMoves, 
    handleCellClick, 
    restartGame 
  } = useBaghChalLogic();

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
        board={board}
        selectedPiece={selectedPiece}
        possibleMoves={possibleMoves}
        onCellClick={handleCellClick}
      />
      <GameInfo 
        turn={turn}
        phase={phase}
        goatsToPlace={goatsToPlace}
        goatsCaptured={goatsCaptured}
        status={status}
        onRestart={restartGame}
      />
    </div>
  );
}

