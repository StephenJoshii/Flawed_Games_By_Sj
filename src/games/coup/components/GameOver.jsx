import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Crown } from "lucide-react";

// Displays the winner and provides options to play again or return to the lobby.
export function GameOver({ winner, currentUserId, onRestart }) {
  const isWinner = winner?.uid === currentUserId;

  return (
    <div className="flex flex-col items-center justify-center p-4 min-h-screen bg-gray-100">
      <Card className="w-full max-w-md text-center animate-fade-in">
        <CardHeader>
          <CardTitle className="text-3xl font-bold">Game Over!</CardTitle>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="flex flex-col items-center space-y-2">
            <Crown className="h-16 w-16 text-yellow-500" />
            <p className="text-xl font-semibold">
              {isWinner ? "You are the winner!" : `${winner?.name || 'A player'} is the winner!`}
            </p>
          </div>
          <div className="flex justify-center space-x-4">
            <Button onClick={onRestart}>Play Again</Button>
            <Link to="/play/coup">
              <Button variant="outline">Back to Lobby</Button>
            </Link>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
