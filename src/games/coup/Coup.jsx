import { useState, useEffect, useCallback } from "react";
import { Link, useNavigate, useParams } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { ArrowLeft } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Toaster, toast } from "sonner";
import { db, auth, signIn } from "../../firebase";
import { doc, getDoc, collection, addDoc, onSnapshot, updateDoc, setDoc } from "firebase/firestore";
import { GameTable } from "./components/GameTable";
import { WaitingRoom } from "./components/WaitingRoom";
import { TargetSelectionModal } from "./components/TargetSelectionModal";
import { ResponseModal } from "./components/ResponseModal";
import { GameOver } from "./components/GameOver";
import { useCoupLogic } from "./hooks/useCoupLogic";
import { addPlayerToGame, startGame } from "./logic/multiplayer"; // We will create this file next

// The main lobby component for creating or joining a game.
function CoupLobby() {
  const [user, setUser] = useState(null);
  const [gameIdInput, setGameIdInput] = useState("");
  const [isCreating, setIsCreating] = useState(false);
  const [isJoining, setIsJoining] = useState(false);
  const navigate = useNavigate();
  const appId = typeof __app_id !== 'undefined' ? __app_id : 'coup-dev';
  
  const coupLogic = useCoupLogic();

  useEffect(() => {
    signIn().then(() => setUser(auth.currentUser));
  }, []);

  const handleCreateGame = async () => {
    if (!user) return toast.error("You must be signed in.");
    setIsCreating(true);
    try {
      const newGameData = coupLogic.createNewGame(user);
      const gameCollectionRef = collection(db, `artifacts/${appId}/public/data/coup-games`);
      const newGameDoc = doc(gameCollectionRef); // Create a doc reference with a new ID
      await setDoc(newGameDoc, newGameData); // Use setDoc to save the initial state
      navigate(`/play/coup/${newGameDoc.id}`);
    } catch (error) { 
      console.error("Error:", error); 
      toast.error("Failed to create game."); 
    }
    setIsCreating(false);
  };

  const handleJoinGame = async () => {
    if (!gameIdInput.trim()) return toast.warning("Please enter a Game ID.");
    if(!user) return toast.error("You must be signed in.");
    setIsJoining(true);
    try {
      const gameDocRef = doc(db, `artifacts/${appId}/public/data/coup-games`, gameIdInput.trim());
      const gameDoc = await getDoc(gameDocRef);
      if (gameDoc.exists()) {
        const d = gameDoc.data();
        if (d.status !== 'waiting') return toast.error("Game already started.");
        if (d.players.length >= 6) return toast.error("Game is full.");
        if (!d.players.some(p => p.uid === user.uid)) {
          await addPlayerToGame(gameDocRef, user, d.players.length);
        }
        navigate(`/play/coup/${gameIdInput.trim()}`);
      } else { toast.error("Game not found."); }
    } catch (error) { console.error("Error:", error); toast.error("Failed to join game."); }
    setIsJoining(false);
  };

  return (
    <div className="flex flex-col items-center justify-center p-4 min-h-screen bg-gray-100">
      <div className="absolute top-4 left-4"><Link to="/"><Button variant="outline" size="icon"><ArrowLeft className="h-4 w-4" /></Button></Link></div>
      <Card className="w-full max-w-md"><CardHeader><CardTitle>Coup Lobby</CardTitle><CardDescription>Create a new game or join with an ID.</CardDescription></CardHeader>
        <CardContent className="space-y-6">
          <div className="space-y-2"><Button className="w-full" onClick={handleCreateGame} disabled={isCreating || !user}>{isCreating ? "Creating..." : "Create"}</Button>{user && <p className="text-xs text-center text-muted-foreground">ID: {user.uid}</p>}</div>
          <div className="relative"><div className="absolute inset-0 flex items-center"><span className="w-full border-t" /></div><div className="relative flex justify-center text-xs uppercase"><span className="bg-card px-2 text-muted-foreground">Or</span></div></div>
          <div className="space-y-2"><Label htmlFor="gameId">Join with Game ID</Label><Input id="gameId" placeholder="Enter Game ID" value={gameIdInput} onChange={(e) => setGameIdInput(e.target.value)} /><Button variant="secondary" className="w-full" onClick={handleJoinGame} disabled={isJoining || !user}>{isJoining ? "Joining..." : "Join"}</Button></div>
        </CardContent>
      </Card>
    </div>
  );
}

// This component acts as a "wrapper" for an active game session.
function GameSession() {
  const { gameId } = useParams();
  const user = auth.currentUser;
  const appId = typeof __app_id !== 'undefined' ? __app_id : 'coup-dev';
  
  const { gameData, setGameData, takeAction, respondToAction } = useCoupLogic();
  
  const [error, setError] = useState(null);
  const [targeting, setTargeting] = useState({ isTargeting: false, actionType: null });

  useEffect(() => {
    if (!gameId || !user) return;
    const gameDocRef = doc(db, `artifacts/${appId}/public/data/coup-games`, gameId);
    const unsubscribe = onSnapshot(gameDocRef, (d) => {
      if (d.exists()) { 
        setGameData(d.data()); // Update local state with live data from Firestore
        setError(null); 
      } 
      else { setError("Game not found."); setGameData(null); }
    }, (err) => { console.error("Error:", err); setError("Connection error."); });
    return () => unsubscribe();
  }, [gameId, appId, user, setGameData]);

  const updateFirestore = async (newGameState) => {
    if (!newGameState) return;
    const gameDocRef = doc(db, `artifacts/${appId}/public/data/coup-games`, gameId);
    await updateDoc(gameDocRef, newGameState);
  };

  const handleStartGame = async () => {
    if (!gameData || gameData.hostId !== user.uid) return toast.error("Only host can start.");
    try { await startGame(gameId, gameData.players, appId); }
    catch (error) { console.error("Error:", error); toast.error("Failed to start game."); }
  };

  const handleAction = (actionType) => {
    if (!gameData || !user) return;
    if (['coup', 'assassinate', 'steal'].includes(actionType)) {
      setTargeting({ isTargeting: true, actionType });
    } else {
      const newGameState = takeAction(actionType);
      updateFirestore(newGameState);
    }
  };

  const handleSelectTarget = (targetUid) => {
    if (!targeting.isTargeting || !targeting.actionType || !gameData || !user) return;
    const newGameState = takeAction(targeting.actionType, targetUid);
    updateFirestore(newGameState);
    setTargeting({ isTargeting: false, actionType: null });
  };
  
  const handleCancelTargeting = () => setTargeting({ isTargeting: false, actionType: null });

  const handleResponseFromModal = (responseType, blockCharacter = null) => {
    if (!gameData || !user) return;
    const newGameState = respondToAction(responseType, blockCharacter);
    updateFirestore(newGameState);
  };
  
  const handleRestart = () => {
    // This logic will need to be adapted for Firestore
  };

  if (error) { return <div className="flex flex-col items-center justify-center p-4 min-h-screen"><h1 className="text-2xl text-destructive">{error}</h1><Link to="/play/coup"><Button className="mt-4">Back to Lobby</Button></Link></div>; }
  if (!gameData) { return <div className="flex items-center justify-center min-h-screen">Loading...</div> }
  
  const getPlayer = (uid) => gameData.players.find(p => p.uid === uid);
  const me = getPlayer(user.uid);
  
  let shouldShowResponseModal = false;
  if (gameData.pendingAction && me && !me.isOut) {
    const { actorUid, blocker, responses } = gameData.pendingAction;
    if (!responses[user.uid]) {
      if (blocker && actorUid === user.uid) shouldShowResponseModal = true;
      if (!blocker && actorUid !== user.uid) shouldShowResponseModal = true;
    }
  }

  if (gameData.status === 'finished') {
    return <GameOver winner={gameData.winner} currentUserId={user.uid} onRestart={handleRestart} />;
  }

  return (
    <div className="p-4 min-h-screen bg-gray-100">
      {gameData.status === 'waiting' && <WaitingRoom gameData={gameData} userId={user?.uid} onStartGame={handleStartGame} />}
      {gameData.status === 'playing' && 
        <GameTable 
          gameData={gameData} 
          userId={user?.uid} 
          onAction={handleAction}
        />
      }
      {targeting.isTargeting && (
        <TargetSelectionModal 
            players={gameData.players}
            currentUserUid={user.uid}
            actionType={targeting.actionType}
            onSelectTarget={handleSelectTarget}
            onCancel={handleCancelTargeting}
        />
      )}
      {shouldShowResponseModal && 
        <ResponseModal 
            pendingAction={{
                ...gameData.pendingAction,
                actorName: getPlayer(gameData.pendingAction.actorUid)?.name,
                targetName: gameData.pendingAction.targetUid ? getPlayer(gameData.pendingAction.targetUid)?.name : null,
                blockerName: gameData.pendingAction.blocker ? getPlayer(gameData.pendingAction.blocker.uid)?.name : null,
            }}
            onRespond={handleResponseFromModal}
            currentUser={me}
        />
      }
    </div>
  );
}

export function Coup() {
  const { gameId } = useParams();
  const [user, setUser] = useState(null);
  useEffect(() => { if(auth.currentUser) setUser(auth.currentUser); else signIn().then(() => setUser(auth.currentUser)); }, []);
  if (!user) { return <div className="flex items-center justify-center min-h-screen">Signing in...</div>; }
  
  return (
    <>
      <Toaster richColors position="top-right" />
      {gameId ? <GameSession /> : <CoupLobby />}
    </>
  );
}

