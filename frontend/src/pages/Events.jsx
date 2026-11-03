import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Calendar, Loader2, X, Ticket, MapPin, CheckCircle2 } from 'lucide-react';
import EventCard from '../components/EventCard';
import api from '../services/api';

export default function Events() {
  const navigate = useNavigate();
  const [events, setEvents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [selectedEvent, setSelectedEvent] = useState(null);
  const [selectedTier, setSelectedTier] = useState(null);

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

  const handleOpenModal = (event) => {
    setSelectedEvent(event);
    setSelectedTier(null); // Reset tier selection when opening modal
  };

  const handleCloseModal = () => {
    setSelectedEvent(null);
    setSelectedTier(null);
  };

  const handlePurchaseTicket = () => {
    if (!selectedTier || !selectedEvent) return;

    navigate('/payment', {
      state: {
        item: {
          id: selectedTier.id,
          title: `${selectedEvent.title} - ${selectedTier.ticket_type}`,
          price: selectedTier.price,
          description: selectedEvent.description || 'Event Ticket Booking',
        },
        type: 'event_ticket',
      },
    });
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8 text-white relative">
      
      {/* Header */}
      <div className="border-b border-emerald-800/60 pb-6">
        <h1 className="text-3xl sm:text-4xl font-extrabold text-emerald-400 flex items-center gap-3">
          <Calendar className="w-8 h-8 text-orange-500" />
          All Events
        </h1>
        <p className="text-emerald-200/70 mt-1">
          Explore upcoming events and check available ticket tiers.
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
            <EventCard 
              key={event.id} 
              event={event} 
              onCheckTiers={handleOpenModal} 
            />
          ))}
        </div>
      )}

      {/* Event Overview Modal with Blurred Background */}
      {selectedEvent && (
        <div className="fixed inset-0 z-50 flex items-center justify-center px-4">
          {/* Blurred Backdrop */}
          <div 
            className="absolute inset-0 bg-black/70 backdrop-blur-md transition-opacity"
            onClick={handleCloseModal}
          />

          {/* Modal Card Content */}
          <div className="relative bg-emerald-950 border border-emerald-800 rounded-3xl max-w-2xl w-full p-6 sm:p-8 shadow-2xl z-10 space-y-6 overflow-hidden">
            <div className="absolute top-0 right-1/3 w-64 h-64 bg-orange-500/10 rounded-full blur-3xl pointer-events-none" />

            {/* Top-Right X Close Button */}
            <button 
              onClick={handleCloseModal}
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

            {/* Interactive Ticket Tiers */}
            <div>
              <h3 className="text-xs font-bold text-emerald-300 uppercase tracking-wider mb-3">
                Select Available Ticket
              </h3>
              <div className="space-y-3">
                {selectedEvent.ticket_tiers && selectedEvent.ticket_tiers.length > 0 ? (
                  selectedEvent.ticket_tiers.map((tier) => {
                    const isSelected = selectedTier?.id === tier.id;
                    return (
                      <div
                        key={tier.id}
                        onClick={() => setSelectedTier(tier)}
                        className={`flex justify-between items-center p-4 rounded-xl cursor-pointer transition-all border ${
                          isSelected
                            ? 'bg-orange-950/40 border-orange-500 shadow-md shadow-orange-500/10'
                            : 'bg-emerald-900/40 border-emerald-800/60 hover:border-emerald-600'
                        }`}
                      >
                        <div className="flex items-center gap-3">
                          {isSelected && <CheckCircle2 className="w-5 h-5 text-orange-400" />}
                          <div>
                            <span className="font-bold text-white text-sm block">{tier.ticket_type}</span>
                            <span className="text-xs text-emerald-300/70">{tier.quantity_available} available</span>
                          </div>
                        </div>
                        <span className="font-extrabold text-orange-400 text-base">
                          KES {parseFloat(tier.price).toLocaleString()}
                        </span>
                      </div>
                    );
                  })
                ) : (
                  <div className="text-xs text-emerald-300/60">Free Admission / No tickets required</div>
                )}
              </div>
            </div>

            {/* Purchase Ticket Action */}
            {selectedTier && (
              <div className="pt-4 border-t border-emerald-900 flex items-center justify-between">
                <div>
                  <span className="text-xs text-emerald-400/70 block">Total Price</span>
                  <span className="text-xl font-extrabold text-white">
                    KES {parseFloat(selectedTier.price).toLocaleString()}
                  </span>
                </div>

                <button 
                  onClick={handlePurchaseTicket}
                  className="bg-orange-500 hover:bg-orange-600 text-white px-6 py-3 rounded-xl text-sm font-bold shadow-lg shadow-orange-500/25 flex items-center gap-2 transition-all"
                >
                  <Ticket className="w-4 h-4" />
                  Purchase Ticket
                </button>
              </div>
            )}

          </div>
        </div>
      )}

    </div>
  );
}