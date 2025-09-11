import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import { HomePage } from "./pages/HomePage";
import { MomoTycoon } from "./games/momo-tycoon/MomoTycoon";

function App() {
  return (
    <main className="min-h-screen bg-background text-foreground font-sans antialiased">
      <Router>
        <Routes>
          <Route path="/" element={<HomePage />} />
          <Route path="/play/momo-tycoon" element={<MomoTycoon />} />
          {/* You will add routes for new games here in the future */}
        </Routes>
      </Router>
    </main>
  );
}

export default App;

