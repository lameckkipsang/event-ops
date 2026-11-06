import React, { useState, useEffect, useRef } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { Home, Calendar, Store, ShieldCheck, User, LogOut, LayoutDashboard, Bell } from 'lucide-react';
import { useToast } from '../contexts/ToastContext';
import api from '../services/api';

export default function Navbar() {
  const navigate = useNavigate();
  const location = useLocation();
  const { addToast } = useToast(); 

  const token = localStorage.getItem('access_token');
  const role = localStorage.getItem('user_role') || '';

  const [notifications, setNotifications] = useState([]);
  const [showDropdown, setShowDropdown] = useState(false);
  const dropdownRef = useRef(null);

  const fetchNotifications = async () => {
      if (token) {
        try {
            const res = await api.get('accounts/notifications/history/');
            setNotifications(res.data);
        } catch (err) {
            console.error("Failed fetching notifications", err);
        }
      }
  };

  useEffect(() => {
    fetchNotifications();
    const intervalId = setInterval(fetchNotifications, 30000);
    return () => clearInterval(intervalId);
  }, [token]);
  
  useEffect(() => {
    function handleClickOutside(event) {
        if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
            setShowDropdown(false);
        }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, [dropdownRef]);

  const handleMarkAsRead = async (id) => {
      try {
          // instantly clear the dot visually
          setNotifications(prev => prev.map(n => n.id === id ? {...n, is_read: true} : n));
          
          // Send the payload so the database actually updates
          await api.patch(`accounts/notifications/${id}/`, { is_read: true });
          
          await fetchNotifications(); 
      } catch(err) {
          console.error("Failed marking read", err);
      }
  };

  const handleMarkAllAsRead = async () => {
      try {
          const unreadNotifications = notifications.filter(n => !n.is_read);
          
          // instantly clear the dot visually
          setNotifications(prev => prev.map(n => ({...n, is_read: true})));
          
          // Safely map through unread notifications and update them concurrently 
          // because DRF doesn't support bulk PATCH on list endpoints by default
          await Promise.all(
              unreadNotifications.map(n => 
                  api.patch(`accounts/notifications/${n.id}/`, { is_read: true })
              )
          );
          
          await fetchNotifications(); 
      } catch(err) {
          console.error("Failed marking all as read", err);
      }
  };

  const handleLogout = () => {
    localStorage.clear();
    addToast({ title: 'Signed Out Successfully', message: 'You have been logged out securely.', type: 'success' });
    navigate('/login');
  };

  const isActive = (path) => location.pathname === path;
  const linkClass = (path) =>
    `flex items-center gap-1.5 px-3 py-2 rounded-xl text-xs font-bold transition-all ${
      isActive(path)
        ? 'bg-orange-500 text-white shadow-lg shadow-orange-500/20'
        : 'text-emerald-200 hover:bg-emerald-900/80 hover:text-white'
    }`;

  const unreadCount = notifications.filter(n => !n.is_read).length;

  return (
    <nav className="bg-emerald-950/90 border-b border-emerald-800/80 sticky top-0 z-50 backdrop-blur-md">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between h-16 items-center relative">
          
          <div className="flex items-center gap-3 z-10">
            <Link to="/" className="flex items-center gap-2">
              <div className="w-10 h-10 bg-orange-500 rounded-2xl flex items-center justify-center text-white font-black text-lg shadow-lg shadow-orange-500/30">
                EO
              </div>
            </Link>
            <div className="flex items-center cursor-default select-none">
              <span className="font-extrabold text-lg tracking-tight text-white">EventOps</span>
            </div>
          </div>

          <div className="hidden md:flex items-center gap-2 absolute left-1/2 -translate-x-1/2">
            <Link to="/" className={linkClass('/')}>
              <Home className="w-4 h-4" /> Home
            </Link>
            <Link to="/events" className={linkClass('/events')}>
              <Calendar className="w-4 h-4" /> Events
            </Link>
            <Link to="/marketplace" className={linkClass('/marketplace')}>
              <Store className="w-4 h-4" /> Marketplace
            </Link>

            {role === 'VENDOR' && (
              <Link to="/vendor/dashboard" className={linkClass('/vendor/dashboard')}>
                <LayoutDashboard className="w-4 h-4" /> Vendor Dashboard
              </Link>
            )}
            {role === 'ORGANIZER' && (
              <Link to="/organizer/bookings" className={linkClass('/organizer/bookings')}>
                <LayoutDashboard className="w-4 h-4" /> Manage Events
              </Link>
            )}

            {role === 'SECURITY' && (
              <Link to="/security/check-in" className={linkClass('/security/check-in')}>
                <ShieldCheck className="w-4 h-4" /> Gate Check-In
              </Link>
            )}
          </div>

          <div className="flex items-center gap-3 z-10">
            {token ? (
              <>
                <div className="relative" ref={dropdownRef}>
                  <button 
                    onClick={() => setShowDropdown(!showDropdown)}
                    className="p-2 text-emerald-200 hover:text-white relative rounded-xl hover:bg-emerald-900/80 transition-all"
                  >
                    <Bell className="w-5 h-5" />
                    {unreadCount > 0 && (
                      <span className="absolute top-1.5 right-1.5 w-2 h-2 bg-red-500 rounded-full"></span>
                    )}
                  </button>
                  
                  {showDropdown && (
                    <div className="absolute right-0 mt-2 w-80 bg-emerald-950 border border-emerald-800 rounded-xl shadow-2xl overflow-hidden z-50">
                      <div className="p-3 border-b border-emerald-800 bg-emerald-900/50 flex justify-between items-center">
                        <span className="text-xs font-bold text-emerald-300">Notifications</span>
                        <div className="flex gap-3 items-center">
                           {/* Mark all as read button */}
                           {unreadCount > 0 && (
                             <button onClick={handleMarkAllAsRead} className="text-[10px] font-semibold text-emerald-400 hover:text-white transition-colors">
                               Mark all read
                             </button>
                           )}
                           <Link to="/profile" state={{ activeTab: 'notifications' }} onClick={() => setShowDropdown(false)} className="text-[10px] text-orange-400 hover:underline">View All</Link>
                        </div>
                      </div>
                      <div className="max-h-80 overflow-y-auto">
                        {notifications.length === 0 ? (
                           <div className="p-4 text-center text-xs text-emerald-400/70">No new notifications</div>
                        ) : (
                          notifications.slice(0, 5).map(n => (
                            <div key={n.id} className={`p-3 border-b border-emerald-800/50 hover:bg-emerald-900/30 ${!n.is_read ? 'bg-emerald-900/40' : ''}`}>
                              <div className="flex justify-between items-start mb-1">
                                <p className="text-xs font-bold text-white">{n.title}</p>
                                {!n.is_read && (
                                   <button onClick={() => handleMarkAsRead(n.id)} className="text-[10px] text-emerald-400 hover:text-emerald-300">Mark read</button>
                                )}
                              </div>
                              <p className="text-[11px] text-emerald-300/80 mb-2">{n.message}</p>
                              {n.link && (
                                  <Link to={n.link} onClick={() => setShowDropdown(false)} className="text-[10px] text-orange-400 font-semibold hover:underline">View Details &rarr;</Link>
                              )}
                            </div>
                          ))
                        )}
                      </div>
                    </div>
                  )}
                </div>

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
                <Link to="/login" className="px-4 py-2 rounded-xl text-xs font-bold text-emerald-200 hover:bg-emerald-900/60 transition-all">Sign In</Link>
                <Link to="/register" className="px-4 py-2 rounded-xl text-xs font-bold bg-orange-500 hover:bg-orange-600 text-white shadow-lg shadow-orange-500/20 transition-all">Get Started</Link>
              </>
            )}
          </div>
        </div>
      </div>
    </nav>
  );
}