import React, { useState, useEffect } from 'react';
import { Calendar, Store, Clock, CheckCircle2, XCircle, AlertCircle, Loader2 } from 'lucide-react';
import api from '../services/api';

export default function OrganizerBookings() {
  const [bookings, setBookings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  const fetchOrganizerBookings = async () => {
    try {
      const response = await api.get('marketplace/organizer/bookings/');
      setBookings(response.data);
    } catch (err) {
      console.error('Failed to fetch organizer bookings:', err);
      setError('Failed to load your vendor booking requests.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchOrganizerBookings();
  }, []);

  if (loading) {
    return (
      <div className="flex justify-center items-center min-h-[50vh] text-emerald-300">
        <Loader2 className="w-8 h-8 animate-spin text-orange-500" />
      </div>
    );
  }

  return (
    <div className="max-w-5xl mx-auto my-12 p-8 bg-emerald-900/60 border border-emerald-800/80 rounded-3xl shadow-2xl text-white space-y-6">
      <div className="border-b border-emerald-800/80 pb-6">
        <span className="text-xs font-bold uppercase tracking-wider text-orange-400 bg-orange-950/60 px-3 py-1 rounded-lg border border-orange-500/30">
          Organizer Portal
        </span>
        <h1 className="text-3xl font-extrabold mt-2 flex items-center gap-3">
          <Store className="w-8 h-8 text-orange-500" />
          Vendor Booking Requests & Notifications
        </h1>
        <p className="text-emerald-200/70 text-sm mt-1">
          Monitor vendor responses, review acceptance status, and track service booking updates.
        </p>
      </div>

      {error && (
        <div className="p-4 bg-red-950/60 border border-red-800/80 rounded-2xl text-red-300 text-xs flex items-center gap-2">
          <AlertCircle className="w-4 h-4 shrink-0" />
          {error}
        </div>
      )}

      {bookings.length === 0 ? (
        <div className="p-12 bg-emerald-950/60 border border-emerald-800 rounded-2xl text-center text-emerald-300/70 text-sm">
          You haven't made any vendor service bookings yet.
        </div>
      ) : (
        <div className="grid grid-cols-1 gap-4">
          {bookings.map((booking) => {
            const isPending = booking.status === 'PENDING';
            const isAccepted = booking.status === 'ACCEPTED';

            return (
              <div
                key={booking.id}
                className="p-6 bg-emerald-950/80 border border-emerald-800/80 rounded-2xl flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4"
              >
                <div className="space-y-2">
                  <div className="flex items-center gap-2 flex-wrap">
                    <span className="text-xs font-bold text-orange-400 bg-orange-950/60 px-2.5 py-1 rounded-lg border border-orange-500/20 uppercase">
                      {booking.package_title}
                    </span>
                    <span
                      className={`text-xs font-semibold px-2.5 py-1 rounded-lg flex items-center gap-1 ${
                        isPending
                          ? 'bg-yellow-950 text-yellow-400 border border-yellow-800/40'
                          : isAccepted
                          ? 'bg-emerald-900 text-emerald-300 border border-emerald-700/40'
                          : 'bg-red-950 text-red-400 border border-red-800/40'
                      }`}
                    >
                      {isPending && <Clock className="w-3.5 h-3.5" />}
                      {isAccepted && <CheckCircle2 className="w-3.5 h-3.5" />}
                      {!isPending && !isAccepted && <XCircle className="w-3.5 h-3.5" />}
                      {booking.status}
                    </span>
                  </div>
                  <h3 className="text-base font-bold text-white">Event: {booking.event_title}</h3>
                  <p className="text-xs text-emerald-300/70 flex items-center gap-1.5">
                    <Calendar className="w-3.5 h-3.5 text-orange-400" />
                    Requested on: {new Date(booking.created_at).toLocaleString()}
                  </p>
                </div>

                <div className="text-right">
                  <span className="text-sm font-extrabold text-orange-400">
                    KES {booking.package_price || '0'}
                  </span>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}