import { useState, useEffect, useCallback } from "react";
import { Link, useNavigate, useParams } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { ArrowLeft } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Toaster, toast } from "sonner";
import { db, auth, signIn } from "../../firebase";
import { doc, getDoc, collection, addDoc, onSnapshot, updateDoc } from "firebase/firestore";
import { GameTable } from "./components/GameTable";
import { WaitingRoom } from "./components/WaitingRoom";
import { initializeNewGame, addPlayerToGame, startGame, performAction } from "./hooks/useCoupLogic";

// The main lobby component for creating or joining a game.
function CoupLobby() {
  const [user, setUser] = useState(null);
  const [gameIdInput, setGameIdInput] = useState("");
  const [isCreating, setIsCreating] = useState(false);
  const [isJoining, setIsJoining] = useState(false);
  const navigate = useNavigate();
  
  const appId = typeof __app_id !== 'undefined' ? __app_id : 'coup-dev';

  useEffect(() => {
    signIn().then(() => setUser(auth.currentUser));
  }, []);

  const handleCreateGame = async () => {
    if (!user) return toast.error("You must be signed in to create a game.");
    setIsCreating(true);
    try {
      const newGameData = initializeNewGame(user); 
      const gameCollectionRef = collection(db, `artifacts/${appId}/public/data/coup-games`);
      const newGameDoc = await addDoc(gameCollectionRef, newGameData);
      navigate(`/play/coup/${newGameDoc.id}`);
    } catch (error) {
      console.error("Error creating game:", error);
      toast.error("Failed to create game. Please try again.");
    }
    setIsCreating(false);
  };

  const handleJoinGame = async () => {
    if (!gameIdInput.trim()) return toast.warning("Please enter a Game ID.");
    if(!user) return toast.error("You must be signed in to join a game.");
    setIsJoining(true);
    try {
      const gameDocRef = doc(db, `artifacts/${appId}/public/data/coup-games`, gameIdInput.trim());
      const gameDoc = await getDoc(gameDocRef);
      if (gameDoc.exists()) {
        const gameData = gameDoc.data();
        if (gameData.status !== 'waiting') return toast.error("This game has already started.");
        if (gameData.players.length >= 6) return toast.error("This game is full.");
        if (gameData.players.some(p => p.uid === user.uid)) {
           navigate(`/play/coup/${gameIdInput.trim()}`);
        } else {
          await addPlayerToGame(gameDocRef, user, gameData.players.length);
          navigate(`/play/coup/${gameIdInput.trim()}`);
        }
      } else {
        toast.error("Game not found. Please check the ID.");
      }
    } catch (error) {
      console.error("Error joining game:", error);
      toast.error("Failed to join game. Please try again.");
    }
    setIsJoining(false);
  };

  return (
    <div className="flex flex-col items-center justify-center p-4 min-h-screen bg-gray-100">
      <div className="absolute top-4 left-4">
        <Link to="/"><Button variant="outline" size="icon"><ArrowLeft className="h-4 w-4" /></Button></Link>
      </div>
      <Card className="w-full max-w-md">
        <CardHeader>
          <CardTitle>Coup Lobby</CardTitle>
          <CardDescription>Create a new game or join one with an ID.</CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="space-y-2">
            <Button className="w-full" onClick={handleCreateGame} disabled={isCreating || !user}>
              {isCreating ? "Creating..." : "Create New Game"}
            </Button>
            {user && <p className="text-xs text-center text-muted-foreground">Your User ID: {user.uid}</p>}
          </div>
          <div className="relative"><div className="absolute inset-0 flex items-center"><span className="w-full border-t" /></div><div className="relative flex justify-center text-xs uppercase"><span className="bg-card px-2 text-muted-foreground">Or</span></div></div>
          <div className="space-y-2">
            <Label htmlFor="gameId">Join with Game ID</Label>
            <Input id="gameId" placeholder="Enter Game ID" value={gameIdInput} onChange={(e) => setGameIdInput(e.target.value)} />
            <Button variant="secondary" className="w-full" onClick={handleJoinGame} disabled={isJoining || !user}>
              {isJoining ? "Joining..." : "Join Game"}
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

// A hardcoded game state for testing the UI without needing real players.
const mockGameData = {
  id: "mock-game-123",
  hostId: "your-mock-id",
  status: "playing",
  currentPlayerIndex: 0,
  players: [
    { uid: "your-mock-id", name: "Player 1", coins: 8, cards: [{ character: "Duke", isRevealed: false },{ character: "Assassin", isRevealed: false }], isOut: false },
    { uid: "player-2", name: "Player 2", coins: 2, cards: [{ character: "Captain", isRevealed: false },{ character: "Contessa", isRevealed: false }], isOut: false },
    { uid: "player-3", name: "Player 3", coins: 3, cards: [{ character: "Ambassador", isRevealed: true },{ character: "Duke", isRevealed: false }], isOut: false },
  ],
  actionLog: ["Game started.", "Player 1's turn."],
};

function GameSession() {
  const { gameId } = useParams();
  const appId = typeof __app_id !== 'undefined' ? __app_id : 'coup-dev';

  // --- MOCK DATA FOR UI DEVELOPMENT ---
  const [gameData, setGameData] = useState(mockGameData);
  const user = { uid: "your-mock-id" }; // We pretend to be the host
  const [targeting, setTargeting] = useState({ isTargeting: false, actionType: null });
  // --- END MOCK DATA ---
  
  /* // This is the real-time listener, temporarily disabled for UI testing.
  const [gameData, setGameData] = useState(null);
  const [error, setError] = useState(null);
  const user = auth.currentUser;
  useEffect(() => {
    if (!gameId || !user) return;
    const gameDocRef = doc(db, `artifacts/${appId}/public/data/coup-games`, gameId);
    
    const unsubscribe = onSnapshot(gameDocRef, (doc) => {
      if (doc.exists()) {
        setGameData({ id: doc.id, ...doc.data() });
        setError(null);
      } else {
        setError("Game not found. It may have been deleted.");
        setGameData(null);
      }
    }, (err) => {
      console.error("Error listening to game state:", err);
      setError("An error occurred while connecting to the game.");
    });

    return () => unsubscribe();
  }, [gameId, appId, user]);
  */

  const handleAction = useCallback(async (actionType) => {
    if (['coup', 'assassinate', 'steal'].includes(actionType)) {
      setTargeting({ isTargeting: true, actionType });
      toast.info("Select a target player.");
    } else {
      try {
        const newGameData = performAction(gameData, actionType, user.uid);
        // In mock mode, we just update local state instead of writing to Firestore.
        setGameData(newGameData);
      } catch (error) {
        console.error("Error performing action:", error);
        toast.error(error.message);
      }
    }
  }, [gameData, user]);

  const handleSelectTarget = useCallback(async (targetUid) => {
    if (!targeting.isTargeting || !targeting.actionType) return;
    try {
      const newGameData = performAction(gameData, targeting.actionType, user.uid, targetUid);
      // In mock mode, update local state.
      setGameData(newGameData);
    } catch (error) {
      console.error("Error performing targeted action:", error);
      toast.error(error.message);
    } finally {
      setTargeting({ isTargeting: false, actionType: null });
    }
  }, [targeting, gameData, user]);

  if (!gameData) {
    return <div className="flex items-center justify-center min-h-screen">Loading game session...</div>
  }
  
  return (
    <div className="p-4 min-h-screen bg-gray-100">
      <GameTable 
        gameData={gameData} 
        userId={user?.uid} 
        onAction={handleAction}
        onSelectTarget={handleSelectTarget}
        targetingState={targeting}
      />
    </div>
  );
}

// The main Coup component now acts as a router to show either the Lobby or a GameSession.
export function Coup() {
  const { gameId } = useParams();
  
  return (
    <>
      <Toaster richColors position="top-right" />
      {/* For testing, we can force the game view by passing a mock gameId */}
      {gameId || true ? <GameSession /> : <CoupLobby />}
    </>
  );
}

