import React, { useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Lock, ArrowRight, CheckCircle2, Loader2, XCircle } from 'lucide-react';
import api from '../services/api';

export default function ResetPasswordConfirm() {
  // Extract uid and token directly from the Vercel URL
  const { uid, token } = useParams();
  const navigate = useNavigate();
  
  const [passwords, setPasswords] = useState({ new_password1: '', new_password2: '' });
  const [status, setStatus] = useState('idle'); // idle | loading | success | error
  const [error, setError] = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (passwords.new_password1 !== passwords.new_password2) {
      setError("Passwords do not match.");
      return;
    }
    
    setStatus('loading');
    setError('');
    
    try {
      // Securely POST the data to the backend API without the uid/token in the URL path
      await api.post(`auth/password/reset/confirm/`, {
        uid: uid,
        token: token,
        new_password1: passwords.new_password1,
        new_password2: passwords.new_password2,
      });
      setStatus('success');
    } catch (err) {
      const data = err.response?.data;
      
      // Catch and display exact Django validation errors
      const errorMessage = 
        data?.non_field_errors?.[0] || 
        data?.detail || 
        data?.new_password1?.[0] || 
        data?.new_password?.[0] || 
        "Invalid or expired reset link. Please request a new one.";

      setError(errorMessage);
      setStatus('error');
    }
  };

  return (
    <div className="min-h-[calc(100vh-4rem)] flex items-center justify-center bg-emerald-950 p-4">
      <div className="max-w-md w-full bg-[#022c22] border border-emerald-800 rounded-3xl p-8 shadow-2xl">
        <div className="text-center mb-8">
          <div className="w-12 h-12 bg-orange-500/20 text-orange-400 border border-orange-500/30 rounded-2xl flex items-center justify-center mx-auto mb-4">
            <Lock className="w-6 h-6" />
          </div>
          <h2 className="text-2xl font-bold text-white">Create New Password</h2>
          <p className="text-emerald-300 text-sm mt-2">Enter your new secure password below.</p>
        </div>

        {status === 'success' ? (
          <div className="text-center space-y-5">
            <CheckCircle2 className="w-16 h-16 text-emerald-400 mx-auto" />
            <h3 className="text-xl font-bold text-white">Password Reset!</h3>
            <p className="text-sm text-emerald-200">Your password has been successfully updated.</p>
            <button
              onClick={() => navigate('/login')}
              className="w-full bg-orange-500 hover:bg-orange-600 text-white font-bold py-3.5 rounded-xl transition-all shadow-lg"
            >
              Back to Login
            </button>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="space-y-5">
            {error && (
              <div className="p-3 bg-red-950/60 border border-red-800/80 rounded-xl flex items-start gap-3">
                <XCircle className="w-5 h-5 text-red-400 shrink-0 mt-0.5" />
                <p className="text-xs text-red-300 leading-relaxed">{error}</p>
              </div>
            )}

            <div>
              <label className="block text-xs font-semibold text-emerald-300 mb-2">New Password</label>
              <input
                type="password"
                required
                value={passwords.new_password1}
                onChange={(e) => setPasswords({ ...passwords, new_password1: e.target.value })}
                placeholder="••••••••"
                className="w-full bg-emerald-950/50 border border-emerald-800 rounded-xl px-4 py-3 text-sm text-white placeholder-emerald-700 focus:outline-none focus:border-orange-500 tracking-widest"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-emerald-300 mb-2">Confirm New Password</label>
              <input
                type="password"
                required
                value={passwords.new_password2}
                onChange={(e) => setPasswords({ ...passwords, new_password2: e.target.value })}
                placeholder="••••••••"
                className="w-full bg-emerald-950/50 border border-emerald-800 rounded-xl px-4 py-3 text-sm text-white placeholder-emerald-700 focus:outline-none focus:border-orange-500 tracking-widest"
              />
            </div>

            <button
              type="submit"
              disabled={status === 'loading'}
              className="w-full bg-orange-500 hover:bg-orange-600 disabled:opacity-50 text-white font-bold py-3.5 rounded-xl transition-all flex justify-center items-center gap-2 mt-2 shadow-lg shadow-orange-500/20"
            >
              {status === 'loading' ? <Loader2 className="w-5 h-5 animate-spin" /> : 'Update Password'}
              {status !== 'loading' && <ArrowRight className="w-4 h-4" />}
            </button>
          </form>
        )}
      </div>
    </div>
  );
}