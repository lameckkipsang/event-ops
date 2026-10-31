import React from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { ShieldCheck, User, LogOut } from 'lucide-react';

export default function Navbar() {
  const navigate = useNavigate();
  const isAuthenticated = !!localStorage.getItem('access_token');

  const handleLogout = () => {
    localStorage.removeItem('access_token');
    localStorage.removeItem('refresh_token');
    navigate('/login');
  };

  return (
    <nav className="bg-emerald-900/40 backdrop-blur-md border-b border-emerald-800/60 sticky top-0 z-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
        {/* Logo */}
        <Link to="/" className="flex items-center gap-2 font-bold text-xl text-white">
          <div className="w-10 h-10 bg-orange-500 rounded-xl flex items-center justify-center shadow-lg shadow-orange-500/30">
            <ShieldCheck className="w-6 h-6 text-white" />
          </div>
          EventOps
        </Link>

        {/* Nav Links */}
        <div className="hidden md:flex items-center gap-8 text-sm font-medium text-emerald-200">
          <Link to="/events" className="hover:text-orange-400 transition-colors">Events</Link>
          <Link to="/marketplace" className="hover:text-orange-400 transition-colors">Marketplace</Link>
        </div>

        {/* Auth Actions */}
        <div className="flex items-center gap-3">
          {isAuthenticated ? (
            <>
              <Link
                to="/profile"
                className="flex items-center gap-2 bg-emerald-800/60 hover:bg-emerald-800 border border-emerald-700/80 text-white px-4 py-2 rounded-xl text-sm font-semibold transition-all"
              >
                <User className="w-4 h-4 text-orange-400" />
                Profile
              </Link>
              <button
                onClick={handleLogout}
                className="flex items-center gap-1.5 text-emerald-300 hover:text-red-400 px-3 py-2 text-sm font-semibold transition-colors"
                title="Sign Out"
              >
                <LogOut className="w-4 h-4" />
              </button>
            </>
          ) : (
            <>
              <Link
                to="/login"
                className="text-white hover:text-orange-400 px-4 py-2 text-sm font-semibold transition-colors"
              >
                Sign In
              </Link>
              <Link
                to="/register"
                className="bg-orange-500 hover:bg-orange-600 text-white px-4 py-2 rounded-xl text-sm font-semibold transition-all shadow-lg shadow-orange-500/20"
              >
                Get Started
              </Link>
            </>
          )}
        </div>
      </div>
    </nav>
  );
}