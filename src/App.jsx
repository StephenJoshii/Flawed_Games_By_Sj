import { Toaster, toast } from 'sonner';
import { useGameLogic } from "./hooks/useGameLogic";
import { Header } from "./components/game/Header";
import { ActionsPanel } from "./components/game/ActionsPanel";
import { MomoCart } from "./components/game/MomoCart";
import { CustomerQueue } from "./components/game/CustomerQueue";
import { UpgradesPanel } from "./components/game/UpgradesPanel";
import { GameStatusModal } from "./components/game/GameStatusModel";

function App() {
  const {
    money, flour, filling, momoStock, day, customers, isMakingMomo, makingProgress, lastServedInfo,
    upgradeLevels, gameState, dailyGoal, moneyEarnedToday,
    buyIngredients, makeMomo, serveCustomer, purchaseUpgrade, startNextDay, restartGame, resetProgress,
  } = useGameLogic({ notify: toast });

  return (
    <>
      <Toaster richColors position="top-right" />
      <GameStatusModal
        status={gameState}
        day={day}
        onNextDay={startNextDay}
        onRestart={restartGame}
      />
      <div className="bg-background text-foreground min-h-screen">
        <div className="container mx-auto p-4 max-w-4xl">
          <Header
            money={money}
            momoStock={momoStock}
            day={day}
            dailyGoal={dailyGoal}
            moneyEarnedToday={moneyEarnedToday}
          />
          <main className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="md:col-span-1 space-y-6">
              <ActionsPanel
                flour={flour}
                filling={filling}
                isMakingMomo={isMakingMomo}
                makingProgress={makingProgress}
                onBuyIngredients={buyIngredients}
                onMakeMomo={makeMomo}
                onResetProgress={resetProgress}
              />
              <UpgradesPanel
                upgradeLevels={upgradeLevels}
                money={money}
                onPurchaseUpgrade={purchaseUpgrade}
              />
            </div>
            <div className="md:col-span-2 space-y-6">
              <MomoCart />
              <CustomerQueue customers={customers} onServeCustomer={serveCustomer} lastServedInfo={lastServedInfo} />
            </div>
          </main>
        </div>
      </div>
    </>
  );
}

export default App;

