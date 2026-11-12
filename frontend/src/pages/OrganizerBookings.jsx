import React, { useState, useEffect } from 'react';
import { Calendar, Store, Clock, CheckCircle2, XCircle, AlertCircle, Loader2, DollarSign, Mail, Phone, Ticket, Filter, ChevronLeft, ChevronRight } from 'lucide-react';
import api from '../services/api';

export default function OrganizerBookings() {
  const [activeTab, setActiveTab] = useState('sales');
  const [dashboardData, setDashboardData] = useState({ metrics: {}, sales: [], vendor_bookings: [] });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  // Date Filtering State
  const [dateFrom, setDateFrom] = useState('');
  const [dateTo, setDateTo] = useState('');

  // Pagination State
  const [salesPage, setSalesPage] = useState(1);
  const [vendorsPage, setVendorsPage] = useState(1);
  const itemsPerPage = 10;

  const fetchDashboardData = async () => {
    try {
      setLoading(true);
      setError('');
      
      const params = {};
      if (dateFrom) params.date_from = dateFrom;
      if (dateTo) params.date_to = dateTo;

      const response = await api.get('tickets/organizer/dashboard/', { params });
      setDashboardData(response.data);
      // Reset pagination when data changes
      setSalesPage(1);
      setVendorsPage(1);
    } catch (err) {
      console.error('Failed to fetch organizer data:', err);
      setError('Failed to load dashboard data. Ensure your API is running.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchDashboardData();
  }, [dateFrom, dateTo]);

  const { metrics, sales, vendor_bookings } = dashboardData;

  // Pagination Logic Helpers
  const paginateData = (data, currentPage) => {
    const startIndex = (currentPage - 1) * itemsPerPage;
    return data.slice(startIndex, startIndex + itemsPerPage);
  };
  
  const totalPages = (data) => Math.ceil(data.length / itemsPerPage);

  const paginatedSales = paginateData(sales || [], salesPage);
  const paginatedVendors = paginateData(vendor_bookings || [], vendorsPage);

  return (
    <div className="max-w-6xl mx-auto my-12 p-8 bg-emerald-900/60 border border-emerald-800/80 rounded-3xl shadow-2xl text-white space-y-8">
      <div className="border-b border-emerald-800/80 pb-6 flex flex-col md:flex-row justify-between items-start md:items-end gap-6">
        <div>
          <span className="text-xs font-bold uppercase tracking-wider text-orange-400 bg-orange-950/60 px-3 py-1 rounded-lg border border-orange-500/30">
            Organizer Portal
          </span>
          <h1 className="text-3xl font-extrabold mt-2 flex items-center gap-3">
            <Store className="w-8 h-8 text-orange-500" />
            Manage My Events
          </h1>
          <p className="text-emerald-200/70 text-sm mt-1">
            Track ticket sales, follow up with attendees, and monitor vendor bookings.
          </p>
        </div>

        {/* Date Filters */}
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

      {/* Metric Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="bg-emerald-950/80 border border-emerald-700/50 p-5 rounded-2xl shadow-lg flex items-center gap-4">
          <div className="w-12 h-12 rounded-xl bg-orange-500/20 flex items-center justify-center text-orange-400">
            <DollarSign className="w-6 h-6" />
          </div>
          <div>
            <p className="text-xs text-emerald-300/70 font-bold uppercase">Total Revenue</p>
            {loading ? (
              <Loader2 className="w-5 h-5 animate-spin text-orange-400 mt-1" />
            ) : (
              <p className="text-2xl font-extrabold text-white">KES {metrics?.total_revenue?.toLocaleString() || 0}</p>
            )}
          </div>
        </div>
        <div className="bg-emerald-950/80 border border-emerald-700/50 p-5 rounded-2xl shadow-lg flex items-center gap-4">
          <div className="w-12 h-12 rounded-xl bg-emerald-500/20 flex items-center justify-center text-emerald-400">
            <Ticket className="w-6 h-6" />
          </div>
          <div>
            <p className="text-xs text-emerald-300/70 font-bold uppercase">Tickets Sold</p>
            {loading ? (
              <Loader2 className="w-5 h-5 animate-spin text-emerald-400 mt-1" />
            ) : (
              <p className="text-2xl font-extrabold text-white">{metrics?.completed_sales || 0}</p>
            )}
          </div>
        </div>
        <div className="bg-emerald-950/80 border border-emerald-700/50 p-5 rounded-2xl shadow-lg flex items-center gap-4">
          <div className="w-12 h-12 rounded-xl bg-red-500/20 flex items-center justify-center text-red-400">
            <XCircle className="w-6 h-6" />
          </div>
          <div>
            <p className="text-xs text-emerald-300/70 font-bold uppercase">Failed Payments</p>
            {loading ? (
              <Loader2 className="w-5 h-5 animate-spin text-red-400 mt-1" />
            ) : (
              <p className="text-2xl font-extrabold text-white">{metrics?.failed_sales || 0}</p>
            )}
          </div>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex space-x-2 border-b border-emerald-800/80 mb-6">
        <button
          onClick={() => setActiveTab('sales')}
          className={`px-4 py-3 text-sm font-bold transition-colors border-b-2 ${
            activeTab === 'sales' ? 'border-orange-500 text-orange-400' : 'border-transparent text-emerald-400 hover:text-white'
          }`}
        >
          Attendee & Sales Data
        </button>
        <button
          onClick={() => setActiveTab('vendors')}
          className={`px-4 py-3 text-sm font-bold transition-colors border-b-2 ${
            activeTab === 'vendors' ? 'border-orange-500 text-orange-400' : 'border-transparent text-emerald-400 hover:text-white'
          }`}
        >
          Outgoing Vendor Requests
        </button>
      </div>

      {loading ? (
         <div className="flex justify-center items-center py-20 text-emerald-300">
           <Loader2 className="w-10 h-10 animate-spin text-orange-500" />
         </div>
      ) : (
        <>
          {/* Tab Content: Sales */}
          {activeTab === 'sales' && (
            <div className="bg-emerald-950/60 border border-emerald-800 rounded-2xl overflow-hidden">
              {sales && sales.length > 0 ? (
                <>
                  <div className="overflow-x-auto">
                    <table className="w-full text-left text-sm text-emerald-200">
                      <thead className="bg-emerald-900/80 text-xs uppercase font-bold text-emerald-400">
                        <tr>
                          <th className="px-6 py-4">Attendee</th>
                          <th className="px-6 py-4">Contact</th>
                          <th className="px-6 py-4">Event & Ticket</th>
                          <th className="px-6 py-4">Status</th>
                          <th className="px-6 py-4 text-right">Amount</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-emerald-800/50">
                        {paginatedSales.map((sale) => (
                          <tr key={sale.id} className="hover:bg-emerald-900/30 transition-colors">
                            <td className="px-6 py-4 font-semibold text-white">@{sale.attendee_name}</td>
                            <td className="px-6 py-4 space-y-1 text-xs">
                              <div className="flex items-center gap-1.5"><Mail className="w-3.5 h-3.5 text-emerald-500" /> {sale.attendee_email}</div>
                              <div className="flex items-center gap-1.5"><Phone className="w-3.5 h-3.5 text-emerald-500" /> {sale.attendee_phone}</div>
                            </td>
                            <td className="px-6 py-4">
                              <span className="block font-semibold text-white">{sale.event_title}</span>
                              <span className="text-xs text-emerald-400">{sale.ticket_type}</span>
                            </td>
                            <td className="px-6 py-4">
                              <span className={`px-2.5 py-1 text-[10px] font-bold uppercase rounded-full ${
                                sale.status === 'COMPLETED' ? 'bg-emerald-900 text-emerald-300 border border-emerald-700' : 'bg-red-950 text-red-400 border border-red-800'
                              }`}>
                                {sale.status}
                              </span>
                            </td>
                            <td className="px-6 py-4 text-right font-extrabold text-orange-400">
                              KES {parseFloat(sale.amount).toLocaleString()}
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                  {/* Sales Pagination Controls */}
                  {totalPages(sales) > 1 && (
                    <div className="bg-emerald-900/40 p-4 border-t border-emerald-800 flex justify-between items-center text-sm">
                       <span className="text-emerald-400/80 font-semibold">Page {salesPage} of {totalPages(sales)}</span>
                       <div className="flex gap-2">
                         <button 
                           onClick={() => setSalesPage(p => Math.max(1, p - 1))}
                           disabled={salesPage === 1}
                           className="p-1.5 rounded-lg bg-emerald-800 hover:bg-emerald-700 disabled:opacity-50 transition-colors"
                         ><ChevronLeft className="w-5 h-5 text-white" /></button>
                         <button 
                           onClick={() => setSalesPage(p => Math.min(totalPages(sales), p + 1))}
                           disabled={salesPage === totalPages(sales)}
                           className="p-1.5 rounded-lg bg-emerald-800 hover:bg-emerald-700 disabled:opacity-50 transition-colors"
                         ><ChevronRight className="w-5 h-5 text-white" /></button>
                       </div>
                    </div>
                  )}
                </>
              ) : (
                <div className="p-12 text-center text-emerald-400/60 text-sm">
                  No ticket sales data available for the selected dates.
                </div>
              )}
            </div>
          )}

          {/* Tab Content: Vendors */}
          {activeTab === 'vendors' && (
            <div className="grid grid-cols-1 gap-4">
              {!vendor_bookings || vendor_bookings.length === 0 ? (
                <div className="p-12 bg-emerald-950/60 border border-emerald-800 rounded-2xl text-center text-emerald-300/70 text-sm">
                  No vendor service bookings found for the selected dates.
                </div>
              ) : (
                <>
                  {paginatedVendors.map((booking) => {
                    const isPending = booking.status === 'PENDING';
                    const isAccepted = booking.status === 'ACCEPTED';
                    return (
                      <div key={booking.id} className="p-6 bg-emerald-950/80 border border-emerald-800/80 rounded-2xl flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
                        <div className="space-y-2">
                          <div className="flex items-center gap-2 flex-wrap">
                            <span className="text-xs font-bold text-orange-400 bg-orange-950/60 px-2.5 py-1 rounded-lg border border-orange-500/20 uppercase">
                              {booking.package_title}
                            </span>
                            <span className={`text-xs font-semibold px-2.5 py-1 rounded-lg flex items-center gap-1 ${
                              isPending ? 'bg-yellow-950 text-yellow-400 border border-yellow-800/40' : 
                              isAccepted ? 'bg-emerald-900 text-emerald-300 border border-emerald-700/40' : 
                              'bg-red-950 text-red-400 border border-red-800/40'
                            }`}>
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
                          <span className="text-lg font-extrabold text-orange-400">
                            KES {parseFloat(booking.package_price || '0').toLocaleString()}
                          </span>
                        </div>
                      </div>
                    );
                  })}
                  
                  {/* Vendors Pagination Controls */}
                  {totalPages(vendor_bookings) > 1 && (
                    <div className="flex justify-between items-center text-sm mt-4 p-2">
                       <span className="text-emerald-400/80 font-semibold">Page {vendorsPage} of {totalPages(vendor_bookings)}</span>
                       <div className="flex gap-2">
                         <button 
                           onClick={() => setVendorsPage(p => Math.max(1, p - 1))}
                           disabled={vendorsPage === 1}
                           className="px-3 py-1.5 rounded-lg font-bold bg-emerald-800 hover:bg-emerald-700 text-white disabled:opacity-50 transition-colors"
                         >Previous</button>
                         <button 
                           onClick={() => setVendorsPage(p => Math.min(totalPages(vendor_bookings), p + 1))}
                           disabled={vendorsPage === totalPages(vendor_bookings)}
                           className="px-3 py-1.5 rounded-lg font-bold bg-emerald-800 hover:bg-emerald-700 text-white disabled:opacity-50 transition-colors"
                         >Next</button>
                       </div>
                    </div>
                  )}
                </>
              )}
            </div>
          )}
        </>
      )}
    </div>
  );
}