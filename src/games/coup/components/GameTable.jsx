import { PlayerDisplay } from "./PlayerDisplay";
import { ActionMenu } from "./ActionMenu";

// The main component that renders the live game board.
export function GameTable({ gameData, userId }) {
  if (!gameData) {
    return <div className="flex items-center justify-center min-h-screen">Loading Game...</div>;
  }

  const { players, currentPlayerIndex, hostId } = gameData;
  const currentPlayer = players[currentPlayerIndex];
  const isMyTurn = currentPlayer?.uid === userId;
  const me = players.find(p => p.uid === userId);

  return (
    <div className="flex flex-col gap-4 p-4 min-h-screen">
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {players.map((player) => (
          <PlayerDisplay
            key={player.uid}
            player={player}
            isCurrentUser={player.uid === userId}
            isCurrentTurn={player.uid === currentPlayer?.uid}
            hostId={hostId}
          />
        ))}
      </div>

      {isMyTurn && me && !me.isOut && (
        <div className="mt-auto pt-4">
          <ActionMenu player={me} onAction={(action) => console.log(`Action taken: ${action}`)} />
        </div>
      )}

      {!isMyTurn && currentPlayer && (
        <div className="mt-auto text-center font-bold text-lg p-4 bg-white rounded-lg shadow">
          Waiting for {currentPlayer.name} to take their turn...
        </div>
      )}
    </div>
  );
}

