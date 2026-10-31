import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { User, Mail, Phone, Building, ShieldCheck, LogOut, Ticket } from 'lucide-react';
import api from '../services/api';

export default function Profile() {
  const navigate = useNavigate();
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    const fetchUserProfile = async () => {
      try {
        const response = await api.get('accounts/profile/');
        setUser(response.data);
      } catch (err) {
        console.error('Failed to fetch profile:', err);
        setError('Failed to load profile details. Please log in again.');
        if (err.response?.status === 401) {
          localStorage.removeItem('access_token');
          localStorage.removeItem('refresh_token');
          navigate('/login');
        }
      } finally {
        setLoading(false);
      }
    };

    fetchUserProfile();
  }, [navigate]);

  const handleLogout = () => {
    localStorage.removeItem('access_token');
    localStorage.removeItem('refresh_token');
    navigate('/login');
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center min-h-[60vh] text-emerald-300">
        <p>Loading profile...</p>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto my-12 p-8 bg-emerald-900/60 border border-emerald-800/80 rounded-3xl shadow-2xl text-white">
      {error && (
        <div className="mb-6 p-3 bg-red-950/60 border border-red-800/80 rounded-xl text-red-300 text-xs text-center">
          {error}
        </div>
      )}

      {/* Header section */}
      <div className="flex flex-col sm:flex-row items-center justify-between gap-6 pb-8 border-b border-emerald-800/80">
        <div className="flex items-center gap-6 text-center sm:text-left">
          <div className="w-20 h-20 bg-orange-500/20 text-orange-400 border border-orange-500/30 rounded-2xl flex items-center justify-center text-3xl font-bold shadow-lg">
            {user?.username ? user.username[0].toUpperCase() : <User className="w-10 h-10" />}
          </div>
          <div>
            <h1 className="text-2xl font-bold">{user?.username || 'EventOps User'}</h1>
            <p className="text-emerald-300/70 text-sm">{user?.email}</p>
            <span className="inline-block mt-2 px-3 py-1 bg-orange-500/20 text-orange-400 border border-orange-500/30 text-xs font-semibold rounded-full capitalize">
              Role: {user?.role || 'Attendee'}
            </span>
          </div>
        </div>

        <button
          onClick={handleLogout}
          className="flex items-center gap-2 bg-red-950/40 hover:bg-red-900/60 border border-red-800/60 text-red-300 px-4 py-2.5 rounded-xl text-sm font-semibold transition-all"
        >
          <LogOut className="w-4 h-4" />
          Sign Out
        </button>
      </div>

      {/* Details Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 mt-8">
        <div className="p-5 bg-emerald-950/60 border border-emerald-800/60 rounded-2xl flex items-center gap-4">
          <div className="w-10 h-10 bg-emerald-900/80 rounded-xl flex items-center justify-center text-emerald-400">
            <Mail className="w-5 h-5" />
          </div>
          <div>
            <p className="text-xs text-emerald-400 font-medium">Email Address</p>
            <p className="text-sm font-semibold text-white mt-0.5">{user?.email || 'Not provided'}</p>
          </div>
        </div>

        <div className="p-5 bg-emerald-950/60 border border-emerald-800/60 rounded-2xl flex items-center gap-4">
          <div className="w-10 h-10 bg-emerald-900/80 rounded-xl flex items-center justify-center text-emerald-400">
            <Phone className="w-5 h-5" />
          </div>
          <div>
            <p className="text-xs text-emerald-400 font-medium">Phone Number</p>
            <p className="text-sm font-semibold text-white mt-0.5">{user?.phone_number || 'Not provided'}</p>
          </div>
        </div>

        <div className="p-5 bg-emerald-950/60 border border-emerald-800/60 rounded-2xl flex items-center gap-4">
          <div className="w-10 h-10 bg-emerald-900/80 rounded-xl flex items-center justify-center text-emerald-400">
            <Building className="w-5 h-5" />
          </div>
          <div>
            <p className="text-xs text-emerald-400 font-medium">Company Name</p>
            <p className="text-sm font-semibold text-white mt-0.5">{user?.company_name || 'Independent / None'}</p>
          </div>
        </div>

        <div className="p-5 bg-emerald-950/60 border border-emerald-800/60 rounded-2xl flex items-center gap-4">
          <div className="w-10 h-10 bg-emerald-900/80 rounded-xl flex items-center justify-center text-emerald-400">
            <ShieldCheck className="w-5 h-5" />
          </div>
          <div>
            <p className="text-xs text-emerald-400 font-medium">Account Status</p>
            <p className="text-sm font-semibold text-white mt-0.5">
              {user?.is_verified ? 'Verified Account' : 'Standard Account'}
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}