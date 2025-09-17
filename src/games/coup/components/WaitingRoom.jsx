import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Toaster, toast } from "sonner";

// A UI component for the pre-game waiting area.
export function WaitingRoom({ gameData, userId }) {

  const isHost = gameData.hostId === userId;
  
  const handleCopyGameId = () => {
    navigator.clipboard.writeText(gameData.id);
    toast.success("Game ID copied to clipboard!");
  };

  const handleStartGame = () => {
    // This function will be implemented in the next step.
    toast.info("Starting the game...");
  };

  return (
    <>
      <Toaster richColors position="top-right" />
      <div className="flex flex-col items-center justify-center p-4 min-h-screen bg-gray-100">
        <Card className="w-full max-w-md">
          <CardHeader>
            <CardTitle>Waiting Room</CardTitle>
            <CardDescription>Share the Game ID with your friends to have them join.</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-center space-x-2">
              <p className="p-2 bg-gray-200 rounded font-mono text-sm flex-grow">{gameData.id}</p>
              <Button onClick={handleCopyGameId}>Copy ID</Button>
            </div>
            <div>
              <h3 className="font-bold mb-2">Players ({gameData.players.length} / 6)</h3>
              <ul className="space-y-2">
                {gameData.players.map((player) => (
                  <li key={player.uid} className="p-2 bg-gray-50 rounded">
                    {player.name} {player.uid === userId ? "(You)" : ""}
                  </li>
                ))}
              </ul>
            </div>
            {isHost && (
              <Button 
                className="w-full"
                onClick={handleStartGame}
                disabled={gameData.players.length < 2}
              >
                Start Game ({gameData.players.length} Players)
              </Button>
            )}
            {!isHost && (
              <p className="text-center text-muted-foreground">Waiting for the host to start the game...</p>
            )}
          </CardContent>
        </Card>
      </div>
    </>
  );
}
