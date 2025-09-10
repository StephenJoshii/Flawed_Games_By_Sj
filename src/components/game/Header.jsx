import { Card, CardContent } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { Coins, Package, CalendarDays, Star } from "lucide-react";

export function Header({ money, momoStock, day, dailyGoal, moneyEarnedToday, reputation }) {
  const goalProgress = (moneyEarnedToday / dailyGoal) * 100;

  const getReputationColor = () => {
    if (reputation > 75) return "text-yellow-400";
    if (reputation > 40) return "text-orange-400";
    return "text-red-500";
  };

  return (
    <header className="mb-6">
      <Card>
        <CardContent className="pt-6">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-center">
            <div className="flex flex-col items-center">
              <Coins className="h-8 w-8 text-yellow-500 mb-1" />
              <span className="font-bold text-lg">Rs. {money}</span>
              <span className="text-xs text-muted-foreground">Cash</span>
            </div>
            <div className="flex flex-col items-center">
              <Package className="h-8 w-8 text-amber-600 mb-1" />
              <span className="font-bold text-lg">{momoStock}</span>
              <span className="text-xs text-muted-foreground">Momo Stock</span>
            </div>
            <div className="flex flex-col items-center">
              <CalendarDays className="h-8 w-8 text-blue-500 mb-1" />
              <span className="font-bold text-lg">Day {day}</span>
              <span className="text-xs text-muted-foreground">Progress</span>
            </div>
            <div className="flex flex-col items-center">
              <Star className={`h-8 w-8 ${getReputationColor()} mb-1`} />
              <span className="font-bold text-lg">{Math.round(reputation || 0)} / 100</span>
              <span className="text-xs text-muted-foreground">Reputation</span>
            </div>
          </div>
          <div className="mt-4">
            <div className="flex justify-between items-center mb-1">
              <span className="text-sm font-medium">Daily Goal</span>
              <span className="text-sm font-medium text-muted-foreground">
                Rs. {moneyEarnedToday} / {dailyGoal}
              </span>
            </div>
            <Progress value={goalProgress} className="w-full h-2" />
          </div>
        </CardContent>
      </Card>
    </header>
  );
}

