import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import Dashboard from './pages/Dashboard';
import PhysicsDerivations from './pages/PhysicsDerivations';
import PhysicsNumericals from './pages/PhysicsNumericals';
import Math from './pages/Math';
import Programming from './pages/Programming';

export default function App() {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<Dashboard />} />
        <Route path="/physics/derivations" element={<PhysicsDerivations />} />
        <Route path="/physics/numericals" element={<PhysicsNumericals />} />
        <Route path="/math" element={<Math />} />
        <Route path="/programming" element={<Programming />} />
      </Routes>
    </Router>
  );
}
