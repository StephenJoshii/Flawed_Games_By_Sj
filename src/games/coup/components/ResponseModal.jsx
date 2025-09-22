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

// A modal that allows players to respond to a pending action.
export function ResponseModal({ pendingAction, onRespond }) {
  if (!pendingAction) return null;

  const { actorName, actionType, targetName, blockerName } = pendingAction;
  
  // Determine if the current pending action is a block that can be challenged.
  const isRespondingToBlock = !!blockerName;

  // Determine which blocks are possible against the initial action.
  const canBlock = !isRespondingToBlock && ['foreign_aid', 'assassinate', 'steal'].includes(actionType);

  return (
    <AlertDialog open={true}>
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle>Action in Progress!</AlertDialogTitle>
          <AlertDialogDescription>
            {isRespondingToBlock 
              ? <><strong>{blockerName}</strong> is attempting to block <strong>{actorName}</strong>'s action of <strong>{actionType}</strong>.</>
              : <><strong>{actorName}</strong> is attempting to use the action: <span className="font-bold">{actionType.replace('_', ' ')}</span>{targetName && ` on ${targetName}`}.</>
            }
            <br />
            How do you respond?
          </AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter>
          <AlertDialogCancel onClick={() => onRespond('allow')}>Allow</AlertDialogCancel>
          {canBlock && <AlertDialogAction onClick={() => onRespond('block')}>Block</AlertDialogAction>}
          <AlertDialogAction onClick={() => onRespond('challenge')} className="bg-destructive hover:bg-destructive/90">
            Challenge
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
}

