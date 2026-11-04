import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import Navbar from './components/Navbar';
import Footer from './components/Footer';
import Home from './pages/Home';
import Events from './pages/Events';
import VendorMarketplace from './pages/VendorMarketplace';
import VendorDashboard from './pages/VendorDashboard';
import OrganizerBookings from './pages/OrganizerBookings';
import SecurityCheckIn from './pages/SecurityCheckIn';
import Login from './pages/Login';
import Register from './pages/Register';
import Profile from './pages/Profile';
import Payment from './pages/Payment';

export default function App() {
  return (
    <Router>
      <div className="min-h-screen flex flex-col bg-emerald-950 text-white font-sans selection:bg-orange-500">
        <Navbar />
        <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <Routes>
            <Route path="/" element={<Home />} />
            <Route path="/events" element={<Events />} />
            <Route path="/marketplace" element={<VendorMarketplace />} />
            <Route path="/vendor/dashboard" element={<VendorDashboard />} />
            <Route path="/organizer/bookings" element={<OrganizerBookings />} />
            <Route path="/security/check-in" element={<SecurityCheckIn />} />
            <Route path="/login" element={<Login />} />
            <Route path="/register" element={<Register />} />
            <Route path="/profile" element={<Profile />} />
            <Route path="/payment" element={<Payment />} />
          </Routes>
        </main>
        <Footer />
      </div>
    </Router>
  );
}