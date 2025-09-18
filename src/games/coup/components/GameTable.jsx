import { PlayerDisplay } from "./PlayerDisplay";
import { ActionMenu } from "./ActionMenu";

// The main component that renders the live game board.
export function GameTable({ gameData, userId, onAction }) {
  if (!gameData) {
    return <div className="flex items-center justify-center min-h-screen">Loading Game...</div>;
  }

  const { players, currentPlayerIndex, hostId, actionLog } = gameData;
  const currentPlayer = players[currentPlayerIndex];
  const isMyTurn = currentPlayer?.uid === userId;
  const me = players.find(p => p.uid === userId);

  return (
    <div className="flex flex-col md:flex-row gap-4 p-4 min-h-screen">
      {/* Players Display */}
      <div className="flex-grow grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
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

      {/* Action Panel */}
      <div className="w-full md:w-80 flex-shrink-0">
        {isMyTurn && me && !me.isOut && (
          <ActionMenu player={me} onAction={onAction} />
        )}

        {!isMyTurn && currentPlayer && (
          <div className="text-center font-bold text-lg p-4 bg-white rounded-lg shadow">
            Waiting for {currentPlayer.name} to take their turn...
          </div>
        )}
        
        {/* Action Log */}
        <div className="mt-4 p-2 bg-white rounded-lg shadow h-48 overflow-y-auto text-sm">
          <h4 className="font-bold mb-2 p-2">Game Log</h4>
          <ul>
            {actionLog.slice().reverse().map((log, index) => (
              <li key={index} className="px-2 py-1 border-b last:border-b-0">{log}</li>
            ))}
          </ul>
        </div>
      </div>
    </div>
  );
}

