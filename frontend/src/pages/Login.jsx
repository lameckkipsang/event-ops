import React, { useState } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { useGoogleLogin } from '@react-oauth/google';
import { LogIn, Mail, Lock, ArrowRight } from 'lucide-react';
import { authService } from '../services/authApi';
import RoleSelectModal from '../components/RoleSelectModal';

export default function Login() {
  const navigate = useNavigate();
  const location = useLocation();
  const redirectData = location.state || {};

  const [formData, setFormData] = useState({ email: '', password: '' });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [showRoleModal, setShowRoleModal] = useState(false);
  const [pendingGoogleToken, setPendingGoogleToken] = useState(null);

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      const data = await authService.login(formData.email, formData.password);
      localStorage.setItem('access_token', data.access);
      localStorage.setItem('refresh_token', data.refresh);

      if (redirectData.returnTo) {
        navigate(redirectData.returnTo, { state: { item: redirectData.item, type: redirectData.type } });
      } else {
        navigate('/');
      }
    } catch (err) {
      console.error('Login error:', err);
      setError('Invalid email or password.');
    } finally {
      setLoading(false);
    }
  };

  const realGoogleLogin = useGoogleLogin({
    onSuccess: (tokenResponse) => {
      // tokenResponse.access_token is the real token returned by Google's servers
      setPendingGoogleToken(tokenResponse.access_token);
      setShowRoleModal(true); // Open modal to prompt first-time user role selection
    },
    onError: () => {
      setError('Google sign-in was unsuccessful. Please try again.');
    },
  });

  const handleRoleSelected = async (role) => {
    setShowRoleModal(false);
    setLoading(true);
    try {
      // Sends real Google access token and chosen role to backend endpoint (/api/auth/google/)
      const data = await authService.googleLogin(pendingGoogleToken, role);
      localStorage.setItem('access_token', data.access);
      localStorage.setItem('refresh_token', data.refresh);

      if (redirectData.returnTo) {
        navigate(redirectData.returnTo, { state: { item: redirectData.item, type: redirectData.type } });
      } else {
        navigate('/');
      }
    } catch (err) {
      console.error('Google OAuth backend validation error:', err);
      setError('Google authentication failed on the server. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-md mx-auto my-12 p-8 bg-emerald-900/60 border border-emerald-800/80 rounded-3xl shadow-2xl text-white">
      <div className="text-center mb-8">
        <div className="w-12 h-12 bg-orange-500/20 text-orange-400 border border-orange-500/30 rounded-2xl flex items-center justify-center mx-auto mb-3">
          <LogIn className="w-6 h-6" />
        </div>
        <h2 className="text-2xl font-bold">Welcome Back</h2>
        <p className="text-emerald-200/70 text-sm mt-1">Sign in to your EventOps account</p>
      </div>

      {redirectData.returnTo && (
        <div className="mb-6 p-3 bg-orange-950/60 border border-orange-800/80 rounded-xl text-orange-300 text-xs text-center">
          Please sign in to complete your checkout.
        </div>
      )}

      {error && (
        <div className="mb-6 p-3 bg-red-950/60 border border-red-800/80 rounded-xl text-red-300 text-xs text-center">
          {error}
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label className="block text-xs font-semibold text-emerald-300 mb-1.5">Email Address</label>
          <div className="relative">
            <Mail className="w-4 h-4 text-emerald-400 absolute left-3 top-3.5" />
            <input
              type="email"
              name="email"
              required
              value={formData.email}
              onChange={handleChange}
              placeholder="robin@gmail.com"
              className="w-full bg-emerald-950 border border-emerald-700/80 rounded-xl pl-10 pr-4 py-2.5 text-sm text-white placeholder-emerald-600 focus:outline-none focus:border-orange-500"
            />
          </div>
        </div>

        <div>
          <label className="block text-xs font-semibold text-emerald-300 mb-1.5">Password</label>
          <div className="relative">
            <Lock className="w-4 h-4 text-emerald-400 absolute left-3 top-3.5" />
            <input
              type="password"
              name="password"
              required
              value={formData.password}
              onChange={handleChange}
              placeholder="robin1"
              className="w-full bg-emerald-950 border border-emerald-700/80 rounded-xl pl-10 pr-4 py-2.5 text-sm text-white placeholder-emerald-600 focus:outline-none focus:border-orange-500"
            />
          </div>
        </div>

        <button
          type="submit"
          disabled={loading}
          className="w-full bg-orange-500 hover:bg-orange-600 text-white font-bold py-3 rounded-xl transition-all shadow-lg shadow-orange-500/20 flex items-center justify-center gap-2 mt-6"
        >
          {loading ? 'Signing In...' : 'Sign In'}
          <ArrowRight className="w-4 h-4" />
        </button>
      </form>

      <div className="relative my-6 text-center">
        <div className="absolute inset-0 flex items-center"><div className="w-full border-t border-emerald-800" /></div>
        <span className="relative bg-emerald-950 px-3 text-xs text-emerald-400/70 uppercase">Or continue with</span>
      </div>

      <button
        type="button"
        onClick={() => realGoogleLogin()}
        className="w-full bg-emerald-950 hover:bg-emerald-900 text-white font-semibold py-3 rounded-xl border border-emerald-700/80 transition-all flex items-center justify-center gap-3 text-sm shadow-md"
      >
        <svg className="w-5 h-5" viewBox="0 0 24 24">
          <path fill="#EA4335" d="M12 5c1.6 0 3 .6 4.1 1.6l3.1-3.1C17.3 1.8 14.8 1 12 1 7.4 1 3.5 3.6 1.6 7.4l3.7 2.9C6.2 7.1 8.9 5 12 5z"/>
          <path fill="#4285F4" d="M23.5 12.3c0-.8-.1-1.6-.2-2.3H12v4.5h6.5c-.3 1.5-1.1 2.8-2.4 3.7l3.7 2.9c2.2-2 3.7-5 3.7-8.8z"/>
          <path fill="#FBBC05" d="M5.3 14.7c-.2-.7-.4-1.5-.4-2.7s.2-2 .4-2.7L1.6 6.4C.6 8.4 0 10.6 0 13s.6 4.6 1.6 6.6l3.7-2.9z"/>
          <path fill="#34A853" d="M12 23c3.2 0 6-1.1 8-3l-3.7-2.9c-1.1.7-2.5 1.2-4.3 1.2-3.1 0-5.8-2.1-6.7-5.3L1.6 15.7C3.5 19.5 7.4 23 12 23 z"/>
        </svg>
        Sign in with Google
      </button>

      <p className="text-center text-xs text-emerald-300/70 mt-6">
        Don't have an account?{' '}
        <Link to="/register" className="text-orange-400 font-semibold hover:underline">
          Register
        </Link>
      </p>

      <RoleSelectModal
        isOpen={showRoleModal}
        onSubmit={handleRoleSelected}
        onCancel={() => setShowRoleModal(false)}
      />
    </div>
  );
}