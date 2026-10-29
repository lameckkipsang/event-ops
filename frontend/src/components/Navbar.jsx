import { Link } from 'react-router-dom';
import { Calendar, Ticket, User, ShieldCheck } from 'lucide-react';

export default function Navbar() {
  return (
    <nav className="bg-white border-b border-gray-100 sticky top-0 z-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between h-16 items-center">
        
          <Link to="/" className="flex items-center space-x-2">
            <span className="p-2 bg-emerald-600 text-white rounded-lg font-bold">
              <ShieldCheck className="w-5 h-5" />
            </span>
            <span className="text-xl font-bold text-gray-900 tracking-tight">EventOps</span>
          </Link>

          <div className="hidden md:flex items-center space-x-8">
            <Link to="/events" className="text-gray-600 hover:text-emerald-600 font-medium flex items-center space-x-1">
              <Calendar className="w-4 h-4 mr-1" />
              <span>Events</span>
            </Link>
            <Link to="/marketplace" className="text-gray-600 hover:text-emerald-600 font-medium flex items-center space-x-1">
              <Ticket className="w-4 h-4 mr-1" />
              <span>Marketplace</span>
            </Link>
          </div>

          <div className="flex items-center space-x-4">
            <Link to="/login" className="text-gray-600 hover:text-gray-900 font-medium px-3 py-2 text-sm">
              Sign In
            </Link>
            <Link to="/register" className="bg-emerald-600 hover:bg-emerald-700 text-white px-4 py-2 rounded-lg text-sm font-medium transition-colors">
              Get Started
            </Link>
          </div>

        </div>
      </div>
    </nav>
  );
}