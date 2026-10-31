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
        // If unauthorized, clear tokens and redirect to login
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

      <div className="flex items-center gap-6 pb-8 border-b border-emerald-800/80">
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
    </div>
  );
}