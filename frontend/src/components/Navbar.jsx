import { Link } from 'react-router-dom';
import { Calendar, Ticket, ShieldCheck, Sparkles } from 'lucide-react';

export default function Navbar() {
  return (
    <nav className="bg-emerald-950 text-white border-b border-emerald-900 sticky top-0 z-50 shadow-md">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between h-16 items-center">
          
          <Link to="/" className="flex items-center space-x-2.5">
            <span className="p-2 bg-orange-500 text-white rounded-xl font-bold shadow-lg shadow-orange-500/30">
              <ShieldCheck className="w-5 h-5" />
            </span>
            <span className="text-xl font-extrabold text-white tracking-tight">EventOps</span>
          </Link>

          <div className="hidden md:flex items-center space-x-8">
            <Link to="/events" className="text-emerald-100 hover:text-orange-400 font-medium flex items-center space-x-1.5 transition-colors">
              <Calendar className="w-4 h-4" />
              <span>Events</span>
            </Link>
            <Link to="/marketplace" className="text-emerald-100 hover:text-orange-400 font-medium flex items-center space-x-1.5 transition-colors">
              <Ticket className="w-4 h-4" />
              <span>Marketplace</span>
            </Link>
          </div>

          <div className="flex items-center space-x-4">
            <Link to="/login" className="text-emerald-200 hover:text-white font-medium px-3 py-2 text-sm transition-colors">
              Sign In
            </Link>
            <Link to="/register" className="bg-orange-500 hover:bg-orange-600 text-white px-4 py-2.5 rounded-xl text-sm font-bold shadow-lg shadow-orange-500/25 transition-all flex items-center space-x-1.5 transform hover:-translate-y-0.5">
              <Sparkles className="w-4 h-4" />
              <span>Get Started</span>
            </Link>
          </div>

        </div>
      </div>
    </nav>
  );
}