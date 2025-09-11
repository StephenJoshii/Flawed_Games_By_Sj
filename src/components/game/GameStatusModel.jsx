import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { PartyPopper, Frown } from "lucide-react";

export function GameStatusModel({ status, day, onNextDay, onRestart }) {
  const isOpen = status === 'day_complete' || status === 'game_over';

  const title = status === 'day_complete' ? `Day ${day} Complete!` : "Game Over";
  const Icon = status === 'day_complete' ? PartyPopper : Frown;
  const description = status === 'day_complete'
    ? "You've successfully met your sales goal for the day. Great job!"
    : "You've run out of money and ingredients to continue. Better luck next time!";
  const buttonText = status === 'day_complete' ? `Start Day ${day + 1}` : "Try Again";
  const buttonAction = status === 'day_complete' ? onNextDay : onRestart;

  return (
    <Dialog open={isOpen}>
      <DialogContent className="sm:max-w-[425px]" onInteractOutside={(e) => e.preventDefault()}>
        <DialogHeader className="items-center text-center">
          <Icon className="h-16 w-16 mb-4" />
          <DialogTitle className="text-2xl">{title}</DialogTitle>
          <DialogDescription>{description}</DialogDescription>
        </DialogHeader>
        <DialogFooter>
          <Button onClick={buttonAction} className="w-full">
            {buttonText}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
