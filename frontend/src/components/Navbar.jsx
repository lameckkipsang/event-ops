import React from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { Calendar, Store, ShieldCheck, User, LogOut, Ticket, LayoutDashboard } from 'lucide-react';

export default function Navbar() {
  const navigate = useNavigate();
  const location = useLocation();

  const token = localStorage.getItem('access_token');
  const role = localStorage.getItem('user_role') || '';

  const handleLogout = () => {
    localStorage.clear();
    navigate('/login');
  };

  const isActive = (path) => location.pathname === path;
  const linkClass = (path) =>
    `flex items-center gap-1.5 px-3 py-2 rounded-xl text-xs font-bold transition-all ${
      isActive(path)
        ? 'bg-orange-500 text-white shadow-lg shadow-orange-500/20'
        : 'text-emerald-200 hover:bg-emerald-900/80 hover:text-white'
    };`;

  return (
    <nav className="bg-emerald-950/90 border-b border-emerald-800/80 sticky top-0 z-50 backdrop-blur-md">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between h-16 items-center">
          <div className="flex items-center gap-8">
            <Link to="/" className="flex items-center gap-2">
              <div className="w-10 h-10 bg-orange-500 rounded-2xl flex items-center justify-center text-white font-black text-lg shadow-lg shadow-orange-500/30">
                EO
              </div>
              <span className="font-extrabold text-lg tracking-tight text-white">EventOps</span>
            </Link>

            <div className="hidden md:flex items-center gap-2">
              <Link to="/events" className={linkClass('/events')}>
                <Calendar className="w-4 h-4" /> Events
              </Link>
              <Link to="/marketplace" className={linkClass('/marketplace')}>
                <Store className="w-4 h-4" /> Marketplace
              </Link>

              {/* Conditional Role-Based Links */}
              {role === 'VENDOR' && (
                <Link to="/vendor/dashboard" className={linkClass('/vendor/dashboard')}>
                  <LayoutDashboard className="w-4 h-4" /> Vendor Dashboard
                </Link>
              )}

              {role === 'SECURITY' && (
                <Link to="/security/check-in" className={linkClass('/security/check-in')}>
                  <ShieldCheck className="w-4 h-4" /> Gate Check-In
                </Link>
              )}
            </div>
          </div>

          <div className="flex items-center gap-3">
            {token ? (
              <>
                <Link to="/profile" className={linkClass('/profile')}>
                  <User className="w-4 h-4" /> Profile
                </Link>
                <button
                  onClick={handleLogout}
                  className="flex items-center gap-1.5 px-3 py-2 rounded-xl text-xs font-bold bg-red-950/60 border border-red-800/80 text-red-300 hover:bg-red-900/80 transition-all"
                >
                  <LogOut className="w-4 h-4" /> Logout
                </button>
              </>
            ) : (
              <>
                <Link
                  to="/login"
                  className="px-4 py-2 rounded-xl text-xs font-bold text-emerald-200 hover:bg-emerald-900/60 transition-all"
                >
                  Sign In
                </Link>
                <Link
                  to="/register"
                  className="px-4 py-2 rounded-xl text-xs font-bold bg-orange-500 hover:bg-orange-600 text-white shadow-lg shadow-orange-500/20 transition-all"
                >
                  Get Started
                </Link>
              </>
            )}
          </div>
        </div>
      </div>
    </nav>
  );
}