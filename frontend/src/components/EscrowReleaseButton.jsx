import React, { useState } from 'react';
import { ShieldCheck, CheckCircle2, Loader2, AlertCircle } from 'lucide-react';
import api from '../services/api';

export default function EscrowReleaseButton({ transactionId, currentEscrowStatus, onReleased }) {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState(currentEscrowStatus === 'RELEASED');

  const handleReleaseEscrow = async () => {
    if (!window.confirm("Are you sure you want to release escrow funds to the vendor? This action is irreversible.")) {
      return;
    }

    setLoading(true);
    setError('');

    try {
      const response = await api.post(`finance/release-escrow/${transactionId}/`);
      setSuccess(true);
      if (onReleased) onReleased(response.data);
    } catch (err) {
      console.error('Escrow release error:', err);
      setError(err.response?.data?.error || 'Failed to release escrow funds.');
    } finally {
      setLoading(false);
    }
  };

  if (success) {
    return (
      <div className="flex items-center gap-1.5 text-xs font-bold text-emerald-400 bg-emerald-950/80 border border-emerald-700/60 px-3 py-1.5 rounded-xl">
        <CheckCircle2 className="w-4 h-4 text-emerald-400" />
        Escrow Released & Disbursed
      </div>
    );
  }

  return (
    <div className="space-y-2">
      {error && (
        <p className="text-[11px] text-red-300 bg-red-950/80 border border-red-800 p-2 rounded-xl flex items-center gap-1">
          <AlertCircle className="w-3.5 h-3.5 shrink-0" /> {error}
        </p>
      )}
      <button
        disabled={loading}
        onClick={handleReleaseEscrow}
        className="bg-orange-500 hover:bg-orange-600 text-white font-bold px-4 py-2 rounded-xl text-xs flex items-center gap-1.5 transition-all shadow-lg shadow-orange-500/20 disabled:opacity-50"
      >
        {loading ? (
          <>
            <Loader2 className="w-4 h-4 animate-spin" />
            Releasing Funds...
          </>
        ) : (
          <>
            <ShieldCheck className="w-4 h-4" />
            Release Escrow Payout
          </>
        )}
      </button>
    </div>
  );
}