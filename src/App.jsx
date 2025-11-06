import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import { HomePage } from "./pages/HomePage.jsx";
import { MomoTycoon } from "./games/momo-tycoon/MomoTycoon.jsx";
import { Game2048 } from "./games/twenty48/Game2048.jsx";
import { BaghChal } from "./games/bagh-chal/BaghChal.jsx";
import { Coup } from "./games/coup/Coup.jsx";
import { Snake } from "./games/snake/snake.jsx";
import NepalGeoGuesser from "./games/nepal-guesser/NepalGeoGuesser.jsx";

function App() {
  return (
    <main className="min-h-screen bg-background text-foreground font-sans antialiased">
      <Router>
        <Routes>
          <Route path="/" element={<HomePage />} />
          <Route path="/play/momo-tycoon" element={<MomoTycoon />} />
          <Route path="/play/2048" element={<Game2048 />} />
          <Route path="/play/bagh-chal" element={<BaghChal />} />
          <Route path="/play/coup" element={<Coup />} />
          <Route path="/play/coup/:gameId" element={<Coup />} />
          <Route path="/play/snake" element={<Snake />} />
          <Route path="/play/nepal-guesser" element={<NepalGeoGuesser />} />
        </Routes>
      </Router>
    </main>
  );
}

export default App;

