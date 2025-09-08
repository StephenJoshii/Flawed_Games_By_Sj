import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle, CardDescription, CardFooter } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { ShoppingCart, ChefHat, Wheat, Leaf } from 'lucide-react';

// Reusable component for displaying ingredient stock
const IngredientStat = ({ name, value, icon: Icon }) => (
  <div className="flex items-center justify-between p-3 bg-secondary rounded-lg">
    <div className="flex items-center gap-3">
      <Icon className="h-5 w-5 text-muted-foreground" />
      <span className="font-medium">{name}</span>
    </div>
    <span className="font-bold text-lg">{value}</span>
  </div>
);

export function ActionsPanel({ flour, filling, isMakingMomo, onBuyIngredients, onMakeMomo }) {
  const canMakeMomo = flour > 0 && filling > 0;

  return (
    <Card>
      <CardHeader>
        <CardTitle>Game Controls</CardTitle>
        <CardDescription>Manage your momo business.</CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <div>
          <h3 className="text-sm font-medium mb-2 text-muted-foreground">Actions</h3>
          <div className="grid grid-cols-1 gap-2">
            <Button onClick={onBuyIngredients}>
              <ShoppingCart className="mr-2 h-4 w-4" /> Buy Ingredients (Rs. 25)
            </Button>
            <Button onClick={onMakeMomo} disabled={!canMakeMomo || isMakingMomo}>
              <ChefHat className="mr-2 h-4 w-4" /> {isMakingMomo ? "Making..." : "Make Momos (10 pcs)"}
            </Button>
          </div>
          {isMakingMomo && <Progress value={100} className="mt-2 h-2 animate-pulse" />}
        </div>

        <div>
          <h3 className="text-sm font-medium my-2 text-muted-foreground">Ingredient Stock</h3>
          <div className="space-y-2">
            <IngredientStat name="Flour" value={flour} icon={Wheat} />
            <IngredientStat name="Filling" value={filling} icon={Leaf} />
          </div>
        </div>
      </CardContent>
    </Card>
  );
}

