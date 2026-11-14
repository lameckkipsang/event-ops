import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Mail, Lock, User, Shield, ArrowRight, Check } from 'lucide-react';
import api from '../services/api';

export default function Register() {
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    username: '',
    email: '',
    password: '',
    role: 'ATTENDEE',
  });
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
      await api.post('accounts/', formData);
      navigate('/login');
    } catch (err) {
      console.error('Registration error:', err.response?.data);
      const errorData = err.response?.data;
      if (typeof errorData === 'object' && errorData !== null) {
        const firstKey = Object.keys(errorData)[0];
        const firstError = errorData[firstKey];
        setError(Array.isArray(firstError) ? `${firstKey}: ${firstError[0]}` : JSON.stringify(errorData));
      } else {
        setError('Failed to register. Please check your credentials.');
      }
    } finally {
      setLoading(false);
    }
  };

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
            One Account for <br/> <span className="text-orange-500">Every Experience.</span>
          </h1>
          
          <p className="text-emerald-200/80 text-base leading-relaxed">
            Whether you're attending a graduation, hosting a major conference, or providing photography services, EventOps has you covered.
          </p>
          
          <div className="space-y-4 pt-4">
            <div className="flex items-center gap-3 text-sm text-emerald-100">
              <div className="w-5 h-5 rounded-full bg-emerald-900/60 border border-emerald-700/50 flex items-center justify-center text-orange-400">
                <Check className="w-3 h-3" />
              </div>
              Attendees: Buy tickets securely via M-Pesa
            </div>
            <div className="flex items-center gap-3 text-sm text-emerald-100">
              <div className="w-5 h-5 rounded-full bg-emerald-900/60 border border-emerald-700/50 flex items-center justify-center text-orange-400">
                <Check className="w-3 h-3" />
              </div>
              Organizers: Host events & manage your gate lists
            </div>
            <div className="flex items-center gap-3 text-sm text-emerald-100">
              <div className="w-5 h-5 rounded-full bg-emerald-900/60 border border-emerald-700/50 flex items-center justify-center text-orange-400">
                <Check className="w-3 h-3" />
              </div>
              Vendors: Sell services safely using escrow
            </div>
          </div>
          
          <div className="pt-12 text-xs text-emerald-400/50">
            © 2026 EventOps. All rights reserved. <br/>
            Securing live experiences.
          </div>
        </div>
      </div>

      {/* Right Side - Registration Form */}
      <div className="w-full md:w-1/2 bg-[#022c22] p-10 lg:p-20 flex flex-col justify-center items-center">
        <div className="w-full max-w-md">
          
          <div className="text-center mb-10">
            <h2 className="text-3xl font-extrabold">Create an account</h2>
            <p className="text-emerald-200/70 text-sm mt-2">Join EventOps to get started today.</p>
          </div>

          {error && (
            <div className="mb-6 p-3 bg-red-950/60 border border-red-800/80 rounded-xl text-red-300 text-xs text-center">
              {error}
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-5">
            <div>
              <label className="block text-xs font-semibold text-emerald-300 mb-2">Username</label>
              <div className="relative">
                <User className="w-4 h-4 text-emerald-500 absolute left-3 top-3.5" />
                <input
                  type="text"
                  name="username"
                  required
                  value={formData.username}
                  onChange={handleChange}
                  placeholder="e.g. robin1"
                  className="w-full bg-emerald-950/50 border border-emerald-800 rounded-xl pl-10 pr-4 py-3 text-sm text-white placeholder-emerald-700 focus:outline-none focus:border-orange-500 transition-colors"
                />
              </div>
            </div>

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
                  placeholder="At least 6 characters"
                  className="w-full bg-emerald-950/50 border border-emerald-800 rounded-xl pl-10 pr-4 py-3 text-sm text-white placeholder-emerald-700 focus:outline-none focus:border-orange-500 transition-colors"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-semibold text-emerald-300 mb-2">Select Your Role</label>
              <div className="relative">
                <Shield className="w-4 h-4 text-emerald-500 absolute left-3 top-3.5" />
                <select
                  name="role"
                  value={formData.role}
                  onChange={handleChange}
                  className="w-full bg-emerald-950/50 border border-emerald-800 rounded-xl pl-10 pr-4 py-3 text-sm text-white focus:outline-none focus:border-orange-500 appearance-none transition-colors"
                >
                  <option value="ATTENDEE">Attendee</option>
                  <option value="ORGANIZER">Event Organizer</option>
                  <option value="VENDOR">Service Vendor</option>
                  <option value="SECURITY">Security Agency</option>
                </select>
              </div>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full bg-orange-500 hover:bg-orange-600 text-white font-bold py-3.5 rounded-xl transition-all shadow-lg shadow-orange-500/20 flex items-center justify-center gap-2 mt-8"
            >
              {loading ? 'Creating Account...' : 'Create Account'}
              <ArrowRight className="w-4 h-4" />
            </button>
          </form>

          <p className="text-center text-xs text-emerald-300/70 mt-8">
            Already have an account?{' '}
            <Link to="/login" className="text-emerald-400 font-semibold hover:underline">
              Sign In here
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
}