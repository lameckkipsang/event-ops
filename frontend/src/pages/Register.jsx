import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { UserPlus, Mail, Lock, User, Shield, ArrowRight, ShieldCheck, Ticket, Store } from 'lucide-react';
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
    <div className="max-w-5xl mx-auto my-12 bg-emerald-900/40 border border-emerald-800/80 rounded-3xl shadow-2xl overflow-hidden flex flex-col md:flex-row text-white">
      
      {/* Left Side - Info Panel */}
      <div className="md:w-1/2 p-10 bg-emerald-950 flex flex-col justify-center relative overflow-hidden border-b md:border-b-0 md:border-r border-emerald-800/80">
        <div className="absolute top-0 left-0 w-full h-full bg-[radial-gradient(ellipse_at_top_left,_var(--tw-gradient-stops))] from-orange-500/10 via-transparent to-transparent opacity-60"></div>
        <div className="relative z-10 space-y-8">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-emerald-900/60 border border-emerald-700/50 text-emerald-300 text-xs font-bold uppercase tracking-wider">
            <ShieldCheck className="w-4 h-4 text-orange-400" />
            Join the Ecosystem
          </div>
          <h1 className="text-4xl lg:text-5xl font-extrabold leading-tight">
            One Account for <span className="text-orange-500">Every Experience</span>
          </h1>
          <p className="text-emerald-200/80 text-sm leading-relaxed max-w-md">
            Whether you're attending a graduation, hosting a major conference, or providing photography services, EventOps has you covered.
          </p>
          <div className="space-y-4 pt-4">
            <div className="flex items-start gap-3 text-sm">
              <div className="w-8 h-8 shrink-0 rounded-full bg-orange-500/20 flex items-center justify-center text-orange-400 mt-1"><User className="w-4 h-4" /></div>
              <div>
                <p className="font-bold text-emerald-100">Attendees</p>
                <p className="text-xs text-emerald-300/70">Buy tickets securely via M-Pesa</p>
              </div>
            </div>
            <div className="flex items-start gap-3 text-sm">
              <div className="w-8 h-8 shrink-0 rounded-full bg-emerald-500/20 flex items-center justify-center text-emerald-400 mt-1"><Store className="w-4 h-4" /></div>
              <div>
                <p className="font-bold text-emerald-100">Vendors & Organizers</p>
                <p className="text-xs text-emerald-300/70">Host events or sell your services safely</p>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Right Side - Registration Form */}
      <div className="md:w-1/2 p-10 flex flex-col justify-center bg-emerald-900/20">
        <div className="max-w-md w-full mx-auto">
          <div className="text-center mb-8">
            <div className="w-12 h-12 bg-orange-500/20 text-orange-400 border border-orange-500/30 rounded-2xl flex items-center justify-center mx-auto mb-3">
              <UserPlus className="w-6 h-6" />
            </div>
            <h2 className="text-2xl font-bold">Create an Account</h2>
            <p className="text-emerald-200/70 text-sm mt-1">Join EventOps to book tickets and hire vendors</p>
          </div>

          {error && (
            <div className="mb-6 p-3 bg-red-950/60 border border-red-800/80 rounded-xl text-red-300 text-xs text-center">
              {error}
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-xs font-semibold text-emerald-300 mb-1.5">Username</label>
              <div className="relative">
                <User className="w-4 h-4 text-emerald-400 absolute left-3 top-3.5" />
                <input
                  type="text"
                  name="username"
                  required
                  value={formData.username}
                  onChange={handleChange}
                  placeholder="robin1"
                  className="w-full bg-emerald-950 border border-emerald-700/80 rounded-xl pl-10 pr-4 py-2.5 text-sm text-white placeholder-emerald-600 focus:outline-none focus:border-orange-500"
                />
              </div>
            </div>

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
                  placeholder="At least 6 characters"
                  className="w-full bg-emerald-950 border border-emerald-700/80 rounded-xl pl-10 pr-4 py-2.5 text-sm text-white placeholder-emerald-600 focus:outline-none focus:border-orange-500"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-semibold text-emerald-300 mb-1.5">Select Role</label>
              <div className="relative">
                <Shield className="w-4 h-4 text-emerald-400 absolute left-3 top-3.5" />
                <select
                  name="role"
                  value={formData.role}
                  onChange={handleChange}
                  className="w-full bg-emerald-950 border border-emerald-700/80 rounded-xl pl-10 pr-4 py-2.5 text-sm text-white focus:outline-none focus:border-orange-500 appearance-none"
                >
                  <option value="ATTENDEE">Attendee</option>
                  <option value="ORGANIZER">Organizer</option>
                  <option value="VENDOR">Vendor</option>
                  <option value="SECURITY">Security</option>
                </select>
              </div>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full bg-orange-500 hover:bg-orange-600 text-white font-bold py-3 rounded-xl transition-all shadow-lg shadow-orange-500/20 flex items-center justify-center gap-2 mt-6"
            >
              {loading ? 'Creating Account...' : 'Register'}
              <ArrowRight className="w-4 h-4" />
            </button>
          </form>

          <p className="text-center text-xs text-emerald-300/70 mt-6">
            Already have an account?{' '}
            <Link to="/login" className="text-orange-400 font-semibold hover:underline">
              Sign In
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
}