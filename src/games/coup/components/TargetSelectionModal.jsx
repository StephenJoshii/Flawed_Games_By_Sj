import {
  AlertDialog,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogCancel,
  AlertDialogFooter
} from "@/components/ui/alert-dialog";
import { Button } from "@/components/ui/button";

// A modal for selecting a target player for an action.
export function TargetSelectionModal({ players, currentUserUid, actionType, onSelectTarget, onCancel }) {
  const validTargets = players.filter(p => p.uid !== currentUserUid && !p.isOut);

  return (
    <AlertDialog open={true} onOpenChange={onCancel}>
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle>Select a Target</AlertDialogTitle>
          <AlertDialogDescription>
            Choose a player to perform the action: <span className="font-bold">{actionType}</span>
          </AlertDialogDescription>
        </AlertDialogHeader>
        <div className="flex flex-col space-y-2 py-4">
          {validTargets.map(player => (
            <Button 
              key={player.uid}
              onClick={() => onSelectTarget(player.uid)}
              variant="outline"
            >
              {player.name}
            </Button>
          ))}
        </div>
        <AlertDialogFooter>
            <AlertDialogCancel onClick={onCancel}>Cancel Action</AlertDialogCancel>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
}
