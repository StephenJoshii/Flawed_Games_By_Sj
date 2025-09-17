import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import { HomePage } from "./pages/HomePage";
import { MomoTycoon } from "./games/momo-tycoon/MomoTycoon";
import { Twenty48 } from "./games/twenty48/Twenty48";
import { BaghChal } from "./games/bagh-chal/BaghChal";
import { Coup } from "./games/coup/Coup";

function App() {
  return (
    <main className="min-h-screen bg-background text-foreground font-sans antialiased">
      <Router>
        <Routes>
          <Route path="/" element={<HomePage />} />
          <Route path="/play/momo-tycoon" element={<MomoTycoon />} />
          <Route path="/play/2048" element={<Twenty48 />} />
          <Route path="/play/bagh-chal" element={<BaghChal />} />
          <Route path="/play/coup" element={<Coup />} />
          <Route path="/play/coup/:gameId" element={<Coup />} />
        </Routes>
      </Router>
    </main>
  );
}

export default App;

