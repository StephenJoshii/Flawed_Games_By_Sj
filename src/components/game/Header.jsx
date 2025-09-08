import { Card, CardContent } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { Coins, Package, Sun } from "lucide-react";

export function Header({ money, momoStock, day, dailyGoal, moneyEarnedToday }) {
  const goalProgress = Math.min((moneyEarnedToday / dailyGoal) * 100, 100);

  return (
    <header className="mb-6">
      <Card>
        <CardContent className="p-4 flex flex-col sm:flex-row justify-between items-center gap-4">
          <div className="flex items-center gap-6">
            <div className="flex items-center gap-2">
              <Coins className="h-6 w-6 text-yellow-500" />
              <span className="text-xl font-bold">Rs. {money}</span>
            </div>
            <div className="flex items-center gap-2">
              <Package className="h-6 w-6 text-orange-500" />
              <span className="text-xl font-bold">{momoStock}</span>
            </div>
            <div className="flex items-center gap-2">
              <Sun className="h-6 w-6 text-blue-500" />
              <span className="text-xl font-bold">Day {day}</span>
            </div>
          </div>
          <div className="w-full sm:w-64">
            <div className="flex justify-between text-sm mb-1">
              <span className="font-semibold">Daily Goal</span>
              <span className="text-muted-foreground">Rs. {moneyEarnedToday} / {dailyGoal}</span>
            </div>
            <Progress value={goalProgress} className="h-3" />
          </div>
        </CardContent>
      </Card>
    </header>
  );
}

