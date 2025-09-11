import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { ShoppingCart, CookingPot, Wheat, Beef, AlertTriangle } from "lucide-react";

export function ActionsPanel({
  flour,
  filling,
  isMakingMomo,
  makingProgress,
  onBuyIngredients,
  onMakeMomo,
  onResetProgress,
}) {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Actions</CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="flex items-center justify-around text-center">
          <div className="flex flex-col items-center">
            <Wheat className="h-8 w-8 text-yellow-600 mb-1" />
            <span className="font-bold text-lg">{flour}</span>
            <span className="text-xs text-muted-foreground">Flour</span>
          </div>
          <div className="flex flex-col items-center">
            <Beef className="h-8 w-8 text-red-600 mb-1" />
            <span className="font-bold text-lg">{filling}</span>
            <span className="text-xs text-muted-foreground">Filling</span>
          </div>
        </div>

        <Button onClick={onBuyIngredients} className="w-full">
          <ShoppingCart className="mr-2 h-4 w-4" /> Buy Ingredients (Rs. 25)
        </Button>

        <div>
          <Button onClick={onMakeMomo} disabled={isMakingMomo} className="w-full">
            <CookingPot className="mr-2 h-4 w-4" /> Make Momos (10 pcs)
          </Button>
          {isMakingMomo && (
            <Progress value={makingProgress} className="w-full h-2 mt-2" />
          )}
        </div>

        <Button onClick={onResetProgress} variant="destructive" className="w-full">
            <AlertTriangle className="mr-2 h-4 w-4" /> Reset Progress
        </Button>
      </CardContent>
    </Card>
  );
}

