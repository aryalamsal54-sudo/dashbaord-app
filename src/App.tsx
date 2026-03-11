import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { ThemeProvider } from './context/ThemeContext';
import Dashboard from './pages/Dashboard';
import PhysicsDerivations from './pages/PhysicsDerivations';
import PhysicsNumericals from './pages/PhysicsNumericals';
import Math from './pages/Math';
import Programming from './pages/Programming';
import Electrical from './pages/Electrical';

export default function App() {
  return (
    <ThemeProvider>
      <Router>
        <Routes>
          <Route path="/" element={<Dashboard />} />
          <Route path="/physics/derivations" element={<PhysicsDerivations />} />
          <Route path="/physics/numericals" element={<PhysicsNumericals />} />
          <Route path="/math" element={<Math />} />
          <Route path="/programming" element={<Programming />} />
          <Route path="/electrical" element={<Electrical />} />
        </Routes>
      </Router>
    </ThemeProvider>
  );
}
