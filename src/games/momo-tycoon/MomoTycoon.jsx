import { Toaster, toast } from "sonner";
import { Header } from "./components/Header";
import { ActionsPanel } from "./components/ActionsPanel";
import { MomoCart } from "./components/MomoCart";
import { CustomerQueue } from "./components/CustomerQueue";
import { UpgradesPanel } from "./components/UpgradesPanel";
import { GameStatusModel } from "./components/GameStatusModel";
import { EventBanner } from "./components/EventBanner";
import { useGameLogic } from "./components/hooks/useGameLogic";

export function MomoTycoon() {
  const game = useGameLogic({ notify: toast });

  return (
    <>
      <Toaster richColors position="top-right" />
      <div className="max-w-7xl mx-auto p-4 md:p-8"> {/* Added padding for game view */}
        <Header
          money={game.money}
          momoStock={game.momoStock}
          day={game.day}
          dailyGoal={game.dailyGoal}
          moneyEarnedToday={game.moneyEarnedToday}
          reputation={game.reputation}
        />
        
        <EventBanner activeEvent={game.activeEvent} />

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="lg:col-span-1 space-y-6">
            <ActionsPanel
              flour={game.flour}
              filling={game.filling}
              onBuyIngredients={game.buyIngredients}
              onMakeMomo={game.makeMomo}
              makingProgress={game.makingProgress}
              isMakingMomo={game.isMakingMomo}
              onResetProgress={game.resetProgress}
            />
            <UpgradesPanel
              money={game.money}
              upgradeLevels={game.upgradeLevels}
              onPurchaseUpgrade={game.purchaseUpgrade}
            />
          </div>

          <div className="lg:col-span-2 space-y-6">
            <MomoCart />
            <CustomerQueue
              customers={game.customers}
              onServeCustomer={game.serveCustomer}
              lastServedInfo={game.lastServedInfo}
            />
          </div>
        </div>
      </div>
      <GameStatusModel
        gameState={game.gameState}
        onStartNextDay={game.startNextDay}
        onRestartGame={game.restartGame}
        day={game.day}
      />
    </>
  );
}

