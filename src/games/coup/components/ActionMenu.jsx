import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

// Displays the available actions for the current player.
export function ActionMenu({ player, onAction }) {
  const canAfford = (cost) => player.coins >= cost;
  // A player must coup if they have 10 or more coins.
  const mustCoup = player.coins >= 10;

  return (
    <Card>
      <CardHeader>
        <CardTitle>Your Turn: Actions</CardTitle>
      </CardHeader>
      <CardContent className="grid grid-cols-2 gap-2">
        <Button onClick={() => onAction('income')} disabled={mustCoup}>Income (+1 coin)</Button>
        <Button onClick={() => onAction('foreign_aid')} disabled={mustCoup}>Foreign Aid (+2 coins)</Button>
        <Button onClick={() => onAction('tax')} disabled={mustCoup}>Tax (Duke)</Button>
        <Button onClick={() => onAction('steal')} disabled={mustCoup}>Steal (Captain)</Button>
        <Button onClick={() => onAction('assassinate')} disabled={mustCoup || !canAfford(3)}>Assassinate (Assassin)</Button>
        <Button onClick={() => onAction('exchange')} disabled={mustCoup}>Exchange (Ambassador)</Button>
        <Button variant="destructive" className="col-span-2" onClick={() => onAction('coup')} disabled={!canAfford(7)}>
          Coup (-7 coins)
        </Button>
      </CardContent>
    </Card>
  );
}

