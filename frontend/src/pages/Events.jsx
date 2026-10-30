import { useState, useEffect } from 'react';
import { Calendar, Loader2, X, Ticket, MapPin } from 'lucide-react';
import EventCard from '../components/EventCard';
import api from '../services/api';

export default function Events() {
  const [events, setEvents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [selectedEvent, setSelectedEvent] = useState(null);

  useEffect(() => {
    api.get('/events/')
      .then((response) => {
        setEvents(response.data);
      })
      .catch((err) => {
        console.error('Failed to fetch events:', err);
        setError('Unable to load events at this time.');
      })
      .finally(() => {
        setLoading(false);
      });
  }, []);

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8 text-white relative">
      
      {/* Header */}
      <div className="border-b border-emerald-800/60 pb-6">
        <h1 className="text-3xl sm:text-4xl font-extrabold text-emerald-400 flex items-center gap-3">
          <Calendar className="w-8 h-8 text-orange-500" />
          All Events
        </h1>
        <p className="text-emerald-200/70 mt-1">
          Explore all upcoming tech summits, conferences, and community meetups. Click any card for details.
        </p>
      </div>

      {/* Events Grid */}
      {loading ? (
        <div className="flex items-center justify-center py-20">
          <Loader2 className="w-10 h-10 animate-spin text-orange-500" />
        </div>
      ) : error ? (
        <div className="p-6 bg-emerald-900/40 border border-emerald-800 rounded-2xl text-center text-emerald-200 text-sm">
          {error}
        </div>
      ) : events.length === 0 ? (
        <div className="p-12 bg-emerald-900/40 border border-emerald-800 rounded-2xl text-center space-y-2">
          <p className="text-emerald-200 text-base font-medium">No events available right now.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {events.map((event) => (
            <div 
              key={event.id} 
              onClick={() => setSelectedEvent(event)}
              className="cursor-pointer transform transition-all hover:-translate-y-1"
            >
              <EventCard event={event} />
            </div>
          ))}
        </div>
      )}

      {/* Event Overview Modal with Backdrop Blur */}
      {selectedEvent && (
        <div className="fixed inset-0 z-50 flex items-center justify-center px-4">
          {/* Blurred Backdrop */}
          <div 
            className="absolute inset-0 bg-black/70 backdrop-blur-md transition-opacity"
            onClick={() => setSelectedEvent(null)}
          />

          {/* Modal Card Content */}
          <div className="relative bg-emerald-950 border border-emerald-800 rounded-3xl max-w-2xl w-full p-6 sm:p-8 shadow-2xl z-10 space-y-6 overflow-hidden">
            <div className="absolute top-0 right-1/3 w-64 h-64 bg-orange-500/10 rounded-full blur-3xl pointer-events-none" />

            {/* Close Button */}
            <button 
              onClick={() => setSelectedEvent(null)}
              className="absolute top-4 right-4 bg-emerald-900/80 hover:bg-emerald-800 text-emerald-200 p-2 rounded-full transition-colors"
            >
              <X className="w-5 h-5" />
            </button>

            {/* Modal Header */}
            <div>
              <span className="text-xs font-bold uppercase tracking-wider text-orange-400 bg-orange-950/60 px-3 py-1 rounded-lg border border-orange-500/30">
                Event Overview
              </span>
              <h2 className="text-2xl sm:text-3xl font-extrabold text-white mt-3">
                {selectedEvent.title}
              </h2>
            </div>

            {/* Description */}
            <p className="text-emerald-100/90 text-sm sm:text-base leading-relaxed">
              {selectedEvent.description}
            </p>

            {/* Metadata Info */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 py-4 border-y border-emerald-900">
              <div className="flex items-center gap-3 text-emerald-200 text-sm">
                <Calendar className="w-5 h-5 text-orange-400 flex-shrink-0" />
                <span>{new Date(selectedEvent.date || selectedEvent.created_at).toLocaleDateString()}</span>
              </div>
              <div className="flex items-center gap-3 text-emerald-200 text-sm">
                <MapPin className="w-5 h-5 text-orange-400 flex-shrink-0" />
                <span>{selectedEvent.location || 'Nairobi, Kenya'}</span>
              </div>
            </div>

            {/* Ticket Tiers Preview */}
            <div>
              <h3 className="text-sm font-bold text-emerald-300 uppercase tracking-wider mb-3">Available Tickets</h3>
              <div className="space-y-2">
                {selectedEvent.ticket_tiers && selectedEvent.ticket_tiers.length > 0 ? (
                  selectedEvent.ticket_tiers.map((tier) => (
                    <div key={tier.id} className="flex justify-between items-center bg-emerald-900/40 border border-emerald-800/60 p-3 rounded-xl">
                      <div>
                        <span className="font-bold text-white text-sm">{tier.ticket_type}</span>
                        <span className="text-xs text-emerald-300/70 block">{tier.quantity_available} available</span>
                      </div>
                      <span className="font-extrabold text-orange-400 text-sm">KES {parseFloat(tier.price).toLocaleString()}</span>
                    </div>
                  ))
                ) : (
                  <div className="text-xs text-emerald-300/60">Free Admission / No tickets required</div>
                )}
              </div>
            </div>

            {/* Action Buttons */}
            <div className="flex items-center justify-end gap-3 pt-2">
              <button 
                onClick={() => setSelectedEvent(null)}
                className="px-5 py-2.5 rounded-xl text-sm font-semibold text-emerald-300 hover:bg-emerald-900/50 transition-colors"
              >
                Close
              </button>
              <button 
                onClick={() => {
                  alert(`Proceeding to ticket booking for: ${selectedEvent.title}`);
                  setSelectedEvent(null);
                }}
                className="bg-orange-500 hover:bg-orange-600 text-white px-6 py-2.5 rounded-xl text-sm font-bold shadow-lg shadow-orange-500/25 flex items-center gap-2 transition-transform transform hover:-translate-y-0.5"
              >
                <Ticket className="w-4 h-4" />
                Book Ticket Now
              </button>
            </div>

          </div>
        </div>
      )}

    </div>
  );
}