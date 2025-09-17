import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

// A placeholder component to display the raw game data from Firestore.
export function GameTable({ gameData, userId }) {
  if (!gameData) {
    return <div>Loading Game...</div>;
  }

  return (
    <Card className="w-full max-w-4xl">
      <CardHeader>
        <CardTitle>Game State (Live from Firebase)</CardTitle>
      </CardHeader>
      <CardContent>
        <p>Game ID: {gameData.id}</p>
        <p>Your User ID: {userId}</p>
        <h3 className="font-bold mt-4">Players:</h3>
        <ul>
          {gameData.players.map(p => (
            <li key={p.uid}>{p.name} ({p.uid === userId ? "You" : "Opponent"})</li>
          ))}
        </ul>
        <pre className="mt-4 p-2 bg-gray-100 rounded text-xs overflow-auto">
          {JSON.stringify(gameData, null, 2)}
        </pre>
      </CardContent>
    </Card>
  );
}
