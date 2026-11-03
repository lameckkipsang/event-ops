import React, { useState } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { CreditCard, Phone, ShieldCheck, ArrowRight, CheckCircle2, Receipt } from 'lucide-react';
import api from '../services/api';

export default function Payment() {
  const location = useLocation();
  const navigate = useNavigate();

  // Extract item details and type passed via navigation state
  const { item, type } = location.state || {};

  const [phoneNumber, setPhoneNumber] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [paymentSuccess, setPaymentSuccess] = useState(false);

  // Fallback if accessed directly without selecting a service
  if (!item) {
    return (
      <div className="max-w-md mx-auto my-16 text-center text-white">
        <h2 className="text-xl font-bold mb-2">No Item Selected</h2>
        <p className="text-emerald-300 text-sm mb-6">
          Please select a service or event ticket before proceeding to checkout.
        </p>
        <button
          onClick={() => navigate('/marketplace')}
          className="bg-orange-500 hover:bg-orange-600 text-white font-semibold px-6 py-2.5 rounded-xl transition-all"
        >
          Browse Marketplace
        </button>
      </div>
    );
  }

  const handlePayment = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    // Format phone number to 254XXXXXXXXX
    let formattedPhone = phoneNumber.trim();
    if (formattedPhone.startsWith('0')) {
      formattedPhone = '254' + formattedPhone.slice(1);
    }

    // Determine payment type dynamically if not explicitly provided in navigation state
    const paymentType = type || (item.tier_name || item.ticket_type || item.event ? 'event_ticket' : 'vendor_booking');

    try {
      await api.post('finance/stk-push/', {
        phone_number: formattedPhone,
        booking_id: item.id,
        amount: item.price || item.cost,
        type: paymentType,
      });
      setPaymentSuccess(true);
    } catch (err) {
      console.error('Payment initiation error:', err);
      setError('Failed to initiate M-Pesa STK Push. Please verify your phone number and try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-2xl mx-auto my-12 p-8 bg-emerald-900/60 border border-emerald-800/80 rounded-3xl shadow-2xl text-white">
      <div className="text-center mb-8">
        <div className="w-12 h-12 bg-orange-500/20 text-orange-400 border border-orange-500/30 rounded-2xl flex items-center justify-center mx-auto mb-3">
          <CreditCard className="w-6 h-6" />
        </div>
        <h2 className="text-2xl font-bold">Escrow Payment Checkout</h2>
        <p className="text-emerald-200/70 text-sm mt-1">
          Complete your transaction securely via M-Pesa
        </p>
      </div>

      {/* Order Summary Card */}
      <div className="p-5 bg-emerald-950/80 border border-emerald-800/80 rounded-2xl mb-6">
        <h3 className="text-xs font-semibold text-emerald-400 uppercase tracking-wider mb-3">
          Order Summary
        </h3>
        <div className="flex justify-between items-center text-sm font-semibold">
          <span>{item.title || item.name || 'Vendor Service'}</span>
          <span className="text-orange-400 font-bold">KES {item.price || item.cost}</span>
        </div>
        <p className="text-xs text-emerald-300/60 mt-1">
          {item.description || 'Escrow protected service tier booking.'}
        </p>
      </div>

      {error && (
        <div className="mb-6 p-3 bg-red-950/60 border border-red-800/80 rounded-xl text-red-300 text-xs text-center">
          {error}
        </div>
      )}

      {paymentSuccess ? (
        <div className="p-6 bg-emerald-950/90 border border-emerald-700/80 rounded-2xl text-center space-y-4">
          <CheckCircle2 className="w-12 h-12 text-emerald-400 mx-auto" />
          <h3 className="text-xl font-bold text-white">STK Push Sent!</h3>
          <p className="text-xs text-emerald-300">
            Please check your phone ({phoneNumber}) and enter your M-Pesa PIN to complete payment.
          </p>
          <button
            onClick={() =>
              navigate('/profile', {
                state: { activeTab: 'tickets_receipts', recentItem: item },
              })
            }
            className="w-full bg-orange-500 hover:bg-orange-600 text-white font-bold py-3 rounded-xl transition-all shadow-lg shadow-orange-500/20 flex items-center justify-center gap-2"
          >
            <Receipt className="w-4 h-4" />
            View Receipt & My Tickets
          </button>
        </div>
      ) : (
        <form onSubmit={handlePayment} className="space-y-5">
          <div>
            <label className="block text-xs font-semibold text-emerald-300 mb-1.5">
              M-Pesa Phone Number
            </label>
            <div className="relative">
              <Phone className="w-4 h-4 text-emerald-400 absolute left-3.5 top-3.5" />
              <input
                type="tel"
                required
                value={phoneNumber}
                onChange={(e) => setPhoneNumber(e.target.value)}
                placeholder="254712345678"
                className="w-full bg-emerald-950 border border-emerald-700/80 rounded-xl pl-10 pr-4 py-2.5 text-sm text-white placeholder-emerald-600 focus:outline-none focus:border-orange-500"
              />
            </div>
            <p className="text-[11px] text-emerald-400/70 mt-1">
              Format: 2547XXXXXXXX or 07XXXXXXXX
            </p>
          </div>

          <div className="p-4 bg-orange-500/10 border border-orange-500/20 rounded-xl flex items-center gap-3">
            <ShieldCheck className="w-5 h-5 text-orange-400 shrink-0" />
            <p className="text-xs text-emerald-200/80">
              Funds will be held in EventOps Escrow and released only after service delivery is confirmed.
            </p>
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full bg-orange-500 hover:bg-orange-600 text-white font-bold py-3 rounded-xl transition-all shadow-lg shadow-orange-500/20 flex items-center justify-center gap-2 mt-4"
          >
            {loading ? 'Initiating M-Pesa...' : `Pay KES ${item.price || item.cost}`}
            <ArrowRight className="w-4 h-4" />
          </button>
        </form>
      )}
    </div>
  );
}