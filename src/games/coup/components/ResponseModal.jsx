import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { CHARACTERS } from "../hooks/useCoupLogic";

// A modal that allows players to respond to a pending action.
export function ResponseModal({ pendingAction, onRespond, currentUser }) {
  if (!pendingAction) return null;

  const { actorName, actionType, targetName, blocker } = pendingAction;
  
  // Determine if the current pending action is a block that can be challenged.
  const isRespondingToBlock = !!blocker;
  
  // Determine which blocks are possible against the initial action.
  const possibleBlocks = Object.values(CHARACTERS)
    .filter(c => c.blocks === actionType)
    .map(c => c.name);
  
  const canBlock = !isRespondingToBlock && possibleBlocks.length > 0 && pendingAction.actorUid !== currentUser.uid;

  return (
    <AlertDialog open={true}>
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle>Action in Progress!</AlertDialogTitle>
          <AlertDialogDescription>
            {isRespondingToBlock 
              ? <><strong>{blocker.blockerName}</strong> claims to have a <strong>{blocker.character}</strong> to block <strong>{actorName}</strong>'s action of <strong>{actionType}</strong>.</>
              : <><strong>{actorName}</strong> is attempting to use the action: <span className="font-bold">{actionType.replace('_', ' ')}</span>{targetName && ` on ${targetName}`}.</>
            }
            <br />
            How do you respond?
          </AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter>
          <AlertDialogCancel onClick={() => onRespond('allow')}>Allow</AlertDialogCancel>
          {canBlock && 
            possibleBlocks.map(char => 
              <AlertDialogAction key={char} onClick={() => onRespond('block', char)}>Block with {char}</AlertDialogAction>
            )
          }
          <AlertDialogAction onClick={() => onRespond('challenge')} className="bg-destructive hover:bg-destructive/90">
            Challenge
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
}

