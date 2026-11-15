import React, { useState } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { useGoogleLogin } from '@react-oauth/google';
import { Mail, Lock, ArrowRight, Check } from 'lucide-react';
import { authService } from '../services/authApi';
import { useToast } from '../contexts/ToastContext'; 

export default function Login() {
  const navigate = useNavigate();
  const location = useLocation();
  const redirectData = location.state || {};
  
  const { addToast } = useToast(); 

  const [formData, setFormData] = useState({ email: '', password: '' });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

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
      localStorage.setItem('user_id', data.user_id);
      localStorage.setItem('username', data.username);
      localStorage.setItem('user_role', data.role);

      addToast({ 
        title: 'Login Successful', 
        message: 'Welcome back to EventOps!', 
        type: 'success' 
      });

      if (redirectData.returnTo) {
        navigate(redirectData.returnTo, { state: { item: redirectData.item, type: redirectData.type } });
      } else {
        navigate('/');
      }
    } catch (err) {
      if (err.response?.status !== 400 && err.response?.status !== 401) {
        console.error('Login error:', err);
      }
      setError('Invalid email or password.');
      addToast({ title: 'Login Failed', message: 'Invalid credentials. Try again.', type: 'error' });
    } finally {
      setLoading(false);
    }
  };

  // Direct Login without the Role Modal
  const realGoogleLogin = useGoogleLogin({
    onSuccess: async (tokenResponse) => {
      setLoading(true);
      setError('');
      try {
        // Pass role = null and isRegister = false
        const data = await authService.googleLogin(tokenResponse.access_token, null, false);
        
        localStorage.setItem('access_token', data.access);
        localStorage.setItem('refresh_token', data.refresh);
        if (data.user?.pk) localStorage.setItem('user_id', data.user.pk);
        if (data.user?.username) localStorage.setItem('username', data.user.username);
        localStorage.setItem('user_role', data.user?.role || data.role);

        addToast({ 
          title: 'Google Login Successful', 
          message: 'Welcome back to EventOps!', 
          type: 'success' 
        });

        if (redirectData.returnTo) {
          navigate(redirectData.returnTo, { state: { item: redirectData.item, type: redirectData.type } });
        } else {
          navigate('/');
        }
      } catch (err) {
        console.error('Google OAuth error:', err);
        setError(err.response?.data?.error || 'Google authentication failed. Please try again.');
      } finally {
        setLoading(false);
      }
    },
    onError: () => {
      setError('Google sign-in was unsuccessful. Please try again.');
    },
  });

  return (
    <div className="flex flex-col md:flex-row min-h-[calc(100vh-4rem)] -mx-4 sm:-mx-6 lg:-mx-8 -my-6 text-white border-t border-emerald-900 overflow-hidden">
      
      {/* Left Side - Info Panel */}
      <div className="w-full md:w-1/2 bg-emerald-950 p-10 lg:p-20 flex flex-col justify-center relative overflow-hidden border-b md:border-b-0 md:border-r border-emerald-900">
        <div className="absolute top-0 left-0 w-full h-full bg-[radial-gradient(ellipse_at_top_left,_var(--tw-gradient-stops))] from-orange-500/5 via-transparent to-transparent opacity-80"></div>
        
        <div className="relative z-10 max-w-lg mx-auto md:mx-0 space-y-8">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 bg-orange-500 rounded-lg flex items-center justify-center text-white font-black text-sm">EO</div>
            <span className="font-bold text-xl tracking-tight text-white">EventOps</span>
          </div>

          <h1 className="text-4xl lg:text-5xl font-extrabold leading-tight">
            Event ticketing & hiring, <br/> reimagined.
          </h1>
          
          <p className="text-emerald-200/80 text-base leading-relaxed">
            The escrow-powered platform protecting organizers, attendees, and vendors, one workspace for tickets, bookings, and check-ins.
          </p>
          
          <div className="space-y-4 pt-4">
            <div className="flex items-center gap-3 text-sm text-emerald-100">
              <div className="w-5 h-5 rounded-full bg-emerald-900/60 border border-emerald-700/50 flex items-center justify-center text-orange-400">
                <Check className="w-3 h-3" />
              </div>
              Instant M-Pesa ticket issuance & verification
            </div>
            <div className="flex items-center gap-3 text-sm text-emerald-100">
              <div className="w-5 h-5 rounded-full bg-emerald-900/60 border border-emerald-700/50 flex items-center justify-center text-orange-400">
                <Check className="w-3 h-3" />
              </div>
              Attendee, organizer & vendor modes in one place
            </div>
            <div className="flex items-center gap-3 text-sm text-emerald-100">
              <div className="w-5 h-5 rounded-full bg-emerald-900/60 border border-emerald-700/50 flex items-center justify-center text-orange-400">
                <Check className="w-3 h-3" />
              </div>
              Scam-free marketplace powered by escrow funds
            </div>
          </div>
          
          <div className="pt-12 text-xs text-emerald-400/50">
            © 2026 EventOps. All rights reserved. <br/>
            Securing live experiences.
          </div>
        </div>
      </div>

      {/* Right Side - Login Form */}
      <div className="w-full md:w-1/2 bg-[#022c22] p-10 lg:p-20 flex flex-col justify-center items-center">
        <div className="w-full max-w-md">
          
          <div className="text-center mb-10">
            <h2 className="text-3xl font-extrabold">Sign in to EventOps</h2>
            <p className="text-emerald-200/70 text-sm mt-2">Access all your events and bookings in one place.</p>
          </div>

          <div className="space-y-4 mb-8">
             <button
                type="button"
                onClick={() => realGoogleLogin()}
                disabled={loading}
                className="w-full bg-transparent hover:bg-emerald-900/40 text-white font-semibold py-3 rounded-xl border border-emerald-700/80 transition-all flex items-center justify-center gap-3 text-sm disabled:opacity-50"
              >
                <svg className="w-5 h-5" viewBox="0 0 24 24">
                  <path fill="#EA4335" d="M12 5c1.6 0 3 .6 4.1 1.6l3.1-3.1C17.3 1.8 14.8 1 12 1 7.4 1 3.5 3.6 1.6 7.4l3.7 2.9C6.2 7.1 8.9 5 12 5z"/>
                  <path fill="#4285F4" d="M23.5 12.3c0-.8-.1-1.6-.2-2.3H12v4.5h6.5c-.3 1.5-1.1 2.8-2.4 3.7l3.7 2.9c2.2-2 3.7-5 3.7-8.8z"/>
                  <path fill="#FBBC05" d="M5.3 14.7c-.2-.7-.4-1.5-.4-2.7s.2-2 .4-2.7L1.6 6.4C.6 8.4 0 10.6 0 13s.6 4.6 1.6 6.6l3.7-2.9z"/>
                  <path fill="#34A853" d="M12 23c3.2 0 6-1.1 8-3l-3.7-2.9c-1.1.7-2.5 1.2-4.3 1.2-3.1 0-5.8-2.1-6.7-5.3L1.6 15.7C3.5 19.5 7.4 23 12 23 z"/>
                </svg>
                {loading ? 'Authenticating...' : 'Continue with Google'}
              </button>
          </div>

          <div className="relative my-6 text-center">
            <div className="absolute inset-0 flex items-center"><div className="w-full border-t border-emerald-800" /></div>
            <span className="relative bg-[#022c22] px-3 text-xs font-bold text-emerald-400/50 uppercase">OR</span>
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

          <form onSubmit={handleSubmit} className="space-y-5">
            <div>
              <label className="block text-xs font-semibold text-emerald-300 mb-2">Email</label>
              <div className="relative">
                <Mail className="w-4 h-4 text-emerald-500 absolute left-3 top-3.5" />
                <input
                  type="email"
                  name="email"
                  required
                  value={formData.email}
                  onChange={handleChange}
                  placeholder="you@email.com"
                  className="w-full bg-emerald-950/50 border border-emerald-800 rounded-xl pl-10 pr-4 py-3 text-sm text-white placeholder-emerald-700 focus:outline-none focus:border-orange-500 transition-colors"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-semibold text-emerald-300 mb-2">Password</label>
              <div className="relative">
                <Lock className="w-4 h-4 text-emerald-500 absolute left-3 top-3.5" />
                <input
                  type="password"
                  name="password"
                  required
                  value={formData.password}
                  onChange={handleChange}
                  placeholder="********"
                  className="w-full bg-emerald-950/50 border border-emerald-800 rounded-xl pl-10 pr-4 py-3 text-sm text-white placeholder-emerald-700 focus:outline-none focus:border-orange-500 transition-colors"
                />
              </div>
            </div>
            
            <div className="flex justify-between items-center text-xs">
              <label className="flex items-center gap-2 cursor-pointer text-emerald-300/80">
                <input type="checkbox" className="accent-orange-500 w-3.5 h-3.5 rounded bg-emerald-900 border-emerald-700" />
                Remember me
              </label>
              <a href="#" className="text-orange-400 font-semibold hover:underline">Forgot password?</a>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full bg-orange-500 hover:bg-orange-600 text-white font-bold py-3.5 rounded-xl transition-all shadow-lg shadow-orange-500/20 flex items-center justify-center gap-2 mt-4"
            >
              {loading ? 'Signing In...' : 'Sign In'}
              <ArrowRight className="w-4 h-4" />
            </button>
          </form>

          <p className="text-center text-xs text-emerald-300/70 mt-8">
            New to EventOps?{' '}
            <Link to="/register" className="text-emerald-400 font-semibold hover:underline">
              Create an account
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
}