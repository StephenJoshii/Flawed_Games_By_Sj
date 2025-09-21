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

// A modal that allows players to respond to a pending action (Challenge, Block, Allow).
export function ResponseModal({ pendingAction, onRespond }) {
  if (!pendingAction) return null;

  const { actorName, actionType, targetName } = pendingAction;
  
  // In a real game, you would add logic here to determine which blocks are possible.
  const canBlock = ['foreign_aid'].includes(actionType);

  return (
    <AlertDialog open={true}>
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle>Action Declared!</AlertDialogTitle>
          <AlertDialogDescription>
            {actorName} is attempting to use the action: <span className="font-bold">{actionType.replace('_', ' ')}</span>
            {targetName && ` on ${targetName}`}. How do you respond?
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

