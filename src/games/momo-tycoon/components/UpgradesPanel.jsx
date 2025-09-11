import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";
import { UPGRADES_CONFIG } from "@/games/momo-tycoon/components/hooks/useGameLogic";
import { Gauge, Leaf, ShoppingCart, Info } from "lucide-react";

const ICONS = {
  steamer: <Gauge className="h-5 w-5" />,
  filling: <Leaf className="h-5 w-5" />,
  cart: <ShoppingCart className="h-5 w-5" />,
};

const UpgradeItem = ({ upgrade, level, money, onPurchase }) => {
  const isMaxLevel = level >= upgrade.maxLevel;
  const cost = isMaxLevel ? 0 : upgrade.getCost(level);
  const canAfford = money >= cost;

  return (
    <div className="flex items-center justify-between gap-3 p-2 rounded-lg hover:bg-secondary">
      <div className="flex items-center gap-3">
        {ICONS[upgrade.id]}
        <div>
          <div className="flex items-center gap-1.5">
            <p className="font-semibold">{upgrade.name}</p>
            <TooltipProvider delayDuration={100}>
              <Tooltip>
                <TooltipTrigger>
                  <Info className="h-3 w-3 text-muted-foreground cursor-help" />
                </TooltipTrigger>
                <TooltipContent>
                  <p>{upgrade.description}</p>
                </TooltipContent>
              </Tooltip>
            </TooltipProvider>
          </div>
          <p className="text-sm text-muted-foreground">
            Level {level} / {upgrade.maxLevel}
          </p>
        </div>
      </div>

      <Button
        size="sm"
        variant="outline"
        disabled={isMaxLevel || !canAfford}
        onClick={() => onPurchase(upgrade.id)}
        className="w-28"
      >
        {isMaxLevel ? "Max Level" : `Rs. ${cost}`}
      </Button>
    </div>
  );
};

export function UpgradesPanel({ upgradeLevels, money, onPurchaseUpgrade }) {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Upgrades</CardTitle>
      </CardHeader>
      <CardContent className="space-y-2">
        {Object.values(UPGRADES_CONFIG).map((upgrade) => (
          <UpgradeItem
            key={upgrade.id}
            upgrade={upgrade}
            level={upgradeLevels[upgrade.id]}
            money={money}
            onPurchase={onPurchaseUpgrade}
          />
        ))}
      </CardContent>
    </Card>
  );
}
