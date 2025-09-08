// --- Core Imports ---
import { useGameLogic } from "./hooks/useGameLogic";

// --- UI Component Imports ---
import { Header } from "./components/game/Header";
import { ActionsPanel } from "./components/game/ActionsPanel";
import { MomoCart } from "./components/game/MomoCart";
import { CustomerQueue } from "./components/game/CustomerQueue";

function App() {
  // Initialize our game's brain. All state and actions come from here.
  const {
    money,
    flour,
    filling,
    momoStock,
    day,
    customers,
    isMakingMomo,
    buyIngredients,
    makeMomo,
    serveCustomer,
    CONSTANTS,
  } = useGameLogic();

  return (
    // The main container now uses the new 'bg-background' color and 'font-sans'
    <div className="bg-background min-h-screen font-sans text-foreground p-4 md:p-6 lg:p-8">
      <div className="max-w-7xl mx-auto">
        
        <Header 
          money={money} 
          momoStock={momoStock} 
          day={day} 
        />
        
        <main className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          
          <div className="lg:col-span-1">
            <ActionsPanel 
              flour={flour}
              filling={filling}
              isMakingMomo={isMakingMomo}
              onBuyIngredients={buyIngredients}
              onMakeMomo={makeMomo}
            />
          </div>

          <div className="lg:col-span-2 space-y-6">
            <MomoCart />
            <CustomerQueue 
              customers={customers} 
              onServeCustomer={serveCustomer}
              maxPatience={CONSTANTS.CUSTOMER_PATIENCE_SECONDS}
            />
          </div>
          
        </main>
      </div>
    </div>
  )
}

export default App

