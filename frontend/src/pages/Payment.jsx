import React, { useState, useEffect } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { CreditCard, Phone, ShieldCheck, ArrowRight, CheckCircle2, Receipt, Calendar, Info } from 'lucide-react';
import api from '../services/api';

export default function Payment() {
  const location = useLocation();
  const navigate = useNavigate();

  const { item, type, eventId } = location.state || {};

  const [phoneNumber, setPhoneNumber] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [paymentSuccess, setPaymentSuccess] = useState(false);

  const [myEvents, setMyEvents] = useState([]);
  const [selectedEventId, setSelectedEventId] = useState(eventId || '');

  const userRole = localStorage.getItem('user_role') || '';
  const resolvedType = type || (item?.ticket_type || item?.tier_id ? 'event_ticket' : 'vendor_booking');
  const isVendorBooking = resolvedType === 'vendor_booking';
  const isUnauthorizedAttendee = isVendorBooking && userRole !== 'ORGANIZER';

  useEffect(() => {
    if (isVendorBooking && userRole === 'ORGANIZER') {
      api.get('events/')
        .then(res => {
          const fetchedEvents = res.data.results || res.data || [];
          setMyEvents(fetchedEvents);
          if (fetchedEvents.length === 1 && !selectedEventId) {
            setSelectedEventId(fetchedEvents[0].id);
          }
        })
        .catch(err => console.error('Failed to fetch events for dropdown:', err));
    }
  }, [isVendorBooking, userRole, selectedEventId]);

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

    let formattedPhone = phoneNumber.trim();
    if (formattedPhone.startsWith('0')) {
      formattedPhone = '254' + formattedPhone.slice(1);
    }

    const endpoint = resolvedType === 'event_ticket'
      ? 'finance/stk-push/ticket/'
      : 'finance/stk-push/vendor/';

    const payload = {
      phone_number: formattedPhone,
      amount: item.price || item.cost,
    };

    if (resolvedType === 'event_ticket') {
      payload.ticket_tier_id = item.id;
    } else {
      payload.package_id = item.id;
      payload.event_id = selectedEventId || item.event || item.event_id || (typeof item.event === 'object' ? item.event?.id : null);
      
      if (!payload.event_id) {
        setError('Please select an event for this vendor booking.');
        setLoading(false);
        return;
      }
    }

    try {
      await api.post(endpoint, payload);
      setPaymentSuccess(true);
    } catch (err) {
      if (err.response?.status !== 400) {
        console.error('Payment initiation error:', err);
      }
      const errorMsg = err.response?.data?.error || err.response?.data?.detail || 'Failed to initiate M-Pesa STK Push. Please verify your phone number and try again.';
      setError(errorMsg);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-5xl mx-auto my-12 bg-emerald-900/40 border border-emerald-800/80 rounded-3xl shadow-2xl overflow-hidden flex flex-col md:flex-row text-white">
      
      {/* Left Side - Escrow Information & Order Summary */}
      <div className="md:w-1/2 p-8 md:p-10 bg-emerald-950 flex flex-col justify-between border-b md:border-b-0 md:border-r border-emerald-800/80 relative">
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_bottom_left,_var(--tw-gradient-stops))] from-emerald-900/40 via-transparent to-transparent opacity-60"></div>
        
        <div className="relative z-10 space-y-6">
           <h2 className="text-2xl font-bold flex items-center gap-2">
             <ShieldCheck className="w-7 h-7 text-orange-500" />
             Safe Escrow Checkout
           </h2>
           
           <div className="p-5 bg-emerald-900/50 border border-emerald-700/50 rounded-2xl">
             <h3 className="text-xs font-semibold text-emerald-400 uppercase tracking-wider mb-4 border-b border-emerald-800 pb-2">
               Order Summary
             </h3>
             <div className="flex justify-between items-start text-sm font-bold mb-1">
               <span className="text-white max-w-[70%]">{item.title || item.name || 'Vendor Service'}</span>
               <span className="text-orange-400 text-lg">KES {parseFloat(item.price || item.cost).toLocaleString()}</span>
             </div>
             <p className="text-xs text-emerald-300/70 mt-2 leading-relaxed">
               {item.description || 'Escrow protected service tier booking.'}
             </p>
           </div>
        </div>

        <div className="relative z-10 mt-8 space-y-3">
            <div className="flex items-start gap-3 p-3 bg-emerald-900/30 rounded-xl border border-emerald-800/50">
               <Info className="w-5 h-5 text-emerald-400 shrink-0 mt-0.5" />
               <p className="text-xs text-emerald-200/90">
                  <strong className="text-emerald-100 block mb-0.5">How EventOps Escrow Works</strong>
                  Your funds are held securely by EventOps. We only release the payment to the vendor/organizer once the service delivery or event is confirmed.
               </p>
            </div>
        </div>
      </div>

      {/* Right Side - Payment Form */}
      <div className="md:w-1/2 p-8 md:p-10 flex flex-col justify-center bg-emerald-900/20">
        <div className="max-w-md w-full mx-auto">
          <div className="text-center mb-8">
            <div className="w-12 h-12 bg-orange-500/20 text-orange-400 border border-orange-500/30 rounded-2xl flex items-center justify-center mx-auto mb-3">
              <CreditCard className="w-6 h-6" />
            </div>
            <h2 className="text-xl font-bold">M-Pesa Payment</h2>
            <p className="text-emerald-200/70 text-sm mt-1">Complete your transaction instantly</p>
          </div>

          {error && (
            <div className="mb-6 p-3 bg-red-950/60 border border-red-800/80 rounded-xl text-red-300 text-xs text-center">
              {error}
            </div>
          )}

          {isUnauthorizedAttendee ? (
            <div className="mb-6 p-4 bg-red-950/60 border border-red-800/80 rounded-xl text-red-300 text-sm text-center font-semibold">
              Only Event Organizers can book vendor services.
            </div>
          ) : paymentSuccess ? (
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
                className="w-full bg-orange-500 hover:bg-orange-600 text-white font-bold py-3 rounded-xl transition-all shadow-lg shadow-orange-500/20 flex items-center justify-center gap-2 mt-2"
              >
                <Receipt className="w-4 h-4" />
                View Receipt & My Tickets
              </button>
            </div>
          ) : (
            <form onSubmit={handlePayment} className="space-y-5">
              
              {isVendorBooking && (
                <div>
                  <label className="block text-xs font-semibold text-emerald-300 mb-1.5">
                    Target Event
                  </label>
                  <div className="relative">
                    <Calendar className="w-4 h-4 text-emerald-400 absolute left-3.5 top-3.5" />
                    <select
                      required
                      value={selectedEventId}
                      onChange={(e) => setSelectedEventId(e.target.value)}
                      className="w-full bg-emerald-950 border border-emerald-700/80 rounded-xl pl-10 pr-4 py-3 text-sm text-white focus:outline-none focus:border-orange-500 appearance-none"
                    >
                      <option value="" disabled>-- Select the event for this service --</option>
                      {myEvents.map((ev) => (
                        <option key={ev.id} value={ev.id}>
                          {ev.title}
                        </option>
                      ))}
                    </select>
                  </div>
                  {myEvents.length === 0 && (
                    <p className="text-[11px] text-red-400 mt-1">
                      You must create an event first before booking a vendor.
                    </p>
                  )}
                </div>
              )}

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
                    className="w-full bg-emerald-950 border border-emerald-700/80 rounded-xl pl-10 pr-4 py-3 text-sm text-white placeholder-emerald-600 focus:outline-none focus:border-orange-500"
                  />
                </div>
                <p className="text-[11px] text-emerald-400/70 mt-1">
                  Format: 2547XXXXXXXX or 07XXXXXXXX
                </p>
              </div>

              <button
                type="submit"
                disabled={loading || (isVendorBooking && !selectedEventId)}
                className="w-full bg-orange-500 hover:bg-orange-600 disabled:opacity-50 disabled:cursor-not-allowed text-white font-bold py-3.5 rounded-xl transition-all shadow-lg shadow-orange-500/20 flex items-center justify-center gap-2 mt-4"
              >
                {loading ? 'Initiating M-Pesa...' : `Pay KES ${parseFloat(item.price || item.cost).toLocaleString()}`}
                <ArrowRight className="w-4 h-4" />
              </button>
            </form>
          )}
        </div>
      </div>
    </div>
  );
}