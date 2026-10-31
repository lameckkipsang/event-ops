import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { LogIn, Mail, Lock, ArrowRight } from 'lucide-react';
import api from '../services/api';

export default function Login() {
  return (
    <div className="max-w-md mx-auto my-12 p-8 bg-emerald-900/60 border border-emerald-800/80 rounded-3xl shadow-2xl text-white">
      <div className="text-center mb-8">
        <div className="w-12 h-12 bg-orange-500/20 text-orange-400 border border-orange-500/30 rounded-2xl flex items-center justify-center mx-auto mb-3">
          <LogIn className="w-6 h-6" />
        </div>
        <h2 className="text-2xl font-bold">Welcome Back</h2>
        <p className="text-emerald-200/70 text-sm mt-1">Sign in to your EventOps account</p>
      </div>

      <form className="space-y-4">
        <div>
          <label className="block text-xs font-semibold text-emerald-300 mb-1.5">Email or Username</label>
          <div className="relative">
            <Mail className="w-4 h-4 text-emerald-400 absolute left-3 top-3.5" />
            <input
              type="text"
              required
              placeholder="john@example.com"
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
              required
              placeholder="••••••••"
              className="w-full bg-emerald-950 border border-emerald-700/80 rounded-xl pl-10 pr-4 py-2.5 text-sm text-white placeholder-emerald-600 focus:outline-none focus:border-orange-500"
            />
          </div>
        </div>

        <button
          type="submit"
          className="w-full bg-orange-500 hover:bg-orange-600 text-white font-bold py-3 rounded-xl transition-all shadow-lg shadow-orange-500/20 flex items-center justify-center gap-2 mt-6"
        >
          Sign In
          <ArrowRight className="w-4 h-4" />
        </button>
      </form>

      <p className="text-center text-xs text-emerald-300/70 mt-6">
        Don't have an account?{' '}
        <Link to="/register" className="text-orange-400 font-semibold hover:underline">
          Register
        </Link>
      </p>
    </div>
  );
}