import React, { useState, useEffect } from 'react';
import { Store, CheckCircle, XCircle, Clock, Calendar, AlertCircle, Loader2, Bell, DollarSign, Filter, ChevronLeft, ChevronRight } from 'lucide-react';
import api from '../services/api';

export default function VendorDashboard() {
  const [bookings, setBookings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [actionLoading, setActionLoading] = useState(null);
  
  const [dateFrom, setDateFrom] = useState('');
  const [dateTo, setDateTo] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);

  const fetchBookings = async (page = 1) => {
    try {
      setLoading(true);
      setError('');
      
      const params = { page };
      if (dateFrom) params.date_from = dateFrom;
      if (dateTo) params.date_to = dateTo;

      const response = await api.get('bookings/', { params });
      
      if (response.data && response.data.results !== undefined) {
          setBookings(response.data.results);
          setTotalPages(Math.ceil(response.data.count / 10));
      } else {
          setBookings(response.data);
          setTotalPages(1);
      }
      
      setCurrentPage(page);
    } catch (err) {
      console.error('Failed to fetch bookings:', err);
      setError('Failed to load incoming vendor booking requests.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchBookings(1); 
  }, [dateFrom, dateTo]);

  const handleUpdateStatus = async (bookingId, newStatus) => {
    setActionLoading(bookingId);
    setError('');
    try {
      await api.patch(`bookings/${bookingId}/status/`, { status: newStatus });
      await fetchBookings(currentPage); 
    } catch (err) {
      console.error('Failed to update booking status:', err);
      setError('Failed to update booking status. Please try again.');
    } finally {
      setActionLoading(null);
    }
  };

  return (
    <div className="max-w-6xl mx-auto my-12 p-8 bg-emerald-900/60 border border-emerald-800/80 rounded-3xl shadow-2xl text-white space-y-8">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-end gap-6 border-b border-emerald-800/80 pb-6">
        <div>
          <span className="text-xs font-bold uppercase tracking-wider text-orange-400 bg-orange-950/60 px-3 py-1 rounded-lg border border-orange-500/30 flex items-center gap-1.5 w-max">
            <Bell className="w-3.5 h-3.5" /> Vendor Notifications Portal
          </span>
          <h1 className="text-3xl font-extrabold mt-2 flex items-center gap-3">
            <Store className="w-8 h-8 text-orange-500" />
            Incoming Booking Requests
          </h1>
          <p className="text-emerald-200/70 text-sm mt-1">
            Review event booking inquiries for your services, contact organizers, and track revenue.
          </p>
        </div>

        <div className="bg-emerald-950/80 p-3 rounded-2xl border border-emerald-700/50 flex flex-wrap items-center gap-3 shadow-inner w-full md:w-auto">
          <div className="flex items-center gap-2 text-xs font-bold text-emerald-300">
             <Filter className="w-4 h-4 text-orange-400" /> Filter:
          </div>
          <div className="flex items-center gap-2">
            <input 
              type="date" 
              value={dateFrom}
              onChange={(e) => setDateFrom(e.target.value)}
              className="bg-emerald-900/50 border border-emerald-700 rounded-lg px-2 py-1.5 text-xs text-white focus:outline-none focus:border-orange-500"
            />
            <span className="text-emerald-400/50 text-xs font-bold">to</span>
            <input 
              type="date" 
              value={dateTo}
              onChange={(e) => setDateTo(e.target.value)}
              className="bg-emerald-900/50 border border-emerald-700 rounded-lg px-2 py-1.5 text-xs text-white focus:outline-none focus:border-orange-500"
            />
          </div>
          {(dateFrom || dateTo) && (
             <button 
               onClick={() => { setDateFrom(''); setDateTo(''); }} 
               className="text-[10px] uppercase font-bold text-orange-400 hover:text-orange-300 ml-1"
             >
               Clear
             </button>
          )}
        </div>
      </div>

      {error && (
        <div className="p-4 bg-red-950/60 border border-red-800/80 rounded-2xl text-red-300 text-xs flex items-center gap-2">
          <AlertCircle className="w-4 h-4 shrink-0" />
          {error}
        </div>
      )}

      {loading ? (
        <div className="flex justify-center items-center min-h-[40vh] text-emerald-300">
          <Loader2 className="w-10 h-10 animate-spin text-orange-500" />
        </div>
      ) : bookings.length === 0 ? (
        <div className="p-12 bg-emerald-950/60 border border-emerald-800 rounded-2xl text-center text-emerald-300/70 text-sm space-y-2">
          <p>No incoming booking notifications or requests right now.</p>
        </div>
      ) : (
        <>
          <div className="grid grid-cols-1 gap-6">
            {bookings.map((booking) => {
              const isPending = booking.status === 'PENDING';
              const isAccepted = booking.status === 'ACCEPTED';

              return (
                <div
                  key={booking.id}
                  className="p-6 bg-emerald-950/80 border border-emerald-800/80 rounded-2xl flex flex-col md:flex-row items-start md:items-center justify-between gap-6 shadow-lg"
                >
                  <div className="space-y-3 flex-1">
                    <div className="flex items-center gap-3 flex-wrap">
                      <span className="text-xs font-bold uppercase tracking-wider text-orange-400 bg-orange-950/60 px-2.5 py-1 rounded-lg border border-orange-500/20">
                        Package: {booking.package_title}
                      </span>
                      <span
                        className={`text-xs font-semibold px-2.5 py-1 rounded-lg ${
                          isPending
                            ? 'bg-yellow-950 text-yellow-400 border border-yellow-800/40'
                            : isAccepted
                            ? 'bg-emerald-900 text-emerald-300 border border-emerald-700/40'
                            : 'bg-red-950 text-red-400 border border-red-800/40'
                        }`}
                      >
                        Status: {booking.status}
                      </span>
                      <span className="text-xs font-bold bg-emerald-900/50 text-emerald-300 px-2.5 py-1 rounded-lg border border-emerald-700 flex items-center gap-1">
                         <DollarSign className="w-3.5 h-3.5" />
                         KES {booking.package_price ? parseFloat(booking.package_price).toLocaleString() : 'N/A'}
                      </span>
                    </div>

                    <h3 className="text-lg font-bold text-white">
                      Event: {booking.event_title}
                    </h3>

                    <div className="text-xs text-emerald-300/80 space-y-1">
                      <p>
                        Organizer: <span className="font-semibold text-white">@{booking.organizer_username}</span>
                      </p>
                      <p>Contact Email: <span className="font-semibold text-white">{booking.organizer_email || 'No email provided'}</span></p>
                      <p>Contact Phone: <span className="font-semibold text-white">{booking.organizer_phone || 'No phone provided'}</span></p>
                      <div className="flex items-center gap-1.5 text-emerald-400/90 pt-1">
                        <Calendar className="w-3.5 h-3.5 text-orange-400" />
                        <span>Received: {new Date(booking.created_at).toLocaleString()}</span>
                      </div>
                    </div>
                  </div>

                  <div className="flex items-center gap-3 w-full md:w-auto justify-end pt-4 md:pt-0 border-t md:border-t-0 border-emerald-900">
                    {isPending ? (
                      <>
                        <button
                          disabled={actionLoading === booking.id}
                          onClick={() => handleUpdateStatus(booking.id, 'ACCEPTED')}
                          className="flex-1 md:flex-initial bg-emerald-600 hover:bg-emerald-500 text-white font-bold px-5 py-2.5 rounded-xl text-xs flex items-center justify-center gap-1.5 transition-all shadow-lg shadow-emerald-600/20"
                        >
                          <CheckCircle className="w-4 h-4" />
                          {actionLoading === booking.id ? 'Updating...' : 'Accept Request'}
                        </button>
                        <button
                          disabled={actionLoading === booking.id}
                          onClick={() => handleUpdateStatus(booking.id, 'DECLINED')}
                          className="flex-1 md:flex-initial bg-red-950/60 hover:bg-red-900/80 border border-red-800 text-red-300 font-bold px-5 py-2.5 rounded-xl text-xs flex items-center justify-center gap-1.5 transition-all"
                        >
                          <XCircle className="w-4 h-4" />
                          Decline
                        </button>
                      </>
                    ) : (
                      <span className="text-xs text-emerald-400/70 font-semibold italic">
                        Status Finalized ({booking.status})
                      </span>
                    )}
                  </div>
                </div>
              );
            })}
          </div>

          {totalPages > 1 && (
            <div className="bg-emerald-950/40 p-4 border border-emerald-800/80 rounded-2xl flex justify-between items-center text-sm mt-6 shadow-inner">
               <span className="text-emerald-400/80 font-bold">Page {currentPage} of {totalPages}</span>
               <div className="flex gap-2">
                 <button 
                   onClick={() => fetchBookings(Math.max(1, currentPage - 1))}
                   disabled={currentPage === 1 || loading}
                   className="p-2 rounded-lg bg-emerald-800 hover:bg-emerald-700 disabled:opacity-50 transition-colors border border-emerald-700"
                 ><ChevronLeft className="w-5 h-5 text-white" /></button>
                 <button 
                   onClick={() => fetchBookings(Math.min(totalPages, currentPage + 1))}
                   disabled={currentPage === totalPages || loading}
                   className="p-2 rounded-lg bg-emerald-800 hover:bg-emerald-700 disabled:opacity-50 transition-colors border border-emerald-700"
                 ><ChevronRight className="w-5 h-5 text-white" /></button>
               </div>
            </div>
          )}
        </>
      )}
    </div>
  );
}