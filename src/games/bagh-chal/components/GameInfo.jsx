import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";

// Displays the current state of the Bagh Chal game.
export function GameInfo({ turn, phase, goatsToPlace, goatsCaptured, status, onRestart }) {

  const getStatusMessage = () => {
    switch (status) {
      case 'TIGER_WIN': return 'Tigers Win!';
      case 'GOAT_WIN': return 'Goats Win!';
      default:
        if (phase === 'PLACING') {
          return `Goats' Turn to Place`;
        }
        return `${turn === 'TIGER' ? 'Tiger' : 'Goat'}'s Turn to Move`;
    }
  };

  return (
    <Card className="w-[300px]">
      <CardHeader>
        <CardTitle className="text-center">Game Status</CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="text-center">
          <p className="text-sm text-muted-foreground">Status</p>
          <p className="text-lg font-bold">{getStatusMessage()}</p>
        </div>
        <div className="flex justify-around text-center">
          <div>
            <p className="text-sm text-muted-foreground">Goats to Place</p>
            <p className="text-2xl font-bold">{goatsToPlace}</p>
          </div>
          <div>
            <p className="text-sm text-muted-foreground">Goats Captured</p>
            <p className="text-2xl font-bold">{goatsCaptured}</p>
          </div>
        </div>
        <Button onClick={onRestart} className="w-full">
          New Game
        </Button>
      </CardContent>
    </Card>
  );
}
