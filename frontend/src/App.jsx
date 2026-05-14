import { BrowserRouter as Router, Routes, Route, NavLink } from 'react-router-dom';
import { CloudSun, Wind, Bug } from 'lucide-react';
import Weather from './pages/Weather';
import AirQuality from './pages/AirQuality';
import Allergies from './pages/Allergies';
import './index.css';

function Navbar() {
  return (
    <nav className="navbar">
      <NavLink to="/" className={({ isActive }) => (isActive ? "nav-link active" : "nav-link")}>
        <CloudSun size={20} />
        <span>Weather</span>
      </NavLink>
      <NavLink to="/aqi" className={({ isActive }) => (isActive ? "nav-link active" : "nav-link")}>
        <Wind size={20} />
        <span>AQI</span>
      </NavLink>
      <NavLink to="/allergies" className={({ isActive }) => (isActive ? "nav-link active" : "nav-link")}>
        <Bug size={20} />
        <span>Allergies</span>
      </NavLink>
    </nav>
  );
}

function App() {
  return (
    <Router>
      <div className="main-layout">
        <Navbar />
        <Routes>
          <Route path="/" element={<Weather />} />
          <Route path="/aqi" element={<AirQuality />} />
          <Route path="/allergies" element={<Allergies />} />
        </Routes>
      </div>
    </Router>
  );
}

export default App;
