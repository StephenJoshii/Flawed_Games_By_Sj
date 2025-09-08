import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";

// A reusable Ingredient display component
const Ingredient = ({ name, value, icon }) => (
  <div className="bg-gray-100 p-4 rounded-lg text-center">
    <p className="text-3xl">{icon}</p>
    <p className="font-semibold">{name}: {value}</p>
  </div>
);

export const ActionsPanel = ({ flour, filling, isMakingMomo, onBuyIngredients, onMakeMomo }) => {
  return (
    <Card className="border-2 border-gray-200 shadow-lg">
      <CardHeader>
        <CardTitle className="text-xl font-bold text-gray-800">Actions & Ingredients</CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="space-y-2">
          <Button 
            onClick={onMakeMomo} 
            disabled={isMakingMomo || flour < 1 || filling < 1} 
            className="w-full"
          >
            {isMakingMomo ? 'Making...' : 'Make Momos (10 pcs)'}
          </Button>
          {isMakingMomo && <Progress value={100} className="h-2 animate-pulse" />}
           <div className="text-sm text-gray-600 p-3 bg-blue-50 rounded-lg">
              <p><strong>Cost:</strong> 1 flour, 1 filling</p>
              <p><strong>Time:</strong> 3 seconds</p>
          </div>
        </div>

        <div className="space-y-2">
           <Button onClick={onBuyIngredients} className="w-full bg-green-500 hover:bg-green-600">
            Buy Ingredients (Rs. 25)
          </Button>
          <div className="text-sm text-gray-600 p-3 bg-green-50 rounded-lg">
              <p><strong>Yields:</strong> 5 flour, 5 fillings</p>
          </div>
        </div>
       
        <div className="grid grid-cols-2 gap-4 text-center pt-4">
          <Ingredient name="Flour" value={flour} icon="🌾" />
          <Ingredient name="Filling" value={filling} icon="🥬" />
        </div>
      </CardContent>
    </Card>
  );
};
