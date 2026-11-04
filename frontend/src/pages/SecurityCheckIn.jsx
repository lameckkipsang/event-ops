import React, { useState } from 'react';
import { ShieldCheck, CheckCircle2, XCircle, Search, Ticket, User, Calendar, Loader2 } from 'lucide-react';
import api from '../services/api';

export default function SecurityCheckIn() {
  const [ticketCode, setTicketCode] = useState('');
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState(null);
  const [error, setError] = useState('');

  const handleCheckIn = async (e) => {
    e.preventDefault();
    if (!ticketCode.trim()) return;

    setLoading(true);
    setError('');
    setResult(null);

    try {
      const response = await api.post('tickets/security/check-in/', {
        ticket_code: ticketCode.trim().toUpperCase(),
      });
      setResult(response.data);
      setTicketCode(''); // Clear input for next scan
    } catch (err) {
      console.error('Check-in error:', err);
      setError(err.response?.data?.error || 'Failed to verify ticket code. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-xl mx-auto my-12 p-8 bg-emerald-900/60 border border-emerald-800/80 rounded-3xl shadow-2xl text-white space-y-8">
      <div className="text-center">
        <div className="w-14 h-14 bg-orange-500/20 text-orange-400 border border-orange-500/30 rounded-2xl flex items-center justify-center mx-auto mb-3 shadow-lg">
          <ShieldCheck className="w-7 h-7" />
        </div>
        <h1 className="text-2xl font-bold">Security Gate Check-In</h1>
        <p className="text-emerald-200/70 text-sm mt-1">
          Scan or manually enter ticket pass codes to admit attendees.
        </p>
      </div>

      <form onSubmit={handleCheckIn} className="space-y-4">
        <div>
          <label className="block text-xs font-semibold text-emerald-300 mb-1.5 uppercase tracking-wider">
            Ticket Pass Code
          </label>
          <div className="relative">
            <Ticket className="w-5 h-5 text-emerald-400 absolute left-3.5 top-3.5" />
            <input
              type="text"
              required
              value={ticketCode}
              onChange={(e) => setTicketCode(e.target.value)}
              placeholder="e.g. EVT-TCK-A1B2C3"
              className="w-full bg-emerald-950 border border-emerald-700/80 rounded-2xl pl-11 pr-4 py-3 text-sm text-white placeholder-emerald-600 focus:outline-none focus:border-orange-500 font-mono uppercase tracking-wider"
            />
          </div>
        </div>

        <button
          type="submit"
          disabled={loading}
          className="w-full bg-orange-500 hover:bg-orange-600 text-white font-bold py-3.5 rounded-2xl transition-all shadow-lg shadow-orange-500/20 flex items-center justify-center gap-2"
        >
          {loading ? (
            <>
              <Loader2 className="w-5 h-5 animate-spin" />
              Verifying Ticket...
            </>
          ) : (
            <>
              <Search className="w-5 h-5" />
              Verify & Check In
            </>
          )}
        </button>
      </form>

      {error && (
        <div className="p-4 bg-red-950/80 border border-red-800 rounded-2xl flex items-center gap-3 text-red-300 text-sm animate-shake">
          <XCircle className="w-6 h-6 text-red-400 shrink-0" />
          <div>
            <p className="font-bold">Check-In Failed</p>
            <p className="text-xs text-red-200/80 mt-0.5">{error}</p>
          </div>
        </div>
      )}

      {result && (
        <div className="p-6 bg-emerald-950/90 border border-emerald-700 rounded-2xl space-y-4 animate-fade-in">
          <div className="flex items-center gap-3">
            <CheckCircle2 className="w-8 h-8 text-emerald-400 shrink-0" />
            <div>
              <h3 className="text-base font-bold text-white">Check-In Successful!</h3>
              <p className="text-xs text-emerald-300">{result.message}</p>
            </div>
          </div>

          <div className="p-4 bg-emerald-900/40 border border-emerald-800/60 rounded-xl space-y-2 text-xs">
            <div className="flex items-center gap-2 text-emerald-200">
              <User className="w-4 h-4 text-orange-400" />
              <span>Attendee: <strong className="text-white">@{result.attendee}</strong></span>
            </div>
            <div className="flex items-center gap-2 text-emerald-200">
              <Calendar className="w-4 h-4 text-orange-400" />
              <span>Event: <strong className="text-white">{result.event}</strong></span>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}