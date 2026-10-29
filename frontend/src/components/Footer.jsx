import { Link } from 'react-router-dom';
import { ShieldCheck, Calendar, Ticket } from 'lucide-react';

export default function Footer() {
  return (
    <footer className="bg-emerald-950 text-white border-t border-emerald-900 mt-auto">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8 pb-8 border-b border-emerald-900/60">
          
          {/* Brand Info */}
          <div className="space-y-4 md:col-span-2">
            <Link to="/" className="flex items-center space-x-2">
              <span className="p-2 bg-orange-500 text-white rounded-lg font-bold shadow-md shadow-orange-500/20">
                <ShieldCheck className="w-5 h-5" />
              </span>
              <span className="text-xl font-bold text-white tracking-tight">EventOps</span>
            </Link>
            <p className="text-emerald-200/80 text-sm max-w-sm leading-relaxed">
              The premier platform for verified local event ticketing and vendor hiring, protected end-to-end by escrow funds guarantees.
            </p>
          </div>

          {/* Quick Links */}
          <div className="space-y-3">
            <h4 className="text-sm font-semibold uppercase tracking-wider text-orange-400">Navigation</h4>
            <ul className="space-y-2 text-sm text-emerald-200/80">
              <li>
                <Link to="/events" className="hover:text-orange-400 transition-colors flex items-center space-x-1.5">
                  <Calendar className="w-3.5 h-3.5" />
                  <span>Browse Events</span>
                </Link>
              </li>
              <li>
                <Link to="/marketplace" className="hover:text-orange-400 transition-colors flex items-center space-x-1.5">
                  <Ticket className="w-3.5 h-3.5" />
                  <span>Vendor Marketplace</span>
                </Link>
              </li>
            </ul>
          </div>

          {/* Security & Support */}
          <div className="space-y-3">
            <h4 className="text-sm font-semibold uppercase tracking-wider text-orange-400">Platform</h4>
            <ul className="space-y-2 text-sm text-emerald-200/80">
              <li>
                <Link to="/terms" className="hover:text-orange-400 transition-colors">
                  Escrow Policy
                </Link>
              </li>
              <li>
                <Link to="/support" className="hover:text-orange-400 transition-colors">
                  Help & Support
                </Link>
              </li>
            </ul>
          </div>

        </div>

        {/* Bottom Bar */}
        <div className="pt-6 flex flex-col sm:flex-row justify-between items-center text-xs text-emerald-300/70 space-y-3 sm:space-y-0">
          <p>© {new Date().getFullYear()} EventOps. All rights reserved.</p>
          <p className="font-medium text-emerald-200/90 tracking-wide">
            Securing live experiences, empowering organizers.
          </p>
        </div>
      </div>
    </footer>
  );
}