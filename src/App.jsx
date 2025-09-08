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
    <div className="bg-amber-50 min-h-screen text-gray-800 p-4 md:p-6 lg:p-8">
      <div className="max-w-7xl mx-auto">
        
        {/* The main header component */}
        <Header 
          money={money} 
          momoStock={momoStock} 
          day={day} 
        />
        
        {/* Main game area layout */}
        <main className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          
          {/* Left Panel: Player controls */}
          <div className="lg:col-span-1">
            <ActionsPanel 
              flour={flour}
              filling={filling}
              isMakingMomo={isMakingMomo}
              onBuyIngredients={buyIngredients}
              onMakeMomo={makeMomo}
            />
          </div>

          {/* Right Panel: Visuals and customer queue */}
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
