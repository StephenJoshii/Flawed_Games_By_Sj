import { Card, CardContent } from "@/components/ui/card";
import { Coins, User, Crown } from "lucide-react";

// Displays a single player's game state.
export function PlayerDisplay({ player, isCurrentUser, isCurrentTurn, hostId }) {
  const isHost = player.uid === hostId;

  // Determines the styling for a card based on whether it is revealed.
  const getCardClasses = (card) => {
    if (card.isRevealed) return "bg-gray-400 text-white border-gray-500 line-through";
    if (isCurrentUser) return "bg-blue-600 text-white";
    return "bg-gray-800";
  };

  const containerClasses = `p-2 rounded-lg border-2 ${isCurrentTurn ? "border-yellow-400 shadow-lg" : "border-transparent"}`;

  return (
    <div className={containerClasses}>
      <Card className={player.isOut ? "opacity-50" : ""}>
        <CardContent className="p-4 relative">
          <div className="flex justify-between items-center mb-3">
            <div className="flex items-center gap-2">
              <User className="h-5 w-5" />
              <span className="font-bold">{player.name} {isCurrentUser && "(You)"}</span>
              {isHost && <Crown className="h-4 w-4 text-yellow-500" />}
            </div>
            <div className="flex items-center gap-1 font-bold text-yellow-600">
              <Coins className="h-5 w-5" />
              <span>{player.coins}</span>
            </div>
          </div>
          <div className="grid grid-cols-2 gap-2">
            {player.cards.map((card, index) => (
              <div
                key={index}
                className={`h-24 rounded-md flex items-center justify-center text-center p-2 border-2 ${getCardClasses(card)}`}
              >
                <div className="font-bold">
                  {isCurrentUser || card.isRevealed ? card.character : "COUP"}
                </div>
              </div>
            ))}
            {Array(2 - player.cards.length).fill(0).map((_, index) => (
              <div key={`placeholder-${index}`} className="h-24 rounded-md bg-gray-200 border-2 border-dashed" />
            ))}
          </div>
          {player.isOut && <div className="absolute inset-0 bg-black/50 flex items-center justify-center rounded-lg"><span className="text-white font-bold text-2xl rotate-12">OUT</span></div>}
        </CardContent>
      </Card>
    </div>
  );
}

